import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatShoppingListText, shareShoppingList } from "../bring-export";
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

  it("should return empty string for empty array", () => {
    expect(formatShoppingListText([])).toBe("");
  });

  it("should handle empty amount string", () => {
    const items = [item({ name: "Pfeffer", amount: "" })];
    const text = formatShoppingListText(items);
    expect(text).toBe("Pfeffer");
  });

  it("should handle Umlaute correctly", () => {
    const items = [item({ name: "Gemüsebrühe", amount: "1 Würfel" })];
    const text = formatShoppingListText(items);
    expect(text).toBe("1 Würfel Gemüsebrühe");
  });
});

describe("shareShoppingList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return false for empty items", async () => {
    const result = await shareShoppingList([]);
    expect(result).toBe(false);
  });

  it("should return false when all items are checked", async () => {
    const items = [item({ checked: true })];
    const result = await shareShoppingList(items);
    expect(result).toBe(false);
  });

  it("should call navigator.share when available", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: { share: shareMock },
      writable: true,
      configurable: true,
    });

    const items = [item({ name: "Mehl", amount: "500 g" })];
    const result = await shareShoppingList(items);

    expect(result).toBe(true);
    expect(shareMock).toHaveBeenCalledWith({
      title: "Einkaufsliste – Rezeptretter",
      text: "500 g Mehl",
    });
  });

  it("should return false when user cancels share (AbortError)", async () => {
    const abortError = new Error("User cancelled");
    abortError.name = "AbortError";
    const shareMock = vi.fn().mockRejectedValue(abortError);
    Object.defineProperty(globalThis, "navigator", {
      value: { share: shareMock },
      writable: true,
      configurable: true,
    });

    const items = [item({ name: "Mehl", amount: "500 g" })];
    const result = await shareShoppingList(items);
    expect(result).toBe(false);
  });

  it("should return false when navigator.share is not available", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });

    const items = [item({ name: "Mehl", amount: "500 g" })];
    const result = await shareShoppingList(items);
    expect(result).toBe(false);
  });
});
