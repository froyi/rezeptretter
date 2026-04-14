"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** Get the app's base URL from request headers or env */
async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

/* ──────────────────────────────────────────────
 * Email / Password – Registrierung
 * ──────────────────────────────────────────────*/
export async function signUp(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  if (!email || !password) {
    return { error: "E-Mail und Passwort sind erforderlich." };
  }

  if (password.length < 6) {
    return { error: "Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName || email },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.",
  };
}

/* ──────────────────────────────────────────────
 * Email / Password – Login
 * ──────────────────────────────────────────────*/
export async function signIn(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-Mail und Passwort sind erforderlich." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/rezepte");
}

/* ──────────────────────────────────────────────
 * Magic Link – Passwordless
 * ──────────────────────────────────────────────*/
export async function signInWithMagicLink(
  prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "E-Mail-Adresse ist erforderlich." };
  }

  const baseUrl = await getBaseUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Magic Link wurde gesendet! Prüfe dein Postfach." };
}

/* ──────────────────────────────────────────────
 * Google OAuth
 * ──────────────────────────────────────────────*/
export async function signInWithGoogle() {
  const supabase = await createClient();
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

/* ──────────────────────────────────────────────
 * Logout
 * ──────────────────────────────────────────────*/
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
