/* ──────────────────────────────────────────────
 * TypeScript types for the rezeptretter schema
 * ──────────────────────────────────────────────*/

export type Difficulty = "Leicht" | "Mittel" | "Schwer";
export type CookModeFontSize = "normal" | "large" | "xlarge";
export type DarkModePreference = "light" | "dark" | "system";

export interface UserSettings {
  default_servings: number;
  cook_mode_font_size: CookModeFontSize;
  timer_sound: boolean;
  timer_vibration: boolean;
  dark_mode: DarkModePreference;
}

export const DEFAULT_SETTINGS: UserSettings = {
  default_servings: 2,
  cook_mode_font_size: "normal",
  timer_sound: true,
  timer_vibration: true,
  dark_mode: "system",
};

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  settings: UserSettings;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  image_url: string | null;
  cooking_time: number | null;
  difficulty: Difficulty | null;
  servings: number;
  source_url: string | null;
  source_name: string | null;
  category: string[];
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  amount: string | null;
  name: string;
  sort_order: number;
}

export interface Step {
  id: string;
  recipe_id: string;
  step_number: number;
  title: string | null;
  description: string;
  image_url: string | null;
  timer_seconds: number | null;
  tip: string | null;
  sort_order: number;
}

/** Recipe with nested ingredients and steps */
export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  steps: Step[];
}
