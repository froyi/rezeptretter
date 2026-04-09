"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Ingredient, Step } from "@/lib/types";

/* ──────────────────────────────────────────────
 * saveRecipe – Speichert ein Rezept mit Zutaten & Schritten
 * ──────────────────────────────────────────────*/
export async function saveRecipe(data: {
  title: string;
  image_url: string | null;
  cooking_time: number | null;
  servings: number | null;
  difficulty: string | null;
  source_url: string;
  source_name: string;
  ingredients: Ingredient[];
  steps: Step[];
}) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  // 1. INSERT Recipe
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: data.title.trim(),
      image_url: data.image_url,
      cooking_time: data.cooking_time,
      servings: data.servings,
      difficulty: data.difficulty,
      source_url: data.source_url,
      source_name: data.source_name,
      category: [],
    })
    .select("id")
    .single();

  if (recipeError || !recipe) {
    console.error("Error saving recipe:", recipeError);
    return { error: "Rezept konnte nicht gespeichert werden." };
  }

  const recipeId = recipe.id;

  // 2. INSERT Ingredients (bulk)
  if (data.ingredients.length > 0) {
    const ingredientRows = data.ingredients
      .filter((ing) => ing.name.trim().length > 0)
      .map((ing, index) => ({
        recipe_id: recipeId,
        amount: ing.amount?.trim() || null,
        name: ing.name.trim(),
        sort_order: index,
      }));

    if (ingredientRows.length > 0) {
      const { error: ingError } = await supabase
        .from("ingredients")
        .insert(ingredientRows);

      if (ingError) {
        console.error("Error saving ingredients:", ingError);
        // Recipe already saved – continue
      }
    }
  }

  // 3. INSERT Steps (bulk)
  if (data.steps.length > 0) {
    const stepRows = data.steps
      .filter((step) => step.description.trim().length > 0)
      .map((step, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        title: step.title?.trim() || null,
        description: step.description.trim(),
        timer_seconds: step.timer_seconds || null,
        tip: step.tip?.trim() || null,
        sort_order: index,
      }));

    if (stepRows.length > 0) {
      const { error: stepError } = await supabase
        .from("steps")
        .insert(stepRows);

      if (stepError) {
        console.error("Error saving steps:", stepError);
      }
    }
  }

  revalidatePath("/rezepte");
  redirect(`/rezepte/${recipeId}`);
}
