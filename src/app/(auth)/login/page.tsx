"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, signInWithMagicLink } from "@/app/actions/auth";

type TabMode = "login" | "register" | "magic";

export default function LoginPage() {
  const [tab, setTab] = useState<TabMode>("login");
  const [loginState, loginAction, loginPending] = useActionState(signIn, null);
  const [registerState, registerAction, registerPending] = useActionState(signUp, null);
  const [magicState, magicAction, magicPending] = useActionState(signInWithMagicLink, null);

  return (
    <div className="bg-card rounded-2xl p-8 space-y-6 shadow-lg w-full max-w-md">
      {/* Header */}
      <div className="text-center">
        <span className="material-symbols-outlined text-primary text-4xl">
          restaurant_menu
        </span>
        <h1 className="text-2xl font-headline font-bold mt-2 text-on-surface">
          Willkommen zurück
        </h1>
        <p className="text-on-surface-variant mt-1">
          Melde dich an oder erstelle ein Konto
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-surface-container p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-label font-medium transition-all ${
            tab === "login"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Anmelden
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-label font-medium transition-all ${
            tab === "register"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Registrieren
        </button>
      </div>

      {/* Login Form */}
      {tab === "login" && (
        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-label font-medium text-on-surface">
              E-Mail
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="deine@email.de"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border-0 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-label font-medium text-on-surface">
              Passwort
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border-0 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {loginState?.error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm">
              {loginState.error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginPending}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-label font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                Anmelden…
              </span>
            ) : (
              "Anmelden"
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab("magic")}
            className="w-full py-2 text-sm text-primary font-label font-medium hover:underline"
          >
            Ohne Passwort anmelden →
          </button>
        </form>
      )}

      {/* Register Form */}
      {tab === "register" && (
        <form action={registerAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="register-name" className="text-sm font-label font-medium text-on-surface">
              Name (optional)
            </label>
            <input
              id="register-name"
              name="displayName"
              type="text"
              autoComplete="name"
              placeholder="Dein Name"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border-0 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-label font-medium text-on-surface">
              E-Mail
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="deine@email.de"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border-0 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-label font-medium text-on-surface">
              Passwort
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Min. 6 Zeichen"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border-0 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {registerState?.error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm">
              {registerState.error}
            </div>
          )}
          {registerState?.success && (
            <div className="p-3 rounded-xl bg-tertiary-container text-on-tertiary-container text-sm">
              {registerState.success}
            </div>
          )}

          <button
            type="submit"
            disabled={registerPending}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-label font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                Registrieren…
              </span>
            ) : (
              "Konto erstellen"
            )}
          </button>
        </form>
      )}

      {/* Magic Link Form */}
      {tab === "magic" && (
        <form action={magicAction} className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Wir senden dir einen Magic Link per E-Mail. Kein Passwort nötig.
          </p>
          <div className="space-y-2">
            <label htmlFor="magic-email" className="text-sm font-label font-medium text-on-surface">
              E-Mail
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="deine@email.de"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border-0 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {magicState?.error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm">
              {magicState.error}
            </div>
          )}
          {magicState?.success && (
            <div className="p-3 rounded-xl bg-tertiary-container text-on-tertiary-container text-sm">
              {magicState.success}
            </div>
          )}

          <button
            type="submit"
            disabled={magicPending}
            className="w-full py-3 rounded-xl bg-secondary-container text-on-secondary-container font-label font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {magicPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                Sende Link…
              </span>
            ) : (
              "Magic Link senden ✨"
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab("login")}
            className="w-full py-2 text-sm text-primary font-label font-medium hover:underline"
          >
            ← Zurück zur Anmeldung
          </button>
        </form>
      )}

      {/* Google OAuth – vorbereitet, nicht aktiv */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-on-surface-variant">oder</span>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="w-full py-3 rounded-xl bg-surface-container text-on-surface-variant font-label font-medium text-sm flex items-center justify-center gap-3 opacity-40 cursor-not-allowed"
        title="Google Login kommt bald"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Mit Google anmelden (bald verfügbar)
      </button>
    </div>
  );
}
