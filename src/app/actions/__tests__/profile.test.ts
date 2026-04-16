import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, mockAuthenticatedUser } from "@/test/mocks/supabase";

const { mockSupabase } = createMockSupabase();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import {
  getProfile,
  updateDisplayName,
  updateSettings,
  updatePassword,
  updateEmail,
  deleteAccount,
} from "../profile";

beforeEach(() => {
  vi.clearAllMocks();
});

/* ══════════════════════════════════════════════
 * getProfile
 * ══════════════════════════════════════════════*/
describe("getProfile", () => {
  it("returns error when not logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await getProfile();
    expect(result.error).toBe("Nicht eingeloggt.");
    expect(result.profile).toBeNull();
  });

  it("returns existing profile", async () => {
    const user = mockAuthenticatedUser(mockSupabase);

    const profileData = {
      id: user.id,
      display_name: "Test",
      avatar_url: null,
      settings: { default_servings: 4, cook_mode_font_size: "normal", timer_sound: true, timer_vibration: true, dark_mode: "system" },
      created_at: "2024-01-01",
    };

    const profilesBuilder = mockSupabase.from("profiles");
    profilesBuilder.select.mockReturnValue(profilesBuilder);
    profilesBuilder.eq.mockReturnValue(profilesBuilder);
    profilesBuilder.single.mockResolvedValue({
      data: profileData,
      error: null,
    });

    const result = await getProfile();
    expect(result.profile).toBeTruthy();
    expect(result.email).toBe("test@example.com");
  });

  it("auto-creates profile when not found (PGRST116)", async () => {
    const user = mockAuthenticatedUser(mockSupabase);

    const profilesBuilder = mockSupabase.from("profiles");
    profilesBuilder.select.mockReturnValue(profilesBuilder);
    profilesBuilder.eq.mockReturnValue(profilesBuilder);
    profilesBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116", message: "not found" },
    });

    // insert chain
    profilesBuilder.insert.mockReturnValue(profilesBuilder);
    profilesBuilder.single.mockResolvedValueOnce({
      data: {
        id: user.id,
        display_name: "Test User",
        avatar_url: null,
        settings: {},
        created_at: new Date().toISOString(),
      },
      error: null,
    });

    const result = await getProfile();
    expect(result.profile).toBeTruthy();
    expect(profilesBuilder.insert).toHaveBeenCalled();
  });
});

/* ══════════════════════════════════════════════
 * updateDisplayName
 * ══════════════════════════════════════════════*/
describe("updateDisplayName", () => {
  it("returns error when not logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await updateDisplayName("New Name");
    expect(result).toEqual({ error: "Nicht eingeloggt." });
  });

  it("updates name successfully", async () => {
    mockAuthenticatedUser(mockSupabase);

    const profilesBuilder = mockSupabase.from("profiles");
    profilesBuilder.update.mockReturnValue(profilesBuilder);
    profilesBuilder.eq.mockResolvedValue({ error: null });

    const result = await updateDisplayName("New Name");
    expect(result).toEqual({ success: true });
  });
});

/* ══════════════════════════════════════════════
 * updateSettings
 * ══════════════════════════════════════════════*/
describe("updateSettings", () => {
  it("returns error when not logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await updateSettings({
      default_servings: 4,
      cook_mode_font_size: "large",
      timer_sound: true,
      timer_vibration: false,
      dark_mode: "dark",
    });
    expect(result).toEqual({ error: "Nicht eingeloggt." });
  });

  it("updates settings successfully", async () => {
    mockAuthenticatedUser(mockSupabase);

    const profilesBuilder = mockSupabase.from("profiles");
    profilesBuilder.update.mockReturnValue(profilesBuilder);
    profilesBuilder.eq.mockResolvedValue({ error: null });

    const result = await updateSettings({
      default_servings: 4,
      cook_mode_font_size: "large",
      timer_sound: true,
      timer_vibration: false,
      dark_mode: "dark",
    });
    expect(result).toEqual({ success: true });
  });
});

/* ══════════════════════════════════════════════
 * updatePassword
 * ══════════════════════════════════════════════*/
describe("updatePassword", () => {
  it("returns error when not logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await updatePassword("newpass123");
    expect(result).toEqual({ error: "Nicht eingeloggt." });
  });

  it("returns error when password is too short", async () => {
    mockAuthenticatedUser(mockSupabase);

    const result = await updatePassword("12345");
    expect(result).toEqual({
      error: "Passwort muss mindestens 6 Zeichen lang sein.",
    });
  });

  it("updates password successfully", async () => {
    mockAuthenticatedUser(mockSupabase);
    mockSupabase.auth.updateUser.mockResolvedValue({ data: {}, error: null });

    const result = await updatePassword("newpass123");
    expect(result).toEqual({ success: true });
  });
});

/* ══════════════════════════════════════════════
 * updateEmail
 * ══════════════════════════════════════════════*/
describe("updateEmail", () => {
  it("returns error when not logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await updateEmail("new@email.de");
    expect(result).toEqual({ error: "Nicht eingeloggt." });
  });

  it("sends confirmation and returns success", async () => {
    mockAuthenticatedUser(mockSupabase);
    mockSupabase.auth.updateUser.mockResolvedValue({ data: {}, error: null });

    const result = await updateEmail("new@email.de");
    expect(result).toEqual({
      success: true,
      message: "Bestätigungs-Mail wurde an die neue Adresse gesendet.",
    });
  });
});

/* ══════════════════════════════════════════════
 * deleteAccount
 * ══════════════════════════════════════════════*/
describe("deleteAccount", () => {
  it("returns error when not logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await deleteAccount();
    expect(result).toEqual({ error: "Nicht eingeloggt." });
  });

  it("deletes recipes, profile, signs out, and returns success", async () => {
    mockAuthenticatedUser(mockSupabase);

    const recipesBuilder = mockSupabase.from("recipes");
    recipesBuilder.delete.mockReturnValue(recipesBuilder);
    recipesBuilder.eq.mockResolvedValue({ error: null });

    const profilesBuilder = mockSupabase.from("profiles");
    profilesBuilder.delete.mockReturnValue(profilesBuilder);
    profilesBuilder.eq.mockResolvedValue({ error: null });

    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const result = await deleteAccount();
    expect(result).toEqual({ success: true });
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("recipes");
    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
  });
});
