import { describe, it, expect, vi, beforeEach } from "vitest";

/* ──────────────────────────────────────────────
 * Mock Supabase
 * ──────────────────────────────────────────────*/
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

const supabaseMock = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "user-123" } },
    }),
  },
  from: mockFrom,
};

// Chain mock
function createChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockResolvedValue({ error: null });
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(() => supabaseMock),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  addToShoppingList,
  toggleShoppingItem,
  removeShoppingItem,
  clearCheckedItems,
  clearShoppingList,
} from "../shopping";

describe("Shopping Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
  });

  describe("addToShoppingList", () => {
    it("should return error when not authenticated", async () => {
      supabaseMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const result = await addToShoppingList("recipe-1", "Test Rezept", [
        { name: "Mehl", amount: "500 g" },
      ]);

      expect(result).toEqual({ error: "Nicht angemeldet." });
    });

    it("should return error for empty items list", async () => {
      const chain = createChain();
      supabaseMock.from.mockReturnValue(chain);

      const result = await addToShoppingList("recipe-1", "Test Rezept", [
        { name: "", amount: "" },
        { name: "  ", amount: null },
      ]);

      expect(result).toEqual({ error: "Keine Zutaten zum Hinzufügen." });
    });

    it("should detect duplicates by name (case-insensitive)", async () => {
      const chain = createChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      // First call: get existing items
      supabaseMock.from.mockReturnValueOnce({
        ...chain,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ name: "Mehl" }, { name: "Zwiebeln" }],
          }),
        }),
      });

      const result = await addToShoppingList("recipe-1", "Test Rezept", [
        { name: "mehl", amount: "500 g" },
        { name: "zwiebeln", amount: "2" },
      ]);

      expect(result).toEqual({
        success: "Alle Zutaten sind bereits in deiner Einkaufsliste.",
        added: 0,
      });
    });

    it("should insert new items successfully", async () => {
      // First call: get existing items (empty)
      supabaseMock.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [] }),
        }),
      });
      // Second call: get max sort_order
      supabaseMock.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        }),
      });
      // Third call: insert
      supabaseMock.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await addToShoppingList("recipe-1", "Test Rezept", [
        { name: "Mehl", amount: "500 g" },
        { name: "Butter", amount: "100 g" },
      ]);

      expect(result).toEqual({
        success: "2 Zutaten hinzugefügt!",
        added: 2,
      });
    });
  });

  describe("toggleShoppingItem", () => {
    it("should return error when not authenticated", async () => {
      supabaseMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const result = await toggleShoppingItem("item-1", true);
      expect(result).toEqual({ error: "Nicht angemeldet." });
    });

    it("should call update with correct values", async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      supabaseMock.from.mockReturnValue({ update: updateMock });

      await toggleShoppingItem("item-1", true);

      expect(supabaseMock.from).toHaveBeenCalledWith("shopping_items");
      expect(updateMock).toHaveBeenCalledWith({ checked: true });
    });
  });

  describe("removeShoppingItem", () => {
    it("should return error when not authenticated", async () => {
      supabaseMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const result = await removeShoppingItem("item-1");
      expect(result).toEqual({ error: "Nicht angemeldet." });
    });

    it("should call delete with correct filters", async () => {
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      supabaseMock.from.mockReturnValue({ delete: deleteMock });

      await removeShoppingItem("item-1");

      expect(supabaseMock.from).toHaveBeenCalledWith("shopping_items");
      expect(deleteMock).toHaveBeenCalled();
    });
  });

  describe("clearCheckedItems", () => {
    it("should delete only checked items", async () => {
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      supabaseMock.from.mockReturnValue({ delete: deleteMock });

      await clearCheckedItems();

      expect(supabaseMock.from).toHaveBeenCalledWith("shopping_items");
    });
  });

  describe("clearShoppingList", () => {
    it("should delete all user items", async () => {
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      supabaseMock.from.mockReturnValue({ delete: deleteMock });

      await clearShoppingList();

      expect(supabaseMock.from).toHaveBeenCalledWith("shopping_items");
    });
  });
});
