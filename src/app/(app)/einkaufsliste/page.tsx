import { createClient } from "@/lib/supabase/server";
import { EinkaufslisteClient } from "./einkaufsliste-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Einkaufsliste – Rezeptretter",
  description: "Deine Einkaufsliste mit allen Zutaten aus deinen Rezepten.",
};

export default async function EinkaufslistePage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("shopping_items")
    .select("*")
    .order("checked", { ascending: true })
    .order("created_at", { ascending: true });

  return <EinkaufslisteClient items={items || []} />;
}
