/* ──────────────────────────────────────────────
 * Loading Skeleton – Rezept-Details
 * ──────────────────────────────────────────────*/
export default function RezeptDetailLoading() {
  return (
    <div className="min-h-screen pb-32 animate-pulse">
      {/* Hero Skeleton */}
      <div className="w-full aspect-[4/3] md:aspect-[21/9] bg-surface-container-high md:rounded-xl md:mx-auto md:max-w-screen-xl md:mt-4" />

      {/* Action Bar Skeleton */}
      <div className="px-4 md:px-6 -mt-6 md:-mt-8 relative z-10 max-w-screen-xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6 shadow-[0px_12px_32px_rgba(50,18,0,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
          <div className="flex gap-3">
            <div className="h-[52px] w-48 rounded-full bg-surface-container-high" />
            <div className="h-[52px] w-[52px] rounded-full bg-surface-container-high" />
            <div className="h-[52px] w-[52px] rounded-full bg-surface-container-high" />
          </div>
          <div className="h-[48px] w-56 rounded-full bg-surface-container-high" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 px-4 md:px-6 mt-8 md:mt-12 max-w-screen-xl mx-auto">
        {/* Ingredients Skeleton */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-low rounded-xl p-6 md:p-8">
            <div className="h-8 w-24 bg-surface-container-high rounded mb-8" />
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-md bg-surface-container-high mt-1" />
                  <div className="flex-1 border-b border-outline-variant/20 pb-4 space-y-2">
                    <div className="h-5 w-16 bg-surface-container-high rounded" />
                    <div className="h-4 w-32 bg-surface-container-high rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps Skeleton */}
        <div className="lg:col-span-8 space-y-12">
          <div className="h-8 w-56 bg-surface-container-high rounded border-l-4 border-primary/20 pl-4" />
          <div className="space-y-16">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-8">
                <div className="h-16 w-12 bg-surface-container-high rounded" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-48 bg-surface-container-high rounded" />
                  <div className="h-4 w-full bg-surface-container-high rounded" />
                  <div className="h-4 w-3/4 bg-surface-container-high rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
