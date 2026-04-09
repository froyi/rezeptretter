"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { saveRecipe } from "@/app/actions/recipes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Ingredient, Step, ParsedRecipe } from "@/lib/types";

/* ──────────────────────────────────────────────
 * State Types
 * ──────────────────────────────────────────────*/
type ImportState = "idle" | "loading" | "preview" | "error";

/* ──────────────────────────────────────────────
 * Sortable Ingredient Item
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
        value={ingredient.amount}
        onChange={(e) => onUpdate(index, "amount", e.target.value)}
        className="w-20 shrink-0 bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 focus:text-primary placeholder:text-outline"
        placeholder="Menge"
      />
      <input
        type="text"
        value={ingredient.name}
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
 * Main Client Component
 * ──────────────────────────────────────────────*/
export function ImportierenClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [state, setState] = useState<ImportState>("idle");
  const [url, setUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  // Editable recipe data
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-fill from query param
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setUrl(urlParam);
    }
  }, [searchParams]);

  /* ── Import Handler ── */
  const handleImport = useCallback(async () => {
    if (!url.trim()) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Unbekannter Fehler.");
        setState("error");
        return;
      }

      const parsed = data as ParsedRecipe;
      setTitle(parsed.title);
      setImageUrl(parsed.image_url);
      setCookingTime(parsed.cooking_time ? String(parsed.cooking_time) : "");
      setServings(parsed.servings ? String(parsed.servings) : "");
      setSourceUrl(parsed.source_url);
      setSourceName(parsed.source_name);
      setIngredients(parsed.ingredients);
      setSteps(parsed.steps);
      setState("preview");
    } catch {
      setErrorMsg("Netzwerkfehler – bitte versuche es erneut.");
      setState("error");
    }
  }, [url]);

  /* ── Clipboard Paste ── */
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      // Clipboard API not available or denied
    }
  }, []);

  /* ── Save Handler ── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await saveRecipe({
        title,
        image_url: imageUrl,
        cooking_time: cookingTime ? parseInt(cookingTime, 10) : null,
        servings: servings ? parseInt(servings, 10) : null,
        difficulty: null,
        source_url: sourceUrl,
        source_name: sourceName,
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
    title,
    imageUrl,
    cookingTime,
    servings,
    sourceUrl,
    sourceName,
    ingredients,
    steps,
  ]);

  /* ── Ingredient handlers ── */
  const updateIngredient = (
    index: number,
    field: "amount" | "name",
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
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
      (_, i) => `ing-${i}` === active.id
    );
    const newIndex = ingredients.findIndex(
      (_, i) => `ing-${i}` === over.id
    );

    setIngredients((prev) =>
      arrayMove(prev, oldIndex, newIndex).map((ing, i) => ({
        ...ing,
        sort_order: i,
      }))
    );
  };

  /* ── Step handlers ── */
  const updateStep = (index: number, description: string) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, description } : s))
    );
  };

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, step_number: i + 1 }))
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

  /* ── Switch to manual mode ── */
  const switchToManual = () => {
    setTitle("");
    setImageUrl(null);
    setCookingTime("");
    setServings("");
    setSourceUrl(url);
    setSourceName("Manuell");
    setIngredients([
      { amount: "", name: "", sort_order: 0 },
    ]);
    setSteps([
      { step_number: 1, title: null, description: "", timer_seconds: null, tip: null },
    ]);
    setState("preview");
  };

  return (
    <div className="p-4 lg:p-8 pb-32 lg:pb-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* ── Hero Section ── */}
        <section className="space-y-8">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline text-on-surface">
              Rezept importieren
            </h1>
            <p className="text-on-surface-variant text-lg">
              Kopiere einfach den Link deiner Lieblingsseite und wir erledigen
              den Rest.
            </p>
          </div>

          <div className="bg-surface-container-low p-6 md:p-8 rounded-xl space-y-6">
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">
                    content_paste
                  </span>
                </div>
                <input
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImport()}
                  className="w-full h-16 pl-14 pr-6 bg-surface-container-lowest border-none rounded-full text-lg focus:ring-2 focus:ring-primary/40 placeholder:text-outline-variant transition-all"
                  placeholder="Rezept-URL einfügen..."
                  disabled={state === "loading"}
                />
              </div>
              <button
                type="button"
                onClick={handlePaste}
                className="h-16 px-5 bg-surface-container rounded-full text-primary hover:bg-surface-container-high transition-colors flex items-center gap-2 shrink-0"
                title="Aus Zwischenablage einfügen"
              >
                <span className="material-symbols-outlined">
                  content_paste_go
                </span>
                <span className="hidden md:inline text-sm font-semibold">
                  Einfügen
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleImport}
              disabled={!url.trim() || state === "loading"}
              className="w-full md:w-auto px-10 h-14 hero-gradient text-white rounded-full font-bold text-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === "loading" ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Rezept wird extrahiert...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">
                    auto_awesome
                  </span>
                  Rezept importieren
                </>
              )}
            </button>
          </div>
        </section>

        {/* ── Loading Skeleton ── */}
        {state === "loading" && (
          <section className="space-y-6 animate-pulse">
            <div className="h-4 bg-surface-container rounded w-1/3 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-4">
                <div className="aspect-[4/3] bg-surface-container rounded-xl" />
                <div className="h-8 bg-surface-container rounded w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-surface-container rounded-lg" />
                  <div className="h-20 bg-surface-container rounded-lg" />
                </div>
              </div>
              <div className="md:col-span-5 bg-surface-container-low p-8 rounded-xl space-y-4">
                <div className="h-6 bg-surface-container rounded w-1/2" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-surface-container rounded" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Error State ── */}
        {state === "error" && (
          <section className="bg-error-container/30 border border-error/20 p-8 rounded-xl text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="material-symbols-outlined text-error text-4xl">
              error
            </span>
            <p className="text-lg font-semibold text-on-surface">{errorMsg}</p>
            <p className="text-on-surface-variant">
              Du kannst das Rezept auch manuell eingeben.
            </p>
            <button
              type="button"
              onClick={switchToManual}
              className="mt-2 px-8 h-12 bg-surface-container-high text-primary rounded-full font-semibold hover:bg-surface-variant transition-colors"
            >
              Manuell eingeben
            </button>
          </section>
        )}

        {/* ── Preview & Edit ── */}
        {state === "preview" && (
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-outline-variant/20" />
              <span className="font-label text-outline uppercase tracking-widest text-sm font-semibold">
                Vorschau &amp; Bearbeitung
              </span>
              <div className="h-px flex-1 bg-outline-variant/20" />
            </div>

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
                    Rezept speichern
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowDiscard(true)}
                className="w-full md:w-auto px-8 h-16 bg-surface-container-high text-primary rounded-full font-bold text-lg hover:bg-surface-variant transition-colors"
              >
                Verwerfen
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Discard Confirm Dialog */}
      <ConfirmDialog
        open={showDiscard}
        onOpenChange={setShowDiscard}
        title="Rezept verwerfen?"
        message="Alle eingegebenen Daten gehen verloren."
        confirmLabel="Verwerfen"
        destructive
        onConfirm={() => router.push("/rezepte")}
      />
    </div>
  );
}
