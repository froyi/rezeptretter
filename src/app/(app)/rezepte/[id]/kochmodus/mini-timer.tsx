"use client";

/* ──────────────────────────────────────────────
 * Mini Timer – Shows in corner when navigating
 * away from a step with a running timer.
 * ──────────────────────────────────────────────*/
interface MiniTimerProps {
  remainingSeconds: number;
  stepNumber: number;
  onClick: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MiniTimer({
  remainingSeconds,
  stepNumber,
  onClick,
}: MiniTimerProps) {
  const isUrgent = remainingSeconds <= 10;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-52 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl transition-all active:scale-95 ${
        isUrgent ? "animate-pulse" : ""
      }`}
      style={{
        backgroundColor: isUrgent
          ? "rgba(230, 81, 0, 0.95)"
          : "rgba(0, 0, 0, 0.85)",
      }}
    >
      <span
        className="material-symbols-outlined text-white text-lg"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        timer
      </span>
      <div className="flex flex-col items-start">
        <span className="text-white font-black text-base tabular-nums leading-tight">
          {formatTime(remainingSeconds)}
        </span>
        <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider leading-tight">
          Schritt {stepNumber}
        </span>
      </div>
    </button>
  );
}
