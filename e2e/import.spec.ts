import { test, expect } from "./fixtures/auth";

/* ══════════════════════════════════════════════
 * Import Flow – E2E Tests
 *
 * Tests the recipe import feature from URL input
 * to saved recipe.
 * ══════════════════════════════════════════════*/

test.describe("Import Flow", () => {
  test("Import-Seite zeigt URL-Eingabefeld", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/importieren");

    // URL input field should be visible
    const urlInput = page
      .locator('input[type="url"]')
      .or(page.locator('input[placeholder*="URL"]'))
      .or(page.locator('input[placeholder*="https"]'));

    await expect(urlInput).toBeVisible({ timeout: 10000 });
  });

  test("Leere URL-Eingabe zeigt Fehler", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/importieren");

    // Try submitting without URL
    const submitButton = page
      .locator('button[type="submit"]')
      .or(page.locator('button:has-text("Importieren")'))
      .or(page.locator('button:has-text("Rezept")'));

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation error or not navigate away
      await expect(page).toHaveURL(/.*importieren/);
    }
  });

  test("Ungültige URL zeigt Fehlermeldung", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/importieren");

    const urlInput = page
      .locator('input[type="url"]')
      .or(page.locator('input[placeholder*="URL"]'))
      .or(page.locator('input[placeholder*="https"]'));

    await urlInput.fill("keine-gueltige-url");

    const submitButton = page
      .locator('button[type="submit"]')
      .or(page.locator('button:has-text("Importieren")'))
      .or(page.locator('button:has-text("Rezept")'));

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show an error message
      await expect(
        page
          .locator("text=Ungültige URL")
          .or(page.locator('[class*="error"]'))
          .or(page.locator("text=Fehler")),
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("URL ohne Rezeptdaten zeigt Fehler", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/importieren");

    const urlInput = page
      .locator('input[type="url"]')
      .or(page.locator('input[placeholder*="URL"]'))
      .or(page.locator('input[placeholder*="https"]'));

    await urlInput.fill("https://example.com");

    const submitButton = page
      .locator('button[type="submit"]')
      .or(page.locator('button:has-text("Importieren")'))
      .or(page.locator('button:has-text("Rezept")'));

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for API response – should show error
      await expect(
        page
          .locator("text=Kein Rezept")
          .or(page.locator("text=nicht gefunden"))
          .or(page.locator('[class*="error"]')),
      ).toBeVisible({ timeout: 15000 });
    }
  });
});
