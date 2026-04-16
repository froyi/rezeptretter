import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BearbeitenClient } from "./bearbeiten-client";
import type { Metadata } from "next";

/* ──────────────────────────────────────────────
 * generateMetadata
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
      ? `${recipe.title} bearbeiten | Rezeptretter`
      : "Rezept bearbeiten | Rezeptretter",
  };
}

/* ──────────────────────────────────────────────
 * Page – Server Component
 * ──────────────────────────────────────────────*/
export default async function BearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

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

  return (
    <BearbeitenClient
      recipe={recipeResult.data}
      ingredients={ingredientsResult.data || []}
      steps={stepsResult.data || []}
    />
  );
}
