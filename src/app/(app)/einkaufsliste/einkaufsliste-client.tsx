"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ShoppingItem } from "@/lib/types";
import {
  toggleShoppingItem,
  removeShoppingItem,
  clearCheckedItems,
  clearShoppingList,
} from "@/app/actions/shopping";
import { buildBringDeepLink, formatShoppingListText } from "@/lib/bring-export";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";

/* ──────────────────────────────────────────────
 * Einkaufsliste Client Component
 * ──────────────────────────────────────────────*/
export function EinkaufslisteClient({ items: initialItems }: { items: ShoppingItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);
  const checkedCount = checkedItems.length;
  const totalCount = items.length;

  // Group unchecked items by recipe
  const groupedByRecipe = uncheckedItems.reduce<
    Record<string, { title: string; items: ShoppingItem[] }>
  >((acc, item) => {
    const key = item.recipe_id || "manual";
    if (!acc[key]) {
      acc[key] = { title: item.recipe_title || "Sonstige", items: [] };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── Toggle checked ── */
  const handleToggle = (item: ShoppingItem) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)),
    );
    startTransition(async () => {
      await toggleShoppingItem(item.id, !item.checked);
    });
  };

  /* ── Remove single item ── */
  const handleRemove = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    startTransition(async () => {
      await removeShoppingItem(itemId);
    });
  };

  /* ── Clear checked ── */
  const handleClearChecked = () => {
    const remaining = items.filter((i) => !i.checked);
    setItems(remaining);
    startTransition(async () => {
      await clearCheckedItems();
    });
    showToast("Erledigte Zutaten entfernt");
  };

  /* ── Clear all ── */
  const handleClearAll = () => {
    setItems([]);
    startTransition(async () => {
      await clearShoppingList();
    });
    showToast("Einkaufsliste geleert");
  };

  /* ── Bring! Export ── */
  const handleBringExport = async () => {
    const link = buildBringDeepLink(items);
    if (!link) return;

    // Try to open Bring! via deep link
    window.open(link, "_blank");
  };

  /* ── Copy to clipboard ── */
  const handleCopyList = async () => {
    const text = formatShoppingListText(items);
    try {
      await navigator.clipboard.writeText(text);
      showToast("In Zwischenablage kopiert!");
    } catch {
      showToast("Kopieren fehlgeschlagen");
    }
  };

  /* ── Empty state ── */
  if (totalCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">
          Einkaufsliste
        </h1>
        <EmptyState
          icon="shopping_cart"
          title="Deine Einkaufsliste ist leer"
          description={'Öffne ein Rezept und tippe auf „Zur Einkaufsliste", um Zutaten hinzuzufügen.'}
          actionLabel="Zu den Rezepten"
          onAction={() => router.push("/rezepte")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">
            Einkaufsliste
          </h1>
          <p className="text-outline text-sm mt-1">
            {checkedCount}/{totalCount} erledigt
          </p>
        </div>

        {/* Action Menu */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyList}
            className="p-3 rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors"
            title="Liste kopieren"
          >
            <span className="material-symbols-outlined text-xl">content_copy</span>
          </button>
          <button
            onClick={handleBringExport}
            className="hero-gradient text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/15"
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            An Bring!
          </button>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {totalCount > 0 && (
        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full hero-gradient rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(checkedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* ── Unchecked Items grouped by Recipe ── */}
      <div className="space-y-6">
        {Object.entries(groupedByRecipe).map(([key, group]) => (
          <div key={key} className="space-y-1">
            {/* Recipe group header */}
            <div className="flex items-center gap-2 px-1 pt-2">
              <span className="material-symbols-outlined text-primary text-base">
                restaurant_menu
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-outline">
                {group.title}
              </span>
            </div>

            {/* Items */}
            <ul className="bg-surface-container-low rounded-xl overflow-hidden divide-y divide-outline-variant/10">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3.5 group hover:bg-surface-container transition-colors"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item)}
                    className="w-6 h-6 rounded-md border-2 border-outline-variant group-hover:border-primary flex items-center justify-center transition-all shrink-0 active:scale-90"
                    aria-label={`${item.name} abhaken`}
                  >
                    {/* unchecked – empty */}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {item.amount && (
                      <span className="block text-sm font-bold text-on-surface">
                        {item.amount}
                      </span>
                    )}
                    <span className="text-on-surface-variant text-sm">
                      {item.name}
                    </span>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full text-outline hover:text-error transition-all"
                    title="Entfernen"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Checked Items ── */}
      {checkedItems.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1 pt-4">
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
              Erledigt ({checkedItems.length})
            </span>
            <button
              onClick={handleClearChecked}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              disabled={isPending}
            >
              Erledigte löschen
            </button>
          </div>

          <ul className="bg-surface-container-low/60 rounded-xl overflow-hidden divide-y divide-outline-variant/5">
            {checkedItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 group opacity-50"
              >
                {/* Checked checkbox */}
                <button
                  onClick={() => handleToggle(item)}
                  className="w-6 h-6 rounded-md bg-primary border-2 border-primary flex items-center justify-center transition-all shrink-0 active:scale-90"
                  aria-label={`${item.name} zurücksetzen`}
                >
                  <span className="material-symbols-outlined text-white text-base">
                    check
                  </span>
                </button>

                {/* Content (strikethrough) */}
                <div className="flex-1 min-w-0 line-through">
                  {item.amount && (
                    <span className="block text-sm font-bold text-on-surface">
                      {item.amount}
                    </span>
                  )}
                  <span className="text-on-surface-variant text-sm">
                    {item.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Footer Actions ── */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          onClick={() => setShowClearDialog(true)}
          className="text-sm text-outline hover:text-error font-medium transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">delete_sweep</span>
          Gesamte Liste leeren
        </button>
      </div>

      {/* ── Clear All Confirm ── */}
      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        title="Einkaufsliste leeren?"
        message="Alle Zutaten werden unwiderruflich von deiner Einkaufsliste entfernt."
        confirmLabel="Leeren"
        destructive
        onConfirm={handleClearAll}
      />

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
