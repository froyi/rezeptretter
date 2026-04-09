import { GradientButton } from "@/components/gradient-button";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-8">
      {/* Icon Circle */}
      <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-outline-variant">
          {icon}
        </span>
      </div>

      {/* Text */}
      <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
        {title}
      </h2>
      <p className="text-on-surface-variant max-w-sm leading-relaxed">
        {description}
      </p>

      {/* CTA */}
      {actionLabel && onAction && (
        <div className="mt-8">
          <GradientButton onClick={onAction}>{actionLabel}</GradientButton>
        </div>
      )}
    </div>
  );
}
