import { Button } from "@/components/ui/button";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: string;
}

export function GradientButton({
  children,
  loading,
  icon,
  disabled,
  className = "",
  ...props
}: GradientButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={`hero-gradient text-white rounded-full h-14 px-8 text-base font-semibold font-label shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-xl">
          progress_activity
        </span>
      ) : (
        <>
          {icon && (
            <span className="material-symbols-outlined text-xl mr-2">
              {icon}
            </span>
          )}
          {children}
        </>
      )}
    </Button>
  );
}
