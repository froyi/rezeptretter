import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KochmodusClient from "./kochmodus-client";
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
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: recipe
      ? `Kochmodus – ${recipe.title} | Rezeptretter`
      : "Kochmodus | Rezeptretter",
  };
}

/* ──────────────────────────────────────────────
 * Page – Server Component
 * ──────────────────────────────────────────────*/
export default async function KochmodusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ portionen?: string }>;
}) {
  const { id } = await params;
  const { portionen } = await searchParams;
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

  const recipe = recipeResult.data;
  const originalServings = recipe.servings || 4;
  const currentServings = portionen ? parseInt(portionen, 10) || originalServings : originalServings;

  return (
    <KochmodusClient
      recipe={recipe}
      ingredients={ingredientsResult.data || []}
      steps={stepsResult.data || []}
      originalServings={originalServings}
      currentServings={currentServings}
    />
  );
}
