import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { ParsedRecipe, Ingredient, Step } from "@/lib/types";

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

/* eslint-disable @typescript-eslint/no-explicit-any */
function findRecipeInJsonLd(data: any): any | null {
  if (!data) return null;

  // Direct Recipe type
  if (data["@type"] === "Recipe") return data;

  // Array of types (e.g., ["Recipe", "Thing"])
  if (Array.isArray(data["@type"]) && data["@type"].includes("Recipe"))
    return data;

  // @graph array
  if (data["@graph"] && Array.isArray(data["@graph"])) {
    for (const item of data["@graph"]) {
      const result = findRecipeInJsonLd(item);
      if (result) return result;
    }
  }

  // Array of objects
  if (Array.isArray(data)) {
    for (const item of data) {
      const result = findRecipeInJsonLd(item);
      if (result) return result;
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

/* ──────────────────────────────────────────────
 * Utility Functions
 * ──────────────────────────────────────────────*/

function extractText(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return extractText(value[0]);
  if (typeof value === "object" && value.name) return value.name;
  return null;
}

function extractImage(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first.url) return first.url;
  }
  if (typeof value === "object") {
    if (value.url) return value.url;
    if (value["@id"]) return value["@id"];
  }
  return null;
}

/** Parse ISO 8601 duration (PT25M, PT1H30M) to minutes */
function parseDuration(value: any): number | null {
  if (!value || typeof value !== "string") return null;

  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) {
    // Try plain number
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  }

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 + minutes || null;
}

function parseServings(value: any): number | null {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return parseServings(value[0]);
  if (typeof value === "string") {
    const num = parseInt(value.replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

function parseIngredients(data: any): Ingredient[] {
  if (!data || !Array.isArray(data)) return [];

  return data
    .filter((item: any) => {
      const text = typeof item === "string" ? item : item?.text || item?.name;
      return text && text.trim().length > 0;
    })
    .map((item: any, index: number) => {
      const text = typeof item === "string" ? item.trim() : (item?.text || item?.name || "").trim();
      const { amount, name } = splitIngredient(text);
      return { amount, name, sort_order: index };
    });
}

/** Split "250g Pasta" → { amount: "250g", name: "Pasta" } */
function splitIngredient(text: string): { amount: string; name: string } {
  // Match patterns like "250 g Pasta", "2 EL Olivenöl", "1/2 Zitrone"
  const match = text.match(
    /^([\d/.,]+\s*(?:g|kg|ml|l|EL|TL|Prise|Stück|Scheibe[n]?|Dose[n]?|Bund|Zehe[n]?|Becher|Packung|Pck\.?|Tasse[n]?|Cup[s]?|oz|lb)?\.?\s*)/i
  );

  if (match && match[1].trim()) {
    return {
      amount: match[1].trim(),
      name: text.slice(match[1].length).trim(),
    };
  }

  return { amount: "", name: text };
}

function parseSteps(data: any): Step[] {
  if (!data) return [];

  // String of instructions (split by newlines or sentences)
  if (typeof data === "string") {
    return data
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10)
      .map((desc, i) => ({
        step_number: i + 1,
        title: null,
        description: desc,
        timer_seconds: null,
        tip: null,
      }));
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((item: any, index: number) => {
      // HowToStep or HowToSection
      if (typeof item === "string") {
        return {
          step_number: index + 1,
          title: null,
          description: item.trim(),
          timer_seconds: null,
          tip: null,
        };
      }

      // HowToSection with itemListElement
      if (item["@type"] === "HowToSection" && item.itemListElement) {
        const sectionSteps = parseSteps(item.itemListElement);
        return sectionSteps.map((s) => ({
          ...s,
          title: extractText(item.name),
        }));
      }

      return {
        step_number: index + 1,
        title: extractText(item.name) || null,
        description: extractText(item.text) || extractText(item.description) || "",
        timer_seconds: null,
        tip: null,
      };
    })
    .flat()
    .filter((s: Step) => s.description && s.description.length > 0)
    .map((s: Step, i: number) => ({ ...s, step_number: i + 1 }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function extractSourceName(url: URL): string {
  const host = url.hostname.replace("www.", "");
  const nameMap: Record<string, string> = {
    "chefkoch.de": "Chefkoch",
    "lecker.de": "Lecker",
    "eatsmarter.de": "EatSmarter",
    "instagram.com": "Instagram",
    "youtube.com": "YouTube",
    "tiktok.com": "TikTok",
    "kitchen-stories.com": "Kitchen Stories",
    "rezeptwelt.de": "Rezeptwelt",
    "kochbar.de": "Kochbar",
    "gutekueche.de": "Gute Küche",
    "springlane.de": "Springlane",
    "cookidoo.de": "Cookidoo",
  };
  return nameMap[host] || host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
}
