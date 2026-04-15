"use client";

import { useState, useTransition, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Recipe, Ingredient, Step } from "@/lib/types";
import { deleteRecipe } from "@/app/actions/recipes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { scaleAmount } from "@/lib/scale-amount";

/* ──────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────*/
interface RezeptDetailClientProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  steps: Step[];
}

/* ──────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────*/
export default function RezeptDetailClient({
  recipe,
  ingredients,
  steps,
}: RezeptDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const originalServings = recipe.servings || 4;
  const [servings, setServings] = useState(originalServings);

  // Checked ingredients (local state, not persisted)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set(),
  );

  const toggleIngredient = useCallback((id: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteRecipe(recipe.id);
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: recipe.title,
      text: `Schau dir dieses Rezept an: ${recipe.title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // TODO: toast notification
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* ── Hero Section ─────────────────────── */}
      <section className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden md:rounded-xl md:mx-auto md:max-w-screen-xl md:mt-4">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            priority
            className="object-cover md:rounded-xl"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center md:rounded-xl">
            <span className="material-symbols-outlined text-8xl text-primary/30">
              restaurant
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-12 md:rounded-xl">
          <div className="max-w-3xl">
            <h1 className="text-white text-3xl md:text-6xl font-headline font-bold tracking-tight mb-4 leading-tight">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap gap-3 text-white/90">
              {recipe.cooking_time && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <span className="material-symbols-outlined text-sm">
                    schedule
                  </span>
                  <span className="text-sm font-medium">
                    {recipe.cooking_time} Min.
                  </span>
                </div>
              )}
              {recipe.difficulty && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <span className="material-symbols-outlined text-sm">
                    restaurant
                  </span>
                  <span className="text-sm font-medium">
                    {recipe.difficulty}
                  </span>
                </div>
              )}
              {recipe.source_name && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <span className="material-symbols-outlined text-sm">
                    menu_book
                  </span>
                  <span className="text-sm font-medium">
                    {recipe.source_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share button (top right, always visible) */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-colors active:scale-90 z-10"
          aria-label="Rezept teilen"
        >
          <span className="material-symbols-outlined text-xl">share</span>
        </button>

        {/* Back button (top left) */}
        <Link
          href="/rezepte"
          className="absolute top-4 left-4 md:top-6 md:left-6 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-colors active:scale-90 z-10"
          aria-label="Zurück"
        >
          <span className="material-symbols-outlined text-xl">
            arrow_back
          </span>
        </Link>
      </section>

      {/* ── Action Bar ───────────────────────── */}
      <section className="px-4 md:px-6 -mt-6 md:-mt-8 relative z-10 max-w-screen-xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6 shadow-[0px_12px_32px_rgba(50,18,0,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            {/* Kochmodus Button */}
            <Link
              href={`/rezepte/${recipe.id}/kochmodus${servings !== originalServings ? `?portionen=${servings}` : ""}`}
              className="hero-gradient text-white rounded-full h-[52px] md:h-[56px] px-6 md:px-8 flex items-center justify-center gap-3 font-bold hover:brightness-110 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">play_circle</span>
              Kochmodus starten
            </Link>

            {/* Edit + Delete */}
            <div className="flex gap-2">
              <button
                className="bg-surface-container-high text-primary rounded-full w-[52px] h-[52px] md:w-[56px] md:h-[56px] flex items-center justify-center hover:bg-surface-variant transition-colors active:scale-90"
                aria-label="Bearbeiten"
                title="Bearbeiten"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="bg-surface-container-high text-primary rounded-full w-[52px] h-[52px] md:w-[56px] md:h-[56px] flex items-center justify-center hover:bg-surface-variant transition-colors active:scale-90"
                aria-label="Löschen"
                title="Löschen"
                disabled={isPending}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>

          {/* Portions Stepper */}
          <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-full">
            <span className="text-on-surface-variant font-medium ml-3 text-sm md:text-base">
              Portionen
            </span>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-container-lowest flex items-center justify-center hover:bg-white transition-colors active:scale-90"
                aria-label="Eine Portion weniger"
              >
                <span className="material-symbols-outlined text-lg">
                  remove
                </span>
              </button>
              <span className="font-bold text-lg md:text-xl w-6 text-center tabular-nums">
                {servings}
              </span>
              <button
                onClick={() => setServings((s) => Math.min(20, s + 1))}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-container-lowest flex items-center justify-center hover:bg-white transition-colors active:scale-90"
                aria-label="Eine Portion mehr"
              >
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ingredients & Steps Grid ──────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 px-4 md:px-6 mt-8 md:mt-12 mb-24 max-w-screen-xl mx-auto">
        {/* Zutatenliste (Sticky Sidebar on Desktop) */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-low rounded-xl p-6 md:p-8 sticky top-28">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-6 md:mb-8 tracking-tight">
              Zutaten
            </h2>
            {servings !== originalServings && (
              <p className="text-sm text-primary/80 mb-4 -mt-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">
                  calculate
                </span>
                umgerechnet für {servings} Portionen
              </p>
            )}
            <ul className="space-y-4 md:space-y-5">
              {ingredients.map((ing) => {
                const id = ing.id || `${ing.sort_order}`;
                const checked = checkedIngredients.has(id);
                const scaledAmount = scaleAmount(
                  ing.amount,
                  originalServings,
                  servings,
                );

                return (
                  <li
                    key={id}
                    className="flex items-start gap-3 md:gap-4 group cursor-pointer select-none"
                    onClick={() => toggleIngredient(id)}
                  >
                    {/* Checkbox */}
                    <div
                      className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                        checked
                          ? "bg-primary border-primary"
                          : "border-outline-variant group-hover:border-primary"
                      }`}
                    >
                      {checked && (
                        <span className="material-symbols-outlined text-white text-base">
                          check
                        </span>
                      )}
                    </div>

                    {/* Amount + Name */}
                    <div
                      className={`flex-1 border-b border-outline-variant/20 pb-3 md:pb-4 transition-opacity ${
                        checked ? "opacity-40 line-through" : ""
                      }`}
                    >
                      {scaledAmount && (
                        <span className="block text-base md:text-lg font-bold text-on-surface">
                          {scaledAmount}
                        </span>
                      )}
                      <span className="text-on-surface-variant text-sm md:text-base">
                        {ing.name}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {ingredients.length === 0 && (
              <p className="text-on-surface-variant text-sm italic">
                Keine Zutaten vorhanden
              </p>
            )}
          </div>
        </div>

        {/* Zubereitungsschritte */}
        <div className="lg:col-span-8 space-y-8 md:space-y-12">
          <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight border-l-4 border-primary pl-4">
            Zubereitungsschritte
          </h2>

          <div className="space-y-10 md:space-y-16">
            {steps.map((step, i) => (
              <div key={step.id || i} className="flex gap-4 md:gap-8 group">
                {/* Step Number */}
                <div className="shrink-0">
                  <span className="text-4xl md:text-6xl font-bold text-primary/10 group-hover:text-primary/30 transition-colors font-headline leading-none select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3 md:space-y-4 flex-1 min-w-0">
                  {step.title && (
                    <h3 className="text-lg md:text-xl font-bold text-on-surface">
                      {step.title}
                    </h3>
                  )}
                  <p className="text-on-surface text-base md:text-lg leading-relaxed whitespace-pre-line">
                    {step.description}
                  </p>

                  {/* Optional step image */}
                  {step.image_url && (
                    <div className="rounded-xl overflow-hidden aspect-video relative">
                      <Image
                        src={step.image_url}
                        alt={step.title || `Schritt ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                    </div>
                  )}

                  {/* Timer badge */}
                  {step.timer_seconds && step.timer_seconds > 0 && (
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2">
                      <span className="material-symbols-outlined text-base">
                        timer
                      </span>
                      <span className="text-sm font-medium">
                        {Math.ceil(step.timer_seconds / 60)} Min.
                      </span>
                    </div>
                  )}

                  {/* Tip */}
                  {step.tip && (
                    <div className="bg-surface-container-low rounded-lg p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                        lightbulb
                      </span>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {step.tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {steps.length === 0 && (
            <p className="text-on-surface-variant italic">
              Keine Zubereitungsschritte vorhanden
            </p>
          )}

          {/* Guten Appetit Card */}
          {steps.length > 0 && (
            <div className="bg-surface-container-high rounded-xl p-6 md:p-8 flex items-center justify-between">
              <div>
                <h4 className="font-headline font-bold text-lg mb-1">
                  Guten Appetit!
                </h4>
                <p className="text-on-surface-variant text-sm">
                  Vergiss nicht, ein Foto zu machen 📸
                </p>
              </div>
              <span className="material-symbols-outlined text-4xl text-primary/40">
                restaurant_menu
              </span>
            </div>
          )}

          {/* Source Link */}
          {recipe.source_url && (
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-base">link</span>
              <span>
                Quelle:{" "}
                <a
                  href={recipe.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {recipe.source_name || recipe.source_url}
                </a>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Delete Confirm Dialog ───────────── */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Rezept löschen?"
        message={`„${recipe.title}" wird unwiderruflich gelöscht – inklusive aller Zutaten und Schritte.`}
        confirmLabel="Löschen"
        cancelLabel="Behalten"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
