"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* ──────────────────────────────────────────────
 * addToShoppingList – Fügt skalierte Zutaten zur Einkaufsliste hinzu
 * Duplikate (gleicher Name, case-insensitive) werden übersprungen.
 * ──────────────────────────────────────────────*/
export async function addToShoppingList(
  recipeId: string,
  recipeTitle: string,
  items: { name: string; amount: string | null }[],
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  // Filter empty names
  const validItems = items.filter((item) => item.name.trim().length > 0);
  if (validItems.length === 0) {
    return { error: "Keine Zutaten zum Hinzufügen." };
  }

  // Fetch existing items to detect duplicates
  const { data: existingItems } = await supabase
    .from("shopping_items")
    .select("name")
    .eq("user_id", user.id);

  const existingNames = new Set(
    (existingItems || []).map((item) => item.name.toLowerCase().trim()),
  );

  // Filter out duplicates
  const newItems = validItems.filter(
    (item) => !existingNames.has(item.name.toLowerCase().trim()),
  );

  if (newItems.length === 0) {
    return {
      success: "Alle Zutaten sind bereits in deiner Einkaufsliste.",
      added: 0,
    };
  }

  // Get current max sort_order
  const { data: maxOrderResult } = await supabase
    .from("shopping_items")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const startOrder =
    maxOrderResult && maxOrderResult.length > 0
      ? maxOrderResult[0].sort_order + 1
      : 0;

  // Insert new items
  const rows = newItems.map((item, index) => ({
    user_id: user.id,
    recipe_id: recipeId,
    recipe_title: recipeTitle,
    name: item.name.trim(),
    amount: item.amount?.trim() || null,
    checked: false,
    sort_order: startOrder + index,
  }));

  const { error } = await supabase.from("shopping_items").insert(rows);

  if (error) {
    console.error("Error adding shopping items:", error);
    return { error: "Zutaten konnten nicht hinzugefügt werden." };
  }

  revalidatePath("/einkaufsliste");
  return {
    success: `${newItems.length} Zutat${newItems.length > 1 ? "en" : ""} hinzugefügt!`,
    added: newItems.length,
  };
}

/* ──────────────────────────────────────────────
 * toggleShoppingItem – Haken setzen/entfernen
 * ──────────────────────────────────────────────*/
export async function toggleShoppingItem(itemId: string, checked: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("shopping_items")
    .update({ checked })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error toggling shopping item:", error);
    return { error: "Status konnte nicht geändert werden." };
  }

  revalidatePath("/einkaufsliste");
}

/* ──────────────────────────────────────────────
 * removeShoppingItem – Einzelne Zutat löschen
 * ──────────────────────────────────────────────*/
export async function removeShoppingItem(itemId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error removing shopping item:", error);
    return { error: "Zutat konnte nicht entfernt werden." };
  }

  revalidatePath("/einkaufsliste");
}

/* ──────────────────────────────────────────────
 * clearCheckedItems – Erledigte Zutaten entfernen
 * ──────────────────────────────────────────────*/
export async function clearCheckedItems() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("user_id", user.id)
    .eq("checked", true);

  if (error) {
    console.error("Error clearing checked items:", error);
    return { error: "Erledigte konnten nicht entfernt werden." };
  }

  revalidatePath("/einkaufsliste");
}

/* ──────────────────────────────────────────────
 * clearShoppingList – Gesamte Liste leeren
 * ──────────────────────────────────────────────*/
export async function clearShoppingList() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("Error clearing shopping list:", error);
    return { error: "Liste konnte nicht geleert werden." };
  }

  revalidatePath("/einkaufsliste");
}
