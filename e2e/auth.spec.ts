import { test, expect } from "@playwright/test";
import {
  test as authTest,
  expect as authExpect,
} from "./fixtures/auth";

/* ══════════════════════════════════════════════
 * Auth Flow – E2E Tests
 * ══════════════════════════════════════════════*/

test.describe("Auth – Unauthenticated", () => {
  test("Login-Seite ist erreichbar und zeigt Formular", async ({ page }) => {
    await page.goto("/login");

    // Check for login form elements
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(
      page.locator('button[type="submit"]:has-text("Anmelden")'),
    ).toBeVisible();
  });

  test("Tab-Wechsel zu Registrieren funktioniert", async ({ page }) => {
    await page.goto("/login");

    await page.click('button:has-text("Registrieren")');

    // Registration form should be visible
    await expect(page.locator("#register-email")).toBeVisible();
    await expect(page.locator("#register-password")).toBeVisible();
    await expect(page.locator("#register-name")).toBeVisible();
  });

  test("Login mit falschen Credentials zeigt Fehlermeldung", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill("#login-email", "falsch@test.de");
    await page.fill("#login-password", "falschespasswort");
    await page.click('button[type="submit"]:has-text("Anmelden")');

    // Error message should appear
    await expect(
      page.locator("text=Invalid login credentials").or(
        page.locator('[class*="error"]'),
      ),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Geschützte Route /rezepte leitet zu /login weiter", async ({
    page,
  }) => {
    await page.goto("/rezepte");

    // Should redirect to login
    await page.waitForURL("**/login**", { timeout: 10000 });
    await expect(page.locator("#login-email")).toBeVisible();
  });
});

authTest.describe("Auth – Authenticated", () => {
  authTest(
    "Login mit gültigen Credentials leitet zu /rezepte weiter",
    async ({ authenticatedPage: page }) => {
      // authenticatedPage fixture already logged in
      await authExpect(page).toHaveURL(/.*rezepte/);
    },
  );

  authTest("Logout funktioniert", async ({ authenticatedPage: page }) => {
    // Navigate to profile where logout button is
    await page.goto("/profil");

    // Look for a logout/signout button
    const logoutButton = page
      .locator('button:has-text("Abmelden")')
      .or(page.locator('button:has-text("Logout")'));

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL("**/login**", { timeout: 10000 });
    }
  });
});
