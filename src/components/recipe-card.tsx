import Image from "next/image";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    imageUrl?: string | null;
    cookingTime?: number | null;
    source?: string | null;
    sourceIcon?: string;
  };
  onClick?: () => void;
}

function getSourceIcon(source?: string | null): string {
  if (!source) return "language";
  const s = source.toLowerCase();
  if (s.includes("chefkoch")) return "restaurant";
  if (s.includes("instagram")) return "photo_camera";
  if (s.includes("youtube")) return "play_circle";
  if (s.includes("tiktok")) return "music_note";
  return "language";
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const sourceIcon = recipe.sourceIcon || getSourceIcon(recipe.source);

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-4 group text-left w-full"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-surface-container-low transition-transform duration-500 group-hover:scale-[1.02]">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          /* Placeholder */
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant/40">
              restaurant
            </span>
          </div>
        )}

        {/* Time Badge */}
        {recipe.cookingTime && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-sm text-primary">
              schedule
            </span>
            <span className="text-xs font-bold text-on-primary-fixed">
              {recipe.cookingTime} Min
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="px-2">
        {recipe.source && (
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-lg">
              {sourceIcon}
            </span>
            <span className="text-xs font-medium text-outline tracking-wider uppercase">
              {recipe.source}
            </span>
          </div>
        )}
        <h3 className="text-xl font-bold text-on-surface leading-tight line-clamp-2 font-headline">
          {recipe.title}
        </h3>
      </div>
    </button>
  );
}
