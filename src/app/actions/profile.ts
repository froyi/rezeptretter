"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  type Profile,
  type UserSettings,
  DEFAULT_SETTINGS,
} from "@/lib/types/database.types";

/* ──────────────────────────────────────────────
 * Get or create profile
 * ──────────────────────────────────────────────*/
export async function getProfile(): Promise<{
  profile: Profile | null;
  email: string | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { profile: null, email: null, error: "Nicht eingeloggt." };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // Profile doesn't exist yet – create it
    const newProfile: Profile = {
      id: user.id,
      display_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      settings: DEFAULT_SETTINGS,
      created_at: new Date().toISOString(),
    };

    const { data: created, error: createError } = await supabase
      .from("profiles")
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      return { profile: null, email: user.email ?? null, error: createError.message };
    }

    return { profile: created as Profile, email: user.email ?? null };
  }

  if (error) {
    return { profile: null, email: user.email ?? null, error: error.message };
  }

  // Merge with defaults for any missing settings keys
  const mergedSettings = { ...DEFAULT_SETTINGS, ...(profile.settings as object) };

  return {
    profile: { ...profile, settings: mergedSettings } as Profile,
    email: user.email ?? null,
  };
}

/* ──────────────────────────────────────────────
 * Update display name
 * ──────────────────────────────────────────────*/
export async function updateDisplayName(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht eingeloggt." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profil");
  return { success: true };
}

/* ──────────────────────────────────────────────
 * Update settings
 * ──────────────────────────────────────────────*/
export async function updateSettings(settings: UserSettings) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht eingeloggt." };

  const { error } = await supabase
    .from("profiles")
    .update({ settings })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profil");
  return { success: true };
}

/* ──────────────────────────────────────────────
 * Update password
 * ──────────────────────────────────────────────*/
export async function updatePassword(newPassword: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht eingeloggt." };

  if (newPassword.length < 6) {
    return { error: "Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) return { error: error.message };

  return { success: true };
}

/* ──────────────────────────────────────────────
 * Update email
 * ──────────────────────────────────────────────*/
export async function updateEmail(newEmail: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht eingeloggt." };

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) return { error: error.message };

  return {
    success: true,
    message: "Bestätigungs-Mail wurde an die neue Adresse gesendet.",
  };
}

/* ──────────────────────────────────────────────
 * Delete account
 * ──────────────────────────────────────────────*/
export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht eingeloggt." };

  // Delete all user recipes (cascade will handle ingredients + steps)
  await supabase.from("recipes").delete().eq("user_id", user.id);

  // Delete profile
  await supabase.from("profiles").delete().eq("id", user.id);

  // Sign out (can't delete auth user without service role key)
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  return { success: true };
}
