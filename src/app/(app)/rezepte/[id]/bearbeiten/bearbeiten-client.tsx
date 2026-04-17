"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateRecipe } from "@/app/actions/recipes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Recipe, Ingredient, Step } from "@/lib/types";

/* ──────────────────────────────────────────────
 * Sortable Ingredient Item (same pattern as import page)
 * ──────────────────────────────────────────────*/
function SortableIngredient({
  ingredient,
  index,
  onUpdate,
  onRemove,
}: {
  ingredient: Ingredient;
  index: number;
  onUpdate: (index: number, field: "amount" | "name", value: string) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `ing-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 border-b border-outline-variant/10 pb-3"
    >
      <input
        type="text"
        value={ingredient.amount ?? ""}
        onChange={(e) => onUpdate(index, "amount", e.target.value)}
        className="w-20 shrink-0 bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 focus:text-primary placeholder:text-outline"
        placeholder="Menge"
      />
      <input
        type="text"
        value={ingredient.name ?? ""}
        onChange={(e) => onUpdate(index, "name", e.target.value)}
        className="flex-1 bg-transparent border-none p-0 focus:ring-0 focus:text-primary placeholder:text-outline"
        placeholder="Zutat"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-outline hover:text-error p-1 rounded-full transition-colors shrink-0"
        title="Entfernen"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
      <span
        {...attributes}
        {...listeners}
        className="material-symbols-outlined text-outline-variant cursor-grab active:cursor-grabbing touch-target shrink-0"
      >
        drag_indicator
      </span>
    </li>
  );
}

/* ──────────────────────────────────────────────
 * Main Edit Component
 * ──────────────────────────────────────────────*/
export function BearbeitenClient({
  recipe,
  ingredients: initialIngredients,
  steps: initialSteps,
}: {
  recipe: Recipe;
  ingredients: Ingredient[];
  steps: Step[];
}) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDiscard, setShowDiscard] = useState(false);

  // Editable recipe data – initialized from DB
  const [title, setTitle] = useState(recipe.title);
  const [imageUrl] = useState<string | null>(recipe.image_url);
  const [cookingTime, setCookingTime] = useState(
    recipe.cooking_time ? String(recipe.cooking_time) : "",
  );
  const [servings, setServings] = useState(
    recipe.servings ? String(recipe.servings) : "",
  );
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [steps, setSteps] = useState<Step[]>(initialSteps);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /* ── Save Handler ── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    setErrorMsg("");
    try {
      const result = await updateRecipe(recipe.id, {
        title,
        image_url: imageUrl,
        cooking_time: cookingTime ? parseInt(cookingTime, 10) : null,
        servings: servings ? parseInt(servings, 10) : null,
        difficulty: recipe.difficulty,
        source_url: recipe.source_url,
        source_name: recipe.source_name,
        ingredients,
        steps,
      });
      if (result?.error) {
        setErrorMsg(result.error);
        setSaving(false);
      }
      // redirect happens in server action
    } catch {
      setSaving(false);
    }
  }, [
    recipe.id,
    recipe.difficulty,
    recipe.source_url,
    recipe.source_name,
    title,
    imageUrl,
    cookingTime,
    servings,
    ingredients,
    steps,
  ]);

  /* ── Ingredient handlers ── */
  const updateIngredient = (
    index: number,
    field: "amount" | "name",
    value: string,
  ) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
    );
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { amount: "", name: "", sort_order: prev.length },
    ]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ingredients.findIndex(
      (_, i) => `ing-${i}` === active.id,
    );
    const newIndex = ingredients.findIndex(
      (_, i) => `ing-${i}` === over.id,
    );

    setIngredients((prev) =>
      arrayMove(prev, oldIndex, newIndex).map((ing, i) => ({
        ...ing,
        sort_order: i,
      })),
    );
  };

  /* ── Step handlers ── */
  const updateStep = (index: number, description: string) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, description } : s)),
    );
  };

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, step_number: i + 1 })),
    );
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        step_number: prev.length + 1,
        title: null,
        description: "",
        timer_seconds: null,
        tip: null,
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">
            Rezept bearbeiten
          </h1>
          <p className="text-outline text-sm mt-1">
            Passe Titel, Zutaten und Zubereitungsschritte an
          </p>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="bg-error-container text-on-error-container px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined">error</span>
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Edit Form */}
      <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* A) Image & Meta (7 cols) */}
          <div className="md:col-span-7 space-y-8">
            {/* Image */}
            <div className="relative group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full aspect-[4/3] object-cover rounded-xl shadow-sm"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-surface-container rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-outline-variant">
                    restaurant
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-outline">
                Rezepttitel
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-3xl md:text-4xl font-bold font-headline w-full bg-transparent border-none p-0 focus:ring-0 focus:text-primary transition-colors"
                placeholder="Rezeptname eingeben..."
              />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-5 rounded-lg space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    schedule
                  </span>
                  Zeit
                </label>
                <input
                  type="text"
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  className="bg-transparent border-none p-0 font-bold text-lg w-full focus:ring-0"
                  placeholder="z.B. 25"
                />
              </div>
              <div className="bg-surface-container p-5 rounded-lg space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    groups
                  </span>
                  Portionen
                </label>
                <input
                  type="text"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="bg-transparent border-none p-0 font-bold text-lg w-full focus:ring-0"
                  placeholder="z.B. 4"
                />
              </div>
            </div>

            {/* Source info (read-only) */}
            {recipe.source_url && (
              <div className="bg-surface-container p-4 rounded-lg flex items-center gap-3 text-sm text-outline">
                <span className="material-symbols-outlined text-base">
                  link
                </span>
                <span className="truncate">
                  Quelle: {recipe.source_name || recipe.source_url}
                </span>
              </div>
            )}
          </div>

          {/* B) Ingredients (5 cols) */}
          <div className="md:col-span-5 bg-surface-container-low p-6 md:p-8 rounded-xl space-y-6 self-start">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Zutaten</h3>
              <button
                type="button"
                onClick={addIngredient}
                className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                title="Zutat hinzufügen"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={ingredients.map((_, i) => `ing-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-3">
                  {ingredients.map((ing, i) => (
                    <SortableIngredient
                      key={`ing-${i}`}
                      ingredient={ing}
                      index={i}
                      onUpdate={updateIngredient}
                      onRemove={removeIngredient}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>

            {ingredients.length === 0 && (
              <p className="text-outline text-sm text-center py-4">
                Keine Zutaten – klicke + zum Hinzufügen
              </p>
            )}
          </div>

          {/* C) Steps (12 cols) */}
          <div className="md:col-span-12 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Zubereitung</h3>
              <button
                type="button"
                onClick={addStep}
                className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                title="Schritt hinzufügen"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            <div className="space-y-6">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-4 md:gap-6 items-start group"
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 ${
                      i === 0
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container text-primary"
                    } rounded-full flex items-center justify-center shrink-0 font-bold font-headline text-lg md:text-xl`}
                  >
                    {i + 1}
                  </div>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(i, e.target.value)}
                    className="flex-1 bg-surface-container-low border-none rounded-lg p-4 md:p-5 focus:ring-2 focus:ring-primary/20 min-h-[80px] text-base md:text-lg leading-relaxed resize-none"
                    placeholder="Schritt beschreiben..."
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="text-outline hover:text-error p-1 mt-3 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Schritt entfernen"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {steps.length === 0 && (
              <p className="text-outline text-sm text-center py-4">
                Keine Zubereitungsschritte – klicke + zum Hinzufügen
              </p>
            )}
          </div>
        </div>

        {/* Save Actions */}
        <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="w-full md:w-auto px-12 h-16 hero-gradient text-white rounded-full font-bold text-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/15 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                Speichern...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                Änderungen speichern
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowDiscard(true)}
            className="w-full md:w-auto px-8 h-16 bg-surface-container-high text-primary rounded-full font-bold text-lg hover:bg-surface-variant transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </section>

      {/* Discard Confirm Dialog */}
      <ConfirmDialog
        open={showDiscard}
        onOpenChange={setShowDiscard}
        title="Änderungen verwerfen?"
        message="Alle nicht gespeicherten Änderungen gehen verloren."
        confirmLabel="Verwerfen"
        destructive
        onConfirm={() => router.back()}
      />
    </div>
  );
}
