import { describe, it, expect } from "vitest";
import { buildBringDeepLink, formatShoppingListText } from "../bring-export";
import type { ShoppingItem } from "@/lib/types";

/* ──────────────────────────────────────────────
 * Helper – Shorthand to create a ShoppingItem
 * ──────────────────────────────────────────────*/
function item(overrides: Partial<ShoppingItem> = {}): ShoppingItem {
  return {
    id: "test-id",
    user_id: "user-123",
    recipe_id: null,
    recipe_title: null,
    name: "Mehl",
    amount: "500 g",
    checked: false,
    sort_order: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("buildBringDeepLink", () => {
  it("should return empty string for empty items", () => {
    expect(buildBringDeepLink([])).toBe("");
  });

  it("should return empty string when all items are checked", () => {
    const items = [item({ checked: true }), item({ checked: true, name: "Butter" })];
    expect(buildBringDeepLink(items)).toBe("");
  });

  it("should build a valid deep link for unchecked items", () => {
    const items = [
      item({ name: "Zwiebeln", amount: "3 Stück" }),
      item({ name: "Mehl", amount: "500 g" }),
    ];

    const link = buildBringDeepLink(items);
    expect(link).toContain("https://api.getbring.com/rest/bringrecipes/deeplink");
    expect(link).toContain("source=rezeptretter");
    // Items should be URL-encoded
    expect(link).toContain(encodeURIComponent("Zwiebeln|3 Stück,Mehl|500 g"));
  });

  it("should skip checked items", () => {
    const items = [
      item({ name: "Zwiebeln", amount: "3", checked: false }),
      item({ name: "Mehl", amount: "500 g", checked: true }),
    ];

    const link = buildBringDeepLink(items);
    expect(decodeURIComponent(link)).toContain("Zwiebeln|3");
    expect(decodeURIComponent(link)).not.toContain("Mehl");
  });

  it("should handle items without amount", () => {
    const items = [item({ name: "Salz", amount: null })];
    const link = buildBringDeepLink(items);
    expect(decodeURIComponent(link)).toContain("Salz|");
  });

  it("should handle items with empty amount string", () => {
    const items = [item({ name: "Pfeffer", amount: "" })];
    const link = buildBringDeepLink(items);
    expect(decodeURIComponent(link)).toContain("Pfeffer|");
  });

  it("should handle Umlaute correctly", () => {
    const items = [item({ name: "Gemüsebrühe", amount: "1 Würfel" })];
    const link = buildBringDeepLink(items);
    expect(link).toBeTruthy();
    expect(decodeURIComponent(link)).toContain("Gemüsebrühe|1 Würfel");
  });
});

describe("formatShoppingListText", () => {
  it("should format items with amount and name", () => {
    const items = [
      item({ name: "Mehl", amount: "500 g" }),
      item({ name: "Butter", amount: "100 g" }),
    ];

    const text = formatShoppingListText(items);
    expect(text).toBe("500 g Mehl\n100 g Butter");
  });

  it("should handle items without amount", () => {
    const items = [item({ name: "Salz", amount: null })];
    const text = formatShoppingListText(items);
    expect(text).toBe("Salz");
  });

  it("should skip checked items", () => {
    const items = [
      item({ name: "Mehl", amount: "500 g", checked: false }),
      item({ name: "Butter", amount: "100 g", checked: true }),
    ];

    const text = formatShoppingListText(items);
    expect(text).toBe("500 g Mehl");
    expect(text).not.toContain("Butter");
  });

  it("should return empty string for all checked items", () => {
    const items = [item({ checked: true })];
    expect(formatShoppingListText(items)).toBe("");
  });
});
