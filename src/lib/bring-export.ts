/* ──────────────────────────────────────────────
 * Shopping List Export Utilities
 * Provides clipboard copy and Web Share API export.
 *
 * Note: Bring! deeplink API requires a public recipe URL
 * with JSON-LD markup – not usable for private PWA items.
 * We use the Web Share API instead, which on mobile allows
 * sharing to Bring!, WhatsApp, Notes, etc.
 * ──────────────────────────────────────────────*/

import type { ShoppingItem } from "@/lib/types";

/**
 * Format shopping items as plain text.
 * Used for clipboard copy and Web Share API.
 */
export function formatShoppingListText(items: ShoppingItem[]): string {
  const uncheckedItems = items.filter((item) => !item.checked);

  return uncheckedItems
    .map((item) => {
      const amount = item.amount?.trim();
      return amount ? `${amount} ${item.name}` : item.name;
    })
    .join("\n");
}

/**
 * Share the shopping list via the Web Share API.
 * Returns true if shared successfully, false if not available.
 */
export async function shareShoppingList(items: ShoppingItem[]): Promise<boolean> {
  const text = formatShoppingListText(items);
  if (!text) return false;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: "Einkaufsliste – Rezeptretter",
        text,
      });
      return true;
    } catch (err) {
      // User cancelled share – not an error
      if (err instanceof Error && err.name === "AbortError") {
        return false;
      }
      return false;
    }
  }

  return false;
}
