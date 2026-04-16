/* ──────────────────────────────────────────────
 * parse-recipe utility functions
 * Extracted from route.ts for testability
 * ──────────────────────────────────────────────*/
import type { Ingredient, Step } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function extractText(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return extractText(value[0]);
  if (typeof value === "object" && value.name) return value.name;
  return null;
}

export function extractImage(value: any): string | null {
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
export function parseDuration(value: any): number | null {
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

export function parseServings(value: any): number | null {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return parseServings(value[0]);
  if (typeof value === "string") {
    const num = parseInt(value.replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

export function parseIngredients(data: any): Ingredient[] {
  if (!data || !Array.isArray(data)) return [];

  return data
    .filter((item: any) => {
      const text = typeof item === "string" ? item : item?.text || item?.name;
      return text && text.trim().length > 0;
    })
    .map((item: any, index: number) => {
      const text =
        typeof item === "string"
          ? item.trim()
          : (item?.text || item?.name || "").trim();
      const { amount, name } = splitIngredient(text);
      return { amount, name, sort_order: index };
    });
}

/** Split "250g Pasta" → { amount: "250g", name: "Pasta" } */
export function splitIngredient(text: string): {
  amount: string;
  name: string;
} {
  // Match patterns like "250 g Pasta", "2 EL Olivenöl", "1/2 Zitrone"
  const match = text.match(
    /^([\d/.,]+\s*(?:g|kg|ml|l|EL|TL|Prise|Stück|Scheibe[n]?|Dose[n]?|Bund|Zehe[n]?|Becher|Packung|Pck\.?\s*|Tasse[n]?|Cup[s]?|oz|lb)?\.?\s*)/i,
  );

  if (match && match[1].trim()) {
    return {
      amount: match[1].trim(),
      name: text.slice(match[1].length).trim(),
    };
  }

  return { amount: "", name: text };
}

export function parseSteps(data: any): Step[] {
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
        description:
          extractText(item.text) || extractText(item.description) || "",
        timer_seconds: null,
        tip: null,
      };
    })
    .flat()
    .filter((s: Step) => s.description && s.description.length > 0)
    .map((s: Step, i: number) => ({ ...s, step_number: i + 1 }));
}

export function findRecipeInJsonLd(data: any): any | null {
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

export function extractSourceName(url: URL): string {
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
  return (
    nameMap[host] ||
    host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1)
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
