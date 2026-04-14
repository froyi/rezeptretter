"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Recipe, Ingredient, Step } from "@/lib/types/database.types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useWakeLock } from "@/hooks/use-wake-lock";
import CookTimer from "./cook-timer";
import MiniTimer from "./mini-timer";
import IngredientsSheet from "./ingredients-sheet";

/* ──────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────*/
interface KochmodusClientProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  steps: Step[];
}

interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

/* ──────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────*/
export default function KochmodusClient({
  recipe,
  ingredients,
  steps,
}: KochmodusClientProps) {
  const router = useRouter();

  // Keep screen awake
  useWakeLock(true);

  // ── State ──
  const [currentStep, setCurrentStep] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [timers, setTimers] = useState<Map<number, TimerState>>(new Map());

  // ── Swipe refs ──
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // ── Timer tick ──
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        let changed = false;
        const next = new Map(prev);

        next.forEach((timer, stepIdx) => {
          if (timer.isRunning && timer.remainingSeconds > 0) {
            next.set(stepIdx, {
              ...timer,
              remainingSeconds: timer.remainingSeconds - 1,
            });
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ── Timer controls ──
  const startTimer = useCallback(
    (stepIdx: number) => {
      setTimers((prev) => {
        const next = new Map(prev);
        const existing = next.get(stepIdx);
        if (existing) {
          next.set(stepIdx, { ...existing, isRunning: true });
        } else {
          const seconds = steps[stepIdx]?.timer_seconds || 0;
          next.set(stepIdx, {
            totalSeconds: seconds,
            remainingSeconds: seconds,
            isRunning: true,
          });
        }
        return next;
      });
    },
    [steps]
  );

  const pauseTimer = useCallback((stepIdx: number) => {
    setTimers((prev) => {
      const next = new Map(prev);
      const existing = next.get(stepIdx);
      if (existing) {
        next.set(stepIdx, { ...existing, isRunning: false });
      }
      return next;
    });
  }, []);

  const resetTimer = useCallback(
    (stepIdx: number) => {
      setTimers((prev) => {
        const next = new Map(prev);
        const seconds = steps[stepIdx]?.timer_seconds || 0;
        next.set(stepIdx, {
          totalSeconds: seconds,
          remainingSeconds: seconds,
          isRunning: false,
        });
        return next;
      });
    },
    [steps]
  );

  // ── Navigation ──
  const goToStep = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < totalSteps) {
        setCurrentStep(idx);
        // Scroll content to top
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalSteps]
  );

  const goNext = useCallback(() => {
    if (isLastStep) {
      setShowFinished(true);
    } else {
      goToStep(currentStep + 1);
    }
  }, [currentStep, isLastStep, goToStep]);

  const goPrev = useCallback(() => {
    if (!isFirstStep) goToStep(currentStep - 1);
  }, [currentStep, isFirstStep, goToStep]);

  // ── Swipe handlers ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left → next
        goNext();
      } else {
        // Swiped right → prev
        goPrev();
      }
    }
  }, [goNext, goPrev]);

  // ── Find running timers on other steps ──
  const runningTimerOnOtherStep = Array.from(timers.entries()).find(
    ([idx, t]) => idx !== currentStep && t.isRunning && t.remainingSeconds > 0
  );

  // ── Current step timer ──
  const currentTimer = timers.get(currentStep);
  const currentTimerState: TimerState = currentTimer || {
    totalSeconds: step?.timer_seconds || 0,
    remainingSeconds: step?.timer_seconds || 0,
    isRunning: false,
  };

  // ── Exit handler ──
  const handleExit = useCallback(() => {
    router.push(`/rezepte/${recipe.id}`);
  }, [router, recipe.id]);

  // ─────────────────────────────────────
  // ── Guten Appetit Screen ──
  // ─────────────────────────────────────
  if (showFinished) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center p-8 bg-white"
        style={{ "--cook-primary": "#E65100" } as React.CSSProperties}
      >
        <div className="text-center space-y-6 max-w-sm">
          {/* Celebration Emoji */}
          <div className="text-8xl animate-bounce">🎉</div>

          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">
            Guten Appetit!
          </h1>

          <p className="text-on-surface-variant text-lg leading-relaxed">
            Du hast alle {totalSteps} Schritte gemeistert. Genieß dein
            selbstgekochtes{" "}
            <span
              className="font-bold"
              style={{ color: "var(--cook-primary)" }}
            >
              {recipe.title}
            </span>
            !
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleExit}
              className="w-full h-16 rounded-2xl font-black text-lg uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all"
              style={{
                backgroundColor: "var(--cook-primary)",
                boxShadow: "0 10px 25px rgba(230, 81, 0, 0.3)",
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────
  // ── No steps fallback ──
  // ─────────────────────────────────────
  if (!step || totalSteps === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8" style={{ "--cook-primary": "#E65100" } as React.CSSProperties}>
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
          menu_book
        </span>
        <h2 className="text-xl font-headline font-bold text-on-surface mb-2">
          Keine Schritte vorhanden
        </h2>
        <p className="text-on-surface-variant mb-6">
          Dieses Rezept hat noch keine Zubereitungsschritte.
        </p>
        <button
          onClick={handleExit}
          className="px-6 py-3 rounded-full border-2 border-gray-200 font-bold text-on-surface-variant active:scale-95 transition-transform"
        >
          Zurück zum Rezept
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────
  // ── Main Kochmodus UI ──
  // ─────────────────────────────────────
  return (
    <div
      className="relative min-h-[100dvh] flex flex-col bg-white overflow-hidden"
      style={
        {
          "--cook-primary": "#E65100",
          "--cook-secondary": "#FFB300",
          "--cook-tertiary": "#2E7D32",
        } as React.CSSProperties
      }
    >
      {/* ── Header (Absolute, over image) ── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 w-full bg-gradient-to-b from-black/40 to-transparent">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="bg-white/20 backdrop-blur-md text-white rounded-full p-2 active:scale-90 transition-transform"
          aria-label="Kochmodus beenden"
        >
          <span
            className="material-symbols-outlined block"
            style={{ fontVariationSettings: "'wght' 600" }}
          >
            close
          </span>
        </button>

        <div className="flex flex-col items-center">
          <h1 className="font-bold text-xs uppercase tracking-[0.2em] text-white/80 font-headline">
            Kochmodus
          </h1>
        </div>

        <div
          className="px-3 py-1.5 rounded-full shadow-lg"
          style={{ backgroundColor: "var(--cook-primary)" }}
        >
          <span className="text-white font-bold text-xs">
            Schritt {currentStep + 1} von {totalSteps}
          </span>
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto pb-64"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Hero Image ── */}
        <div className="relative w-full h-[480px] sm:h-[574px] overflow-hidden bg-stone-900">
          {(step.image_url || recipe.image_url) && (
            <Image
              src={step.image_url || recipe.image_url || ""}
              alt={step.title || `Schritt ${currentStep + 1}`}
              fill
              className="object-cover scale-110"
              sizes="100vw"
              priority
            />
          )}

          {!step.image_url && !recipe.image_url && (
            <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-8xl text-white/10">
                restaurant
              </span>
            </div>
          )}

          {/* Bottom gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Step number + short text overlay */}
          <div className="absolute bottom-0 left-0 w-full p-6 pb-12">
            <div className="flex items-center gap-4 mb-3">
              <span
                className="font-headline font-black text-6xl drop-shadow-lg"
                style={{ color: "var(--cook-secondary)" }}
              >
                {String(currentStep + 1).padStart(2, "0")}
              </span>
              <div
                className="h-1.5 w-16 rounded-full"
                style={{ backgroundColor: "var(--cook-secondary)" }}
              />
            </div>
            <p className="text-[20px] leading-tight text-white font-bold drop-shadow-md max-w-[90%]">
              {step.description.length > 80
                ? step.description.slice(0, 80) + "..."
                : step.description}
            </p>
          </div>
        </div>

        {/* ── Content Card (overlaps image) ── */}
        <div className="px-6 -mt-8 relative z-10">
          <div className="bg-white rounded-t-[3rem] p-8 shadow-2xl border-t border-gray-100">
            {/* Full step description */}
            <p className="text-[20px] leading-[1.6] text-on-surface font-medium mb-10">
              {step.description}
            </p>

            {/* Timer (only if step has timer_seconds) */}
            {step.timer_seconds && step.timer_seconds > 0 && (
              <div className="mb-10">
                <CookTimer
                  totalSeconds={step.timer_seconds}
                  remainingSeconds={currentTimerState.remainingSeconds}
                  isRunning={currentTimerState.isRunning}
                  onStart={() => startTimer(currentStep)}
                  onPause={() => pauseTimer(currentStep)}
                  onReset={() => resetTimer(currentStep)}
                />
              </div>
            )}

            {/* Profi-Tipp */}
            {step.tip && (
              <div className="bg-[#2E7D32]/5 border-l-8 border-[#2E7D32] rounded-2xl p-6 flex gap-5 items-start">
                <div className="bg-[#2E7D32]/20 p-2 rounded-xl shrink-0">
                  <span
                    className="material-symbols-outlined text-[#2E7D32] text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lightbulb
                  </span>
                </div>
                <div>
                  <span className="font-black text-[#2E7D32] text-xs uppercase tracking-widest block mb-2">
                    Profi-Tipp
                  </span>
                  <p className="text-on-surface-variant text-base leading-relaxed font-semibold">
                    {step.tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mini Timer (when navigated away from running timer) ── */}
      {runningTimerOnOtherStep && (
        <MiniTimer
          remainingSeconds={runningTimerOnOtherStep[1].remainingSeconds}
          stepNumber={runningTimerOnOtherStep[0] + 1}
          onClick={() => goToStep(runningTimerOnOtherStep[0])}
        />
      )}

      {/* ── Fixed Footer ── */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        {/* Ingredients bar */}
        <button
          onClick={() => setShowIngredients(true)}
          className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-100/50 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(255, 179, 0, 0.2)" }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{
                  color: "var(--cook-secondary)",
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                shopping_basket
              </span>
            </div>
            <span className="font-extrabold text-on-surface text-sm">
              Zutaten für diesen Schritt
            </span>
          </div>
          <span className="material-symbols-outlined text-gray-400">
            expand_less
          </span>
        </button>

        {/* Navigation buttons */}
        <div className="px-6 pt-4 pb-8 flex items-center gap-4">
          <button
            onClick={goPrev}
            disabled={isFirstStep}
            className={`flex-1 h-16 rounded-2xl border-2 border-gray-200 flex items-center justify-center font-black text-sm uppercase tracking-widest active:scale-95 transition-all ${
              isFirstStep
                ? "text-gray-300 border-gray-100 cursor-not-allowed"
                : "text-gray-500"
            }`}
          >
            <span className="material-symbols-outlined mr-2">arrow_back</span>
            Zurück
          </button>
          <button
            onClick={goNext}
            className="flex-[2] h-16 rounded-2xl bg-black text-white font-black text-sm uppercase tracking-widest flex items-center justify-center shadow-2xl active:scale-95 transition-all"
          >
            {isLastStep ? "Fertig! 🎉" : "Weiter"}
            {!isLastStep && (
              <span className="material-symbols-outlined ml-2">
                arrow_forward
              </span>
            )}
          </button>
        </div>
      </footer>

      {/* ── Ingredients Bottom Sheet ── */}
      <IngredientsSheet
        open={showIngredients}
        onOpenChange={setShowIngredients}
        ingredients={ingredients}
      />

      {/* ── Exit Confirm Dialog ── */}
      <ConfirmDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title="Kochmodus beenden?"
        message="Dein Fortschritt und laufende Timer gehen verloren."
        confirmLabel="Beenden"
        cancelLabel="Weiterkochen"
        onConfirm={handleExit}
        destructive
      />
    </div>
  );
}
