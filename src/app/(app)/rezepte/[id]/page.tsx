import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RezeptDetailClient from "./rezept-detail-client";
import type { Metadata } from "next";

/* ──────────────────────────────────────────────
 * generateMetadata – Dynamic SEO tags
 * ──────────────────────────────────────────────*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("title, image_url")
    .eq("id", id)
    .single();

  if (!recipe) {
    return { title: "Rezept nicht gefunden" };
  }

  return {
    title: `${recipe.title} – Rezeptretter`,
    openGraph: {
      title: recipe.title,
      images: recipe.image_url ? [recipe.image_url] : [],
    },
  };
}

/* ──────────────────────────────────────────────
 * Page – Server Component
 * ──────────────────────────────────────────────*/
export default async function RezeptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Load recipe + ingredients + steps in parallel
  const [recipeResult, ingredientsResult, stepsResult] = await Promise.all([
    supabase.from("recipes").select("*").eq("id", id).single(),
    supabase
      .from("ingredients")
      .select("*")
      .eq("recipe_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("steps")
      .select("*")
      .eq("recipe_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (recipeResult.error || !recipeResult.data) {
    notFound();
  }

  // Map DB columns to our TypeScript interface
  const recipe = {
    ...recipeResult.data,
    imageUrl: recipeResult.data.image_url,
  };

  return (
    <RezeptDetailClient
      recipe={recipe}
      ingredients={ingredientsResult.data || []}
      steps={stepsResult.data || []}
    />
  );
}
