import { NextRequest, NextResponse } from "next/server";

/**
 * Public endpoint that serves recipe data as JSON-LD/schema.org markup.
 * Bring! fetches this URL and imports the ingredients from the structured data.
 *
 * Query params:
 * - title: Recipe name
 * - items: Comma-separated ingredients (e.g. "250g Nudeln,100g Käse,2 Eier")
 * - servings: Number of servings
 * - image: Optional image URL for the recipe
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "Rezept";
  const itemsRaw = searchParams.get("items") || "";
  const servings = searchParams.get("servings") || "4";
  const image = searchParams.get("image") || "";

  // Decode and split ingredients
  const ingredients = itemsRaw
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  // Build JSON-LD structured data
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: title,
    recipeYield: `${servings} Portionen`,
    recipeIngredient: ingredients,
  };

  if (image) {
    jsonLd.image = image;
    jsonLd.thumbnailUrl = image;
  }

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} – Rezeptretter</title>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; color: #333; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .meta { color: #888; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .hero { width: 100%; border-radius: 12px; margin-bottom: 1.5rem; aspect-ratio: 4/3; object-fit: cover; }
    ul { list-style: none; padding: 0; }
    li { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  ${image ? `<img class="hero" src="${escapeHtml(image)}" alt="${escapeHtml(title)}" />` : ""}
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${servings} Portionen · Rezeptretter</p>
  <h2>Zutaten</h2>
  <ul>
    ${ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("\n    ")}
  </ul>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
