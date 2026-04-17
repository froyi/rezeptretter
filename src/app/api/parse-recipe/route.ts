import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { ParsedRecipe } from "@/lib/types";
import {
  extractText,
  extractImage,
  parseDuration,
  parseServings,
  parseIngredients,
  parseSteps,
  findRecipeInJsonLd,
  extractSourceName,
} from "./utils";
import {
  isSocialMediaUrl,
  parseSocialMediaRecipe,
} from "./social-media-parser";

/* ──────────────────────────────────────────────
 * Rate Limiting (in-memory, per IP)
 * Limits AI-powered social media imports to prevent
 * excessive Gemini API usage. Resets hourly.
 * ──────────────────────────────────────────────*/
const AI_RATE_LIMIT = 20; // max AI imports per hour per IP
const AI_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  // Remove entries outside the window
  const recent = timestamps.filter((t) => now - t < AI_RATE_WINDOW_MS);
  rateLimitMap.set(ip, recent);
  return recent.length < AI_RATE_LIMIT;
}

function recordRateLimitHit(ip: string): void {
  const timestamps = rateLimitMap.get(ip) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(ip, timestamps);
}

/* ──────────────────────────────────────────────
 * POST /api/parse-recipe
 * Body: { url: string }
 * Returns: ParsedRecipe | { error: string }
 * ──────────────────────────────────────────────*/
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL ist erforderlich." },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Ungültige URL. Bitte eine gültige Webadresse eingeben." },
        { status: 400 }
      );
    }

    // Fetch the page with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let html: string;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; Rezeptretter/1.0; +https://rezeptretter.de)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Die Seite konnte nicht geladen werden (${response.status}).`,
          },
          { status: 422 }
        );
      }

      html = await response.text();
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "Timeout – die Seite antwortet nicht." },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: "Die Seite konnte nicht abgerufen werden." },
        { status: 422 }
      );
    }

    const $ = cheerio.load(html);

    // Strategy 0: Social Media (Instagram/TikTok) via Gemini AI
    if (isSocialMediaUrl(parsedUrl)) {
      // Rate limit AI imports
      const clientIp =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      if (!checkRateLimit(clientIp)) {
        return NextResponse.json(
          {
            error:
              "Zu viele KI-Imports. Bitte warte eine Stunde und versuche es erneut.",
          },
          { status: 429 }
        );
      }

      recordRateLimitHit(clientIp);
      const socialRecipe = await parseSocialMediaRecipe($);
      if (socialRecipe) {
        return NextResponse.json({
          ...socialRecipe,
          source_url: url,
          source_name: extractSourceName(parsedUrl),
        });
      }
      // If Gemini couldn't extract a recipe, return a clear error
      return NextResponse.json(
        {
          error:
            "Kein Rezept erkannt. Der Post scheint kein Rezept zu enthalten, oder die KI konnte es nicht extrahieren.",
        },
        { status: 404 }
      );
    }

    // Strategy 1: Schema.org JSON-LD
    const recipe = parseSchemaOrgJsonLd($);
    if (recipe) {
      return NextResponse.json({
        ...recipe,
        source_url: url,
        source_name: extractSourceName(parsedUrl),
      });
    }

    // Strategy 2: Schema.org Microdata
    const microdataRecipe = parseMicrodata($);
    if (microdataRecipe) {
      return NextResponse.json({
        ...microdataRecipe,
        source_url: url,
        source_name: extractSourceName(parsedUrl),
      });
    }

    // Strategy 3: HTML heuristic fallback
    const heuristicRecipe = parseHeuristic($);
    if (heuristicRecipe && heuristicRecipe.title) {
      return NextResponse.json({
        ...heuristicRecipe,
        source_url: url,
        source_name: extractSourceName(parsedUrl),
      });
    }

    return NextResponse.json(
      {
        error:
          "Kein Rezept gefunden. Die Seite enthält keine strukturierten Rezeptdaten.",
      },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { error: "Interner Fehler beim Parsen." },
      { status: 500 }
    );
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ──────────────────────────────────────────────
 * Schema.org JSON-LD Parser
 * ──────────────────────────────────────────────*/
function parseSchemaOrgJsonLd(
  $: cheerio.CheerioAPI
): Omit<ParsedRecipe, "source_url" | "source_name"> | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const text = $(scripts[i]).html();
      if (!text) continue;

      const json = JSON.parse(text);
      const recipeData = findRecipeInJsonLd(json);
      if (recipeData) {
        return normalizeSchemaRecipe(recipeData);
      }
    } catch {
      continue;
    }
  }
  return null;
}

function normalizeSchemaRecipe(
  data: any
): Omit<ParsedRecipe, "source_url" | "source_name"> {
  return {
    title: extractText(data.name) || "Unbenanntes Rezept",
    image_url: extractImage(data.image),
    cooking_time: parseDuration(data.totalTime || data.cookTime || data.prepTime),
    servings: parseServings(data.recipeYield),
    difficulty: extractText(data.recipeDifficulty) || null,
    ingredients: parseIngredients(data.recipeIngredient),
    steps: parseSteps(data.recipeInstructions),
  };
}

/* ──────────────────────────────────────────────
 * Microdata Parser
 * ──────────────────────────────────────────────*/
function parseMicrodata(
  $: cheerio.CheerioAPI
): Omit<ParsedRecipe, "source_url" | "source_name"> | null {
  const recipeEl = $('[itemtype*="schema.org/Recipe"]');
  if (recipeEl.length === 0) return null;

  const title =
    recipeEl.find('[itemprop="name"]').first().text().trim() ||
    $("h1").first().text().trim();
  const image =
    recipeEl.find('[itemprop="image"]').first().attr("src") ||
    recipeEl.find('[itemprop="image"]').first().attr("content");
  const totalTime =
    recipeEl.find('[itemprop="totalTime"]').first().attr("content") ||
    recipeEl.find('[itemprop="cookTime"]').first().attr("content");
  const yieldStr =
    recipeEl.find('[itemprop="recipeYield"]').first().text().trim() ||
    recipeEl.find('[itemprop="recipeYield"]').first().attr("content");

  const ingredientEls = recipeEl.find('[itemprop="recipeIngredient"]');
  const ingredientTexts: string[] = [];
  ingredientEls.each((_, el) => {
    const text = $(el).text().trim();
    if (text) ingredientTexts.push(text);
  });

  const stepEls = recipeEl.find('[itemprop="recipeInstructions"]');
  const stepTexts: string[] = [];
  stepEls.each((_, el) => {
    const text = $(el).text().trim();
    if (text) stepTexts.push(text);
  });

  if (!title) return null;

  return {
    title,
    image_url: image || null,
    cooking_time: parseDuration(totalTime || null),
    servings: parseServings(yieldStr || null),
    difficulty: null,
    ingredients: parseIngredients(ingredientTexts),
    steps: parseSteps(stepTexts),
  };
}

/* ──────────────────────────────────────────────
 * HTML Heuristic Fallback
 * ──────────────────────────────────────────────*/
function parseHeuristic(
  $: cheerio.CheerioAPI
): Omit<ParsedRecipe, "source_url" | "source_name"> | null {
  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim();
  const image =
    $('meta[property="og:image"]').attr("content") ||
    $("article img").first().attr("src") ||
    $("main img").first().attr("src");

  if (!title) return null;

  return {
    title,
    image_url: image || null,
    cooking_time: null,
    servings: null,
    difficulty: null,
    ingredients: [],
    steps: [],
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
