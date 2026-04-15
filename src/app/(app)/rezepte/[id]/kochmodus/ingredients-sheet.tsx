"use client";

import { useState, useCallback } from "react";
import type { Ingredient } from "@/lib/types/database.types";
import { scaleAmount } from "@/lib/scale-amount";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ──────────────────────────────────────────────
 * Zutaten Bottom-Sheet für den Kochmodus
 * Zeigt alle Zutaten mit Abhak-Funktion,
 * skaliert die Mengen wenn Portionen angepasst wurden
 * ──────────────────────────────────────────────*/
interface IngredientsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredients: Ingredient[];
  originalServings: number;
  currentServings: number;
}

export default function IngredientsSheet({
  open,
  onOpenChange,
  ingredients,
  originalServings,
  currentServings,
}: IngredientsSheetProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isScaled = currentServings !== originalServings;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-xl max-h-[70vh] overflow-y-auto border-none bg-white pb-8"
      >
        <SheetHeader className="pb-2 pt-6 px-6">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <SheetTitle className="text-xl font-headline font-bold text-on-surface">
            Zutaten
          </SheetTitle>
          {isScaled && (
            <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: "var(--cook-primary)" }}>
              <span className="material-symbols-outlined text-base">calculate</span>
              umgerechnet für {currentServings} Portionen
            </p>
          )}
        </SheetHeader>

        <div className="px-6 pb-4">
          <ul className="space-y-3">
            {ingredients.map((ing) => {
              const id = ing.id || `${ing.sort_order}`;
              const isChecked = checked.has(id);
              const displayAmount = scaleAmount(
                ing.amount,
                originalServings,
                currentServings,
              );

              return (
                <li
                  key={id}
                  onClick={() => toggle(id)}
                  className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-none cursor-pointer select-none active:bg-gray-50 rounded-lg transition-colors"
                >
                  {/* Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      isChecked
                        ? "border-[var(--cook-primary)] bg-[var(--cook-primary)]"
                        : "border-gray-300"
                    }`}
                  >
                    {isChecked && (
                      <span className="material-symbols-outlined text-white text-base">
                        check
                      </span>
                    )}
                  </div>

                  {/* Ingredient */}
                  <div
                    className={`flex-1 transition-opacity ${
                      isChecked ? "opacity-40 line-through" : ""
                    }`}
                  >
                    {displayAmount && (
                      <span className="font-bold text-on-surface mr-2">
                        {displayAmount}
                      </span>
                    )}
                    <span className="text-on-surface-variant">{ing.name}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {ingredients.length === 0 && (
            <p className="text-center text-on-surface-variant py-8 italic">
              Keine Zutaten vorhanden
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
