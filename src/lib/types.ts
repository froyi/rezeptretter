/* ──────────────────────────────────────────────
 * Rezeptretter – Shared TypeScript Types
 * ──────────────────────────────────────────────*/

/** Rezept aus der Supabase `recipes` Tabelle */
export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  image_url: string | null;
  cooking_time: number | null;
  difficulty: string | null;
  servings: number | null;
  source_url: string | null;
  source_name: string | null;
  category: string[];
  created_at: string;
  updated_at: string;
}

/** Zutat aus der Supabase `ingredients` Tabelle */
export interface Ingredient {
  id?: string;
  recipe_id?: string;
  amount: string;
  name: string;
  sort_order: number;
}

/** Zubereitungsschritt aus der Supabase `steps` Tabelle */
export interface Step {
  id?: string;
  recipe_id?: string;
  step_number: number;
  title: string | null;
  description: string;
  image_url?: string | null;
  timer_seconds: number | null;
  tip: string | null;
  sort_order?: number;
}

/** Ergebnis des URL-Parsers (vor dem Speichern) */
export interface ParsedRecipe {
  title: string;
  image_url: string | null;
  cooking_time: number | null;
  servings: number | null;
  difficulty: string | null;
  source_url: string;
  source_name: string;
  ingredients: Ingredient[];
  steps: Step[];
}
