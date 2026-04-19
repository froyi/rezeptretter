import { NextRequest, NextResponse } from "next/server";

/**
 * Public endpoint that serves recipe data as JSON-LD/schema.org markup.
 * Bring! fetches this URL and imports the ingredients from the structured data.
 *
 * Query params:
 * - title: Recipe name
 * - items: Pipe-separated ingredients (e.g. "250g Nudeln|100g Käse|2 Eier")
 * - servings: Number of servings
 * - image: Optional image URL for the recipe
 * - cookTime: Optional cooking time in minutes
 * - category: Optional comma-separated categories
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "Rezept";
  const itemsRaw = searchParams.get("items") || "";
  const servings = searchParams.get("servings") || "4";
  const image = searchParams.get("image") || "";
  const cookTime = searchParams.get("cookTime") || "";
  const category = searchParams.get("category") || "";

  // Decode and split ingredients (pipe-separated to avoid comma conflicts)
  const ingredients = itemsRaw
    .split("|")
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

  if (cookTime) {
    const minutes = parseInt(cookTime, 10);
    if (!isNaN(minutes) && minutes > 0) {
      jsonLd.totalTime = `PT${minutes}M`;
      jsonLd.cookTime = `PT${minutes}M`;
    }
  }

  if (category) {
    jsonLd.recipeCategory = category.split(",").map((c) => c.trim()).filter(Boolean);
  }

  // Build description from first few ingredients
  const description = `${title} – ${servings} Portionen, ${ingredients.length} Zutaten. Von Rezeptretter.`;

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} – Rezeptretter</title>

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(description)}" />
  <meta property="og:site_name" content="Rezeptretter" />
  ${image ? `<meta property="og:image" content="${escapeAttr(image)}" />` : ""}

  <!-- JSON-LD for Bring! & SEO -->
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; color: #333; background: #fafaf8; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.1rem; color: #555; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .meta { color: #888; font-size: 0.9rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; }
    .meta span { display: flex; align-items: center; gap: 0.25rem; }
    .hero { width: 100%; border-radius: 12px; margin-bottom: 1.5rem; aspect-ratio: 4/3; object-fit: cover; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 0.6rem 0; border-bottom: 1px solid #eee; font-size: 0.95rem; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; color: #aaa; font-size: 0.8rem; text-align: center; }
  </style>
</head>
<body>
  ${image ? `<img class="hero" src="${escapeAttr(image)}" alt="${escapeAttr(title)}" />` : ""}
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">
    <span>🍽 ${servings} Portionen</span>
    ${cookTime ? `<span>⏱ ${cookTime} Min.</span>` : ""}
    ${category ? `<span>📂 ${escapeHtml(category)}</span>` : ""}
  </div>
  <h2>Zutaten</h2>
  <ul>
    ${ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("\n    ")}
  </ul>
  <p class="footer">Erstellt mit Rezeptretter</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
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

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
