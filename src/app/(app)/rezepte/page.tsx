import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/lib/types";
import { RezepteClient } from "./rezepte-client";

export default async function RezeptePage() {
  const supabase = await createClient();

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
  }

  return <RezepteClient recipes={(recipes as Recipe[]) ?? []} />;
}
