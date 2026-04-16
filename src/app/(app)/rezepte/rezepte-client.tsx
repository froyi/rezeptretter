"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { RecipeCard } from "@/components/recipe-card";
import { EmptyState } from "@/components/empty-state";


type RecipeWithIngredients = Recipe & { ingredients: { name: string }[] };

interface RezepteClientProps {
  recipes: RecipeWithIngredients[];
}

export function RezepteClient({ recipes }: RezepteClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState<string | null>(null);

  // Dynamische Quellen-Chips basierend auf vorhandenen Rezepten
  const sources = useMemo(() => {
    const sourceSet = new Set<string>();
    recipes.forEach((r) => {
      if (r.source_name) sourceSet.add(r.source_name);
    });
    return Array.from(sourceSet).sort();
  }, [recipes]);

  const filtered = useMemo(() => {
    let result = recipes;

    // Search filter (title + source)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.source_name?.toLowerCase().includes(q) ||
          r.ingredients?.some((ing) => ing.name.toLowerCase().includes(q))
      );
    }

    // Source filter
    if (activeSource) {
      result = result.filter((r) => r.source_name === activeSource);
    }

    return result;
  }, [recipes, search, activeSource]);

  // Empty state
  if (recipes.length === 0) {
    return (
      <div className="p-4 lg:p-8">
        <EmptyState
          icon="menu_book"
          title="Noch keine Rezepte"
          description="Importiere dein erstes Rezept aus dem Web – einfach URL einfügen und loslegen."
          actionLabel="Erstes Rezept importieren"
          onAction={() => router.push("/importieren")}
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-screen-2xl mx-auto">
      {/* Search */}
      <section className="mb-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline-variant">
              search
            </span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche Rezepte oder Zutaten..."
            className="w-full h-14 lg:h-16 pl-14 pr-6 bg-surface-container border-none rounded-full focus:ring-2 focus:ring-primary/40 text-base lg:text-lg placeholder:text-on-surface-variant/60 transition-all outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-5 flex items-center"
            >
              <span className="material-symbols-outlined text-outline-variant hover:text-on-surface transition-colors">
                close
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Source Filter Chips */}
      {sources.length > 1 && (
        <section className="mb-8 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveSource(null)}
            className={`whitespace-nowrap px-6 py-3 rounded-full font-medium text-sm transition-all ${
              activeSource === null
                ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            Alle Quellen
          </button>
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => setActiveSource(activeSource === source ? null : source)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeSource === source
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {source}
            </button>
          ))}
        </section>
      )}

      {/* Results count */}
      {(search || activeSource) && (
        <p className="text-sm text-on-surface-variant mb-4">
          {filtered.length}{" "}
          {filtered.length === 1 ? "Rezept" : "Rezepte"} gefunden
        </p>
      )}

      {/* Recipe Grid */}
      {filtered.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={{
                id: recipe.id,
                title: recipe.title,
                imageUrl: recipe.image_url,
                cookingTime: recipe.cooking_time,
                source: recipe.source_name,
              }}
              onClick={() => router.push(`/rezepte/${recipe.id}`)}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon="search_off"
          title="Keine Treffer"
          description={`Kein Rezept passt zu "${search}"${activeSource ? ` von "${activeSource}"` : ""}.`}
        />
      )}

      {/* FAB – Import button (Mobile only) */}
      <Link
        href="/importieren"
        className="fixed bottom-28 right-6 z-40 lg:hidden w-16 h-16 rounded-full hero-gradient text-white flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>
    </div>
  );
}
