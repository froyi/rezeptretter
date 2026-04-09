"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { RecipeCard } from "@/components/recipe-card";
import { EmptyState } from "@/components/empty-state";

const CATEGORIES = [
  { label: "Alle Rezepte", value: null },
  { label: "Vegetarisch", value: "Vegetarisch" },
  { label: "Schnelle Küche", value: "Schnelle Küche" },
  { label: "Backen", value: "Backen" },
];

interface RezepteClientProps {
  recipes: Recipe[];
}

export function RezepteClient({ recipes }: RezepteClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = recipes;

    // Search filter (title + source)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.source_name?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory) {
      result = result.filter((r) => r.category?.includes(activeCategory));
    }

    return result;
  }, [recipes, search, activeCategory]);

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

      {/* Category Chips */}
      <section className="mb-8 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.value)}
            className={`whitespace-nowrap px-6 py-3 rounded-full font-medium text-sm transition-all ${
              activeCategory === cat.value
                ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* Results count */}
      {(search || activeCategory) && (
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
          description={`Kein Rezept passt zu "${search}"${activeCategory ? ` in der Kategorie "${activeCategory}"` : ""}.`}
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
