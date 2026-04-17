/* ──────────────────────────────────────────────
 * Bring! Export – Deep Link Builder
 * Builds a URL that opens the Bring! shopping app
 * with the given items pre-filled.
 * ──────────────────────────────────────────────*/

import type { ShoppingItem } from "@/lib/types";

/**
 * Build a Bring! deep link from shopping items.
 *
 * Bring! Universal Link format:
 * https://api.getbring.com/rest/bringrecipes/deeplink
 *   ?source=rezeptretter
 *   &items=Zwiebeln|3 Stück,Mehl|500 g,Butter|
 *
 * Each item is: name|amount (amount can be empty)
 * Items are separated by commas.
 */
export function buildBringDeepLink(items: ShoppingItem[]): string {
  const uncheckedItems = items.filter((item) => !item.checked);

  if (uncheckedItems.length === 0) return "";

  const itemsParam = uncheckedItems
    .map((item) => {
      const name = item.name.trim();
      const amount = item.amount?.trim() || "";
      return `${name}|${amount}`;
    })
    .join(",");

  return `https://api.getbring.com/rest/bringrecipes/deeplink?source=rezeptretter&items=${encodeURIComponent(itemsParam)}`;
}

/**
 * Format shopping items as plain text for clipboard copy.
 * Used as fallback when Bring! is not installed.
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
