/* ──────────────────────────────────────────────
 * Social Media Recipe Parser
 * Extracts recipes from Instagram posts using
 * Open Graph metadata + Gemini AI vision.
 * ──────────────────────────────────────────────*/
import * as cheerio from "cheerio";
import { generateContent } from "@/lib/gemini";
import type { Ingredient, Step } from "@/lib/types";

/* ── URL Detection ── */

const SOCIAL_PATTERNS = [
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\//i,
  /^https?:\/\/(www\.)?instagr\.am\//i,
  /^https?:\/\/vm\.tiktok\.com\//i,
  /^https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\//i,
];

/**
 * Check if a URL is a supported social media platform.
 */
export function isSocialMediaUrl(url: URL): boolean {
  const href = url.href;
  return SOCIAL_PATTERNS.some((pattern) => pattern.test(href));
}

/* ── OG Metadata Extraction ── */

export interface OgMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

/**
 * Extract Open Graph metadata from HTML.
 */
export function extractOgMetadata($: cheerio.CheerioAPI): OgMetadata {
  return {
    title:
      $('meta[property="og:title"]').attr("content")?.trim() || null,
    description:
      $('meta[property="og:description"]').attr("content")?.trim() || null,
    image:
      $('meta[property="og:image"]').attr("content")?.trim() || null,
    siteName:
      $('meta[property="og:site_name"]').attr("content")?.trim() || null,
  };
}

/* ── Image Fetching ── */

/**
 * Fetch an image URL and return it as base64 with its MIME type.
 */
async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Rezeptretter/1.0; +https://rezeptretter.de)",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType =
      response.headers.get("content-type") || "image/jpeg";
    const mimeType = contentType.split(";")[0].trim();
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return { base64, mimeType };
  } catch {
    return null;
  }
}

/* ── Gemini Prompt ── */

const RECIPE_EXTRACTION_PROMPT = `Du bist ein Rezept-Extrahierungs-Experte. Analysiere den folgenden Social-Media-Post und extrahiere das Rezept als strukturiertes JSON.

REGELN:
- Extrahiere Titel, Portionen, Zubereitungszeit (in Minuten), Zutaten und Schritte
- Trenne bei Zutaten immer Menge (z.B. "200g", "2 EL", "1") vom Namen (z.B. "Pasta", "Olivenöl")
- Wenn keine Portionsangabe vorhanden, schätze sinnvoll (meist 2-4)
- Wenn keine Zeitangabe vorhanden, schätze basierend auf den Schritten
- Formuliere Schritte klar, prägnant und auf Deutsch
- Wenn der Post KEIN Rezept enthält, setze "error" auf "Kein Rezept erkannt"
- Antworte AUSSCHLIESSLICH mit validem JSON, kein Markdown, keine Erklärung

FORMAT:
{
  "title": "Rezeptname",
  "servings": 4,
  "cooking_time": 30,
  "ingredients": [
    {"amount": "200g", "name": "Pasta"},
    {"amount": "2 EL", "name": "Olivenöl"}
  ],
  "steps": [
    {"description": "Wasser in einem großen Topf zum Kochen bringen."},
    {"description": "Pasta hinzufügen und al dente kochen."}
  ]
}

POST-TEXT:
`;

/* ── Main Parser ── */

interface GeminiRecipeResponse {
  title?: string;
  servings?: number;
  cooking_time?: number;
  ingredients?: Array<{ amount?: string; name?: string }>;
  steps?: Array<{ description?: string }>;
  error?: string;
}

/**
 * Parse a social media post into a structured recipe using Gemini AI.
 * Returns null if no recipe could be extracted.
 */
export async function parseSocialMediaRecipe(
  $: cheerio.CheerioAPI
): Promise<{
  title: string;
  image_url: string | null;
  cooking_time: number | null;
  servings: number | null;
  difficulty: string | null;
  ingredients: Ingredient[];
  steps: Step[];
} | null> {
  const og = extractOgMetadata($);

  // We need at least a description (caption) to work with
  const caption = og.description || og.title;
  if (!caption || caption.length < 20) {
    return null;
  }

  // Build the prompt with caption text
  const prompt = RECIPE_EXTRACTION_PROMPT + caption;

  // Try to fetch the image for multimodal analysis
  let imageData: { base64: string; mimeType: string } | null = null;
  if (og.image) {
    imageData = await fetchImageAsBase64(og.image);
  }

  // Call Gemini
  let responseText: string;
  try {
    responseText = await generateContent(prompt, {
      imageBase64: imageData?.base64,
      imageMimeType: imageData?.mimeType,
      responseMimeType: "application/json",
    });
  } catch (err) {
    console.error("[Social Parser] Gemini API error:", err);
    return null;
  }

  // Parse the JSON response
  let parsed: GeminiRecipeResponse;
  try {
    // Clean up response – sometimes Gemini wraps in markdown code blocks
    const cleaned = responseText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[Social Parser] Failed to parse Gemini JSON:", responseText);
    return null;
  }

  // Check for explicit error
  if (parsed.error) {
    return null;
  }

  // Validate minimum data
  if (!parsed.title || !parsed.ingredients?.length) {
    return null;
  }

  // Normalize to our types
  const ingredients: Ingredient[] = (parsed.ingredients || [])
    .filter((ing) => ing.name)
    .map((ing, i) => ({
      amount: (ing.amount || "").trim(),
      name: (ing.name || "").trim(),
      sort_order: i,
    }));

  const steps: Step[] = (parsed.steps || [])
    .filter((s) => s.description)
    .map((s, i) => ({
      step_number: i + 1,
      title: null,
      description: (s.description || "").trim(),
      timer_seconds: null,
      tip: null,
    }));

  return {
    title: parsed.title,
    image_url: og.image || null,
    cooking_time: parsed.cooking_time ?? null,
    servings: parsed.servings ?? null,
    difficulty: null,
    ingredients,
    steps,
  };
}
