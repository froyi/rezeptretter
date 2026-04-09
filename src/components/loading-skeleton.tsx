interface LoadingSkeletonProps {
  variant?: "card" | "text" | "avatar";
  count?: number;
  className?: string;
}

function SkeletonItem({
  variant,
  className = "",
}: {
  variant: string;
  className?: string;
}) {
  switch (variant) {
    case "card":
      return (
        <div className={`animate-pulse ${className}`}>
          <div className="bg-surface-container rounded-xl aspect-[4/3] mb-4" />
          <div className="px-2 space-y-2">
            <div className="h-3 bg-surface-container rounded-full w-1/3" />
            <div className="h-5 bg-surface-container rounded-full w-full" />
            <div className="h-5 bg-surface-container rounded-full w-2/3" />
          </div>
        </div>
      );
    case "avatar":
      return (
        <div
          className={`animate-pulse w-10 h-10 bg-surface-container rounded-full ${className}`}
        />
      );
    case "text":
    default:
      return (
        <div
          className={`animate-pulse h-4 bg-surface-container rounded-full ${className}`}
        />
      );
  }
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  className = "",
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} variant={variant} className={className} />
      ))}
    </>
  );
}
