"use client";

import { useEffect, useCallback, useRef } from "react";

/* ──────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────*/
interface CookTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

/* ──────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────*/
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTimerLabel(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}:00`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ──────────────────────────────────────────────
 * Timer Alarm
 * ──────────────────────────────────────────────*/
function playAlarm() {
  try {
    // Generate a simple beep using Web Audio API
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = 880; // A5
    oscillator.type = "sine";
    gain.gain.value = 0.3;

    oscillator.start();

    // Beep pattern: on-off-on-off-on
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0, now + 0.15);
    gain.gain.setValueAtTime(0.3, now + 0.3);
    gain.gain.setValueAtTime(0, now + 0.45);
    gain.gain.setValueAtTime(0.3, now + 0.6);
    gain.gain.setValueAtTime(0, now + 0.75);

    oscillator.stop(now + 0.8);
  } catch {
    // Audio not available
  }
}

function vibrate() {
  try {
    navigator?.vibrate?.([200, 100, 200, 100, 200]);
  } catch {
    // Vibration not available
  }
}

/* ──────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────*/
export default function CookTimer({
  totalSeconds,
  remainingSeconds,
  isRunning,
  onStart,
  onPause,
  onReset,
}: CookTimerProps) {
  const hasAlerted = useRef(false);

  // Alarm when timer finishes
  useEffect(() => {
    if (remainingSeconds === 0 && !hasAlerted.current && totalSeconds > 0) {
      hasAlerted.current = true;
      playAlarm();
      vibrate();
    }
    if (remainingSeconds > 0) {
      hasAlerted.current = false;
    }
  }, [remainingSeconds, totalSeconds]);

  // SVG circle calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const isFinished = remainingSeconds === 0 && totalSeconds > 0;

  // If timer hasn't been started yet, show the start button
  if (!isRunning && remainingSeconds === totalSeconds) {
    return (
      <button
        onClick={onStart}
        className="w-full flex items-center justify-center gap-4 px-8 py-6 rounded-2xl font-black text-lg shadow-xl hover:brightness-110 active:scale-[0.98] transition-all text-white"
        style={{
          backgroundColor: "var(--cook-primary, #E65100)",
          boxShadow: "0 10px 25px rgba(230, 81, 0, 0.3)",
        }}
      >
        <span
          className="material-symbols-outlined text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          timer
        </span>
        <span>TIMER STARTEN ({formatTimerLabel(totalSeconds)})</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* SVG Progress Circle */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={isFinished ? "#2E7D32" : "var(--cook-primary, #E65100)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-4xl font-black tabular-nums font-headline ${
              isFinished ? "text-[#2E7D32]" : "text-on-surface"
            } ${isFinished ? "animate-pulse" : ""}`}
          >
            {formatTime(remainingSeconds)}
          </span>
          {isFinished && (
            <span className="text-xs font-bold text-[#2E7D32] uppercase tracking-widest mt-1">
              Fertig!
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isFinished && (
          <button
            onClick={isRunning ? onPause : onStart}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
            style={{ backgroundColor: "var(--cook-primary, #E65100)" }}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isRunning ? "pause" : "play_arrow"}
            </span>
          </button>
        )}
        <button
          onClick={onReset}
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-gray-200 text-gray-500 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl">restart_alt</span>
        </button>
      </div>
    </div>
  );
}
