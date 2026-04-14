"use client";

import { useActionState, useState, useTransition } from "react";
import { signIn, signUp, signInWithMagicLink, signInWithGoogle } from "@/app/actions/auth";

type TabMode = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<TabMode>("login");
  const [loginState, loginAction, loginPending] = useActionState(signIn, null);
  const [registerState, registerAction, registerPending] = useActionState(signUp, null);
  const [magicState, magicAction, magicPending] = useActionState(signInWithMagicLink, null);
  const [googlePending, startGoogleTransition] = useTransition();

  return (
    <div className="w-full max-w-md bg-surface-container-low rounded-xl p-1 overflow-hidden">
      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-surface-container rounded-t-xl">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 py-3 text-center font-label font-bold rounded-full transition-all duration-200 ${
            tab === "login"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Anmelden
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`flex-1 py-3 text-center font-label font-bold rounded-full transition-all duration-200 ${
            tab === "register"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Registrieren
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-surface-container-lowest p-8 md:p-10 rounded-b-xl rounded-t-lg">
        {/* Login Form */}
        {tab === "login" && (
          <>
            <div className="mb-8 text-center">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
                Willkommen zurück
              </h2>
              <p className="text-on-surface-variant font-body">
                Melde dich an, um deine Rezepte zu verwalten.
              </p>
            </div>

            <form action={loginAction} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="beispiel@mail.de"
                  className="w-full h-14 bg-surface-container border-0 rounded-full px-6 text-on-surface placeholder:text-stone-400 focus:ring-2 focus:ring-primary/40 transition-all outline-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="login-password"
                    className="block font-label text-sm font-semibold text-on-surface-variant"
                  >
                    Passwort
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Vergessen?
                  </button>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-14 bg-surface-container border-0 rounded-full px-6 text-on-surface placeholder:text-stone-400 focus:ring-2 focus:ring-primary/40 transition-all outline-none"
                />
              </div>

              {/* Error */}
              {loginState?.error && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm">
                  {loginState.error}
                </div>
              )}

              {/* Primary Action */}
              <button
                type="submit"
                disabled={loginPending}
                className="hero-gradient w-full h-14 rounded-full text-white font-headline font-bold text-lg shadow-lg shadow-primary/10 active:scale-95 transition-transform duration-150 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    Anmelden…
                  </span>
                ) : (
                  "Anmelden"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-container-lowest text-on-surface-variant font-label">
                  oder
                </span>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-4">
              {/* Magic Link */}
              <form action={magicAction}>
                <input type="hidden" name="email" id="magic-email-hidden" />
                <button
                  type="button"
                  onClick={() => {
                    const emailInput = document.getElementById("login-email") as HTMLInputElement;
                    const hiddenInput = document.getElementById("magic-email-hidden") as HTMLInputElement;
                    if (emailInput?.value) {
                      hiddenInput.value = emailInput.value;
                      hiddenInput.form?.requestSubmit();
                    }
                  }}
                  disabled={magicPending}
                  className="w-full h-14 bg-surface-container-high hover:bg-surface-variant text-primary font-label font-bold rounded-full flex items-center justify-center gap-3 transition-colors active:scale-95 duration-150 disabled:opacity-50"
                >
                  {magicPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-lg">
                        progress_activity
                      </span>
                      Sende Link…
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">
                        magic_button
                      </span>
                      Magic Link per E-Mail senden
                    </>
                  )}
                </button>
              </form>

              {magicState?.success && (
                <div className="p-3 rounded-xl bg-tertiary-container text-on-tertiary-container text-sm text-center">
                  {magicState.success}
                </div>
              )}
              {magicState?.error && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm text-center">
                  {magicState.error}
                </div>
              )}

              {/* Google Login */}
              <button
                type="button"
                onClick={() =>
                  startGoogleTransition(() => {
                    signInWithGoogle();
                  })
                }
                disabled={googlePending}
                className="w-full h-14 bg-white border border-outline-variant/50 text-on-surface font-label font-bold rounded-full flex items-center justify-center gap-3 transition-all hover:bg-surface-container-low active:scale-95 duration-150 disabled:opacity-50"
              >
                {googlePending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    Google Login…
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Mit Google anmelden
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <>
            <div className="mb-8 text-center">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
                Konto erstellen
              </h2>
              <p className="text-on-surface-variant font-body">
                Starte jetzt und rette deine Lieblingsrezepte.
              </p>
            </div>

            <form action={registerAction} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor="register-name"
                  className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                >
                  Name (optional)
                </label>
                <input
                  id="register-name"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  placeholder="Dein Name"
                  className="w-full h-14 bg-surface-container border-0 rounded-full px-6 text-on-surface placeholder:text-stone-400 focus:ring-2 focus:ring-primary/40 transition-all outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="register-email"
                  className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                >
                  Email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="beispiel@mail.de"
                  className="w-full h-14 bg-surface-container border-0 rounded-full px-6 text-on-surface placeholder:text-stone-400 focus:ring-2 focus:ring-primary/40 transition-all outline-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="register-password"
                  className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                >
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
                  className="w-full h-14 bg-surface-container border-0 rounded-full px-6 text-on-surface placeholder:text-stone-400 focus:ring-2 focus:ring-primary/40 transition-all outline-none"
                />
              </div>

              {/* Error / Success */}
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

              {/* Primary Action */}
              <button
                type="submit"
                disabled={registerPending}
                className="hero-gradient w-full h-14 rounded-full text-white font-headline font-bold text-lg shadow-lg shadow-primary/10 active:scale-95 transition-transform duration-150 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    Registrieren…
                  </span>
                ) : (
                  "Konto erstellen"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
