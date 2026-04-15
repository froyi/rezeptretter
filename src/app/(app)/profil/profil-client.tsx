"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import {
  updateDisplayName,
  updateSettings,
  updatePassword,
  updateEmail,
  deleteAccount,
} from "@/app/actions/profile";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDarkMode } from "@/hooks/use-dark-mode";
import type {
  Profile,
  UserSettings,
  CookModeFontSize,
  DarkModePreference,
} from "@/lib/types/database.types";

/* ─── Props ─── */
interface ProfilClientProps {
  profile: Profile;
  email: string;
}

/* ─── Helpers ─── */
function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

/* ─── Main component ─── */
export function ProfilClient({ profile, email }: ProfilClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for settings (optimistic)
  const [settings, setSettings] = useState<UserSettings>(profile.settings);
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [isEditingName, setIsEditingName] = useState(false);

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Email form
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  // Danger zone
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Dark mode
  useDarkMode(settings.dark_mode);

  /* ─── Settings updater ─── */
  const patchSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      startTransition(async () => {
        const res = await updateSettings(next);
        if (res.error) {
          setFeedback(`Fehler: ${res.error}`);
          setSettings(settings); // rollback
        }
      });
    },
    [settings]
  );

  /* ─── Name save ─── */
  function handleSaveName() {
    startTransition(async () => {
      const res = await updateDisplayName(displayName);
      if (res.error) {
        setFeedback(`Fehler: ${res.error}`);
      } else {
        setIsEditingName(false);
        setFeedback("Name gespeichert");
        setTimeout(() => setFeedback(null), 2000);
      }
    });
  }

  /* ─── Password save ─── */
  function handleSavePassword() {
    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Mindestens 6 Zeichen",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Passwörter stimmen nicht überein",
      });
      return;
    }
    startTransition(async () => {
      const res = await updatePassword(newPassword);
      if (res.error) {
        setPasswordMessage({ type: "error", text: res.error });
      } else {
        setPasswordMessage({
          type: "success",
          text: "Passwort geändert!",
        });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordMessage(null);
        }, 2000);
      }
    });
  }

  /* ─── Email save ─── */
  function handleSaveEmail() {
    if (!newEmail.includes("@")) {
      setEmailMessage({ type: "error", text: "Ungültige E-Mail-Adresse" });
      return;
    }
    startTransition(async () => {
      const res = await updateEmail(newEmail);
      if (res.error) {
        setEmailMessage({ type: "error", text: res.error });
      } else {
        setEmailMessage({
          type: "success",
          text: res.message || "Bestätigungs-Mail gesendet!",
        });
        setNewEmail("");
        setTimeout(() => {
          setShowEmailForm(false);
          setEmailMessage(null);
        }, 3000);
      }
    });
  }

  /* ─── Delete account ─── */
  function handleDeleteAccount() {
    startTransition(async () => {
      await deleteAccount();
      router.push("/login");
    });
  }

  const initials = getInitials(profile.display_name, email);

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6 pb-32">
      {/* ─── Header ─── */}
      <h1 className="text-3xl font-headline font-bold text-on-surface">
        Profil & Einstellungen
      </h1>

      {/* ─── Feedback Toast ─── */}
      {feedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface-container-high rounded-full px-6 py-3 shadow-lg text-sm text-on-surface font-medium animate-fade-in">
          {feedback}
        </div>
      )}

      {/* ═══ SECTION: User Info ═══ */}
      <section
        id="profile-user-info"
        className="bg-surface-container-low rounded-2xl p-6"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center shrink-0">
            <span className="text-2xl font-headline font-bold text-white">
              {initials}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  id="profile-name-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 bg-surface-container rounded-xl px-3 py-2 text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                />
                <button
                  id="profile-name-save"
                  onClick={handleSaveName}
                  disabled={isPending}
                  className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined text-xl">
                    check
                  </span>
                </button>
              </div>
            ) : (
              <button
                id="profile-name-edit"
                onClick={() => setIsEditingName(true)}
                className="group text-left w-full"
              >
                <p className="text-lg font-headline font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                  {profile.display_name || "Name hinzufügen"}
                  <span className="material-symbols-outlined text-base ml-1 opacity-0 group-hover:opacity-100 transition-opacity align-middle">
                    edit
                  </span>
                </p>
              </button>
            )}
            <p className="text-sm text-on-surface-variant truncate mt-0.5">
              {email}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION: Account ═══ */}
      <section
        id="profile-account"
        className="bg-surface-container-low rounded-2xl overflow-hidden"
      >
        <h2 className="px-6 pt-5 pb-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Account
        </h2>

        {/* Password */}
        <div className="border-b border-outline-variant/10">
          <button
            id="profile-password-toggle"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container/50 transition-colors min-h-12"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">
                lock
              </span>
              <span className="text-on-surface font-medium">
                Passwort ändern
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-on-surface-variant transition-transform ${showPasswordForm ? "rotate-180" : ""}`}
            >
              expand_more
            </span>
          </button>

          {showPasswordForm && (
            <div className="px-6 pb-4 space-y-3 animate-fade-in">
              <input
                id="profile-new-password"
                type="password"
                placeholder="Neues Passwort"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                id="profile-confirm-password"
                type="password"
                placeholder="Passwort bestätigen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSavePassword();
                }}
              />
              {passwordMessage && (
                <p
                  className={`text-sm ${passwordMessage.type === "error" ? "text-error" : "text-primary"}`}
                >
                  {passwordMessage.text}
                </p>
              )}
              <button
                id="profile-save-password"
                onClick={handleSavePassword}
                disabled={isPending}
                className="w-full h-12 rounded-full hero-gradient text-white font-medium disabled:opacity-50"
              >
                {isPending ? "Speichern…" : "Passwort ändern"}
              </button>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <button
            id="profile-email-toggle"
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container/50 transition-colors min-h-12"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">
                mail
              </span>
              <span className="text-on-surface font-medium">
                E-Mail ändern
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-on-surface-variant transition-transform ${showEmailForm ? "rotate-180" : ""}`}
            >
              expand_more
            </span>
          </button>

          {showEmailForm && (
            <div className="px-6 pb-4 space-y-3 animate-fade-in">
              <p className="text-xs text-on-surface-variant">
                Aktuelle Adresse: {email}
              </p>
              <input
                id="profile-new-email"
                type="email"
                placeholder="Neue E-Mail-Adresse"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEmail();
                }}
              />
              {emailMessage && (
                <p
                  className={`text-sm ${emailMessage.type === "error" ? "text-error" : "text-primary"}`}
                >
                  {emailMessage.text}
                </p>
              )}
              <button
                id="profile-save-email"
                onClick={handleSaveEmail}
                disabled={isPending}
                className="w-full h-12 rounded-full hero-gradient text-white font-medium disabled:opacity-50"
              >
                {isPending ? "Speichern…" : "Bestätigungs-Mail senden"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ SECTION: App Settings ═══ */}
      <section
        id="profile-settings"
        className="bg-surface-container-low rounded-2xl overflow-hidden"
      >
        <h2 className="px-6 pt-5 pb-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          App Einstellungen
        </h2>

        {/* Default servings */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 min-h-12">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">
              restaurant
            </span>
            <span className="text-on-surface font-medium">
              Standardportionen
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="profile-servings-minus"
              onClick={() =>
                patchSettings({
                  default_servings: Math.max(1, settings.default_servings - 1),
                })
              }
              disabled={settings.default_servings <= 1}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-lg">remove</span>
            </button>
            <span className="w-8 text-center font-headline font-bold text-on-surface text-lg">
              {settings.default_servings}
            </span>
            <button
              id="profile-servings-plus"
              onClick={() =>
                patchSettings({
                  default_servings: Math.min(
                    12,
                    settings.default_servings + 1
                  ),
                })
              }
              disabled={settings.default_servings >= 12}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>
        </div>

        {/* Cook mode font size */}
        <div className="px-6 py-4 border-b border-outline-variant/10 min-h-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-on-surface-variant">
              text_fields
            </span>
            <span className="text-on-surface font-medium">
              Kochmodus Schriftgröße
            </span>
          </div>
          <div className="flex rounded-xl overflow-hidden bg-surface-container">
            {(
              [
                { value: "normal", label: "Normal" },
                { value: "large", label: "Groß" },
                { value: "xlarge", label: "Sehr groß" },
              ] as { value: CookModeFontSize; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                id={`profile-font-${opt.value}`}
                onClick={() =>
                  patchSettings({ cook_mode_font_size: opt.value })
                }
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  settings.cook_mode_font_size === opt.value
                    ? "hero-gradient text-white"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Sound */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 min-h-12">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">
              volume_up
            </span>
            <span className="text-on-surface font-medium">Timer-Sound</span>
          </div>
          <button
            id="profile-timer-sound"
            onClick={() =>
              patchSettings({ timer_sound: !settings.timer_sound })
            }
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.timer_sound
                ? "hero-gradient"
                : "bg-surface-container-high"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                settings.timer_sound ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Timer Vibration */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 min-h-12">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">
              vibration
            </span>
            <span className="text-on-surface font-medium">
              Timer-Vibration
            </span>
          </div>
          <button
            id="profile-timer-vibration"
            onClick={() =>
              patchSettings({ timer_vibration: !settings.timer_vibration })
            }
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.timer_vibration
                ? "hero-gradient"
                : "bg-surface-container-high"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                settings.timer_vibration
                  ? "translate-x-[22px]"
                  : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Dark Mode */}
        <div className="px-6 py-4 min-h-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-on-surface-variant">
              dark_mode
            </span>
            <span className="text-on-surface font-medium">Erscheinungsbild</span>
          </div>
          <div className="flex rounded-xl overflow-hidden bg-surface-container">
            {(
              [
                { value: "system", label: "System", icon: "smartphone" },
                { value: "light", label: "Hell", icon: "light_mode" },
                { value: "dark", label: "Dunkel", icon: "dark_mode" },
              ] as { value: DarkModePreference; label: string; icon: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                id={`profile-darkmode-${opt.value}`}
                onClick={() => patchSettings({ dark_mode: opt.value })}
                className={`flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  settings.dark_mode === opt.value
                    ? "hero-gradient text-white"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION: Danger Zone ═══ */}
      <section
        id="profile-danger-zone"
        className="bg-error-container/20 rounded-2xl overflow-hidden"
      >
        <h2 className="px-6 pt-5 pb-2 text-xs font-bold text-error uppercase tracking-wider">
          Gefahrenzone
        </h2>

        {/* Logout */}
        <button
          id="profile-logout"
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-error-container/30 transition-colors border-b border-outline-variant/10 min-h-12"
        >
          <span className="material-symbols-outlined text-error">logout</span>
          <span className="text-on-surface font-medium">Abmelden</span>
        </button>

        {/* Delete account */}
        <button
          id="profile-delete-account"
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-error-container/30 transition-colors min-h-12"
        >
          <span className="material-symbols-outlined text-error">
            delete_forever
          </span>
          <span className="text-error font-medium">Account löschen</span>
        </button>
      </section>

      {/* ─── App Version ─── */}
      <p className="text-center text-xs text-on-surface-variant/50 pb-4">
        Rezeptretter v1.0.0
      </p>

      {/* ─── Dialogs ─── */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Abmelden"
        message="Möchtest du dich wirklich abmelden?"
        confirmLabel="Abmelden"
        onConfirm={() => {
          startTransition(async () => {
            await signOut();
          });
        }}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Account löschen"
        message="Alle deine Rezepte und Daten werden unwiderruflich gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden."
        confirmLabel="Endgültig löschen"
        destructive
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
