import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase } from "@/test/mocks/supabase";

const { mockSupabase } = createMockSupabase();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { signUp, signIn, signInWithMagicLink, signOut } from "../auth";

/* ══════════════════════════════════════════════
 * Helpers
 * ══════════════════════════════════════════════*/
function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

/* ══════════════════════════════════════════════
 * signUp
 * ══════════════════════════════════════════════*/
describe("signUp", () => {
  it("returns error when email is missing", async () => {
    const result = await signUp(null, makeFormData({ password: "123456" }));
    expect(result).toEqual({ error: "E-Mail und Passwort sind erforderlich." });
  });

  it("returns error when password is missing", async () => {
    const result = await signUp(null, makeFormData({ email: "test@test.de" }));
    expect(result).toEqual({ error: "E-Mail und Passwort sind erforderlich." });
  });

  it("returns error when password is too short", async () => {
    const result = await signUp(
      null,
      makeFormData({ email: "test@test.de", password: "12345" }),
    );
    expect(result).toEqual({
      error: "Passwort muss mindestens 6 Zeichen lang sein.",
    });
  });

  it("returns success on valid registration", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: {}, error: null });

    const result = await signUp(
      null,
      makeFormData({ email: "test@test.de", password: "123456" }),
    );
    expect(result).toEqual({
      success:
        "Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.",
    });
  });

  it("passes displayName to auth metadata", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: {}, error: null });

    await signUp(
      null,
      makeFormData({
        email: "test@test.de",
        password: "123456",
        displayName: "Max",
      }),
    );

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { data: { full_name: "Max" } },
      }),
    );
  });

  it("returns supabase error message on failure", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {},
      error: { message: "User already exists" },
    });

    const result = await signUp(
      null,
      makeFormData({ email: "test@test.de", password: "123456" }),
    );
    expect(result).toEqual({ error: "User already exists" });
  });
});

/* ══════════════════════════════════════════════
 * signIn
 * ══════════════════════════════════════════════*/
describe("signIn", () => {
  it("returns error when credentials are missing", async () => {
    const result = await signIn(null, makeFormData({}));
    expect(result).toEqual({ error: "E-Mail und Passwort sind erforderlich." });
  });

  it("redirects to /rezepte on successful login", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: null,
    });

    await expect(
      signIn(
        null,
        makeFormData({ email: "test@test.de", password: "123456" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/rezepte");
  });

  it("returns error on invalid credentials", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    });

    const result = await signIn(
      null,
      makeFormData({ email: "test@test.de", password: "wrong" }),
    );
    expect(result).toEqual({ error: "Invalid login credentials" });
  });
});

/* ══════════════════════════════════════════════
 * signInWithMagicLink
 * ══════════════════════════════════════════════*/
describe("signInWithMagicLink", () => {
  it("returns error when email is missing", async () => {
    const result = await signInWithMagicLink(null, makeFormData({}));
    expect(result).toEqual({ error: "E-Mail-Adresse ist erforderlich." });
  });

  it("returns success on valid email", async () => {
    mockSupabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: null,
    });

    const result = await signInWithMagicLink(
      null,
      makeFormData({ email: "test@test.de" }),
    );
    expect(result).toEqual({
      success: "Magic Link wurde gesendet! Prüfe dein Postfach.",
    });
  });

  it("returns error on OTP failure", async () => {
    mockSupabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: { message: "Rate limit exceeded" },
    });

    const result = await signInWithMagicLink(
      null,
      makeFormData({ email: "test@test.de" }),
    );
    expect(result).toEqual({ error: "Rate limit exceeded" });
  });
});

/* ══════════════════════════════════════════════
 * signOut
 * ══════════════════════════════════════════════*/
describe("signOut", () => {
  it("signs out and redirects to /login", async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});
