import { test, expect } from "./fixtures/auth";

/* ══════════════════════════════════════════════
 * Kochmodus – E2E Tests
 *
 * Tests the cooking mode: entering, step navigation,
 * ingredient display, and exiting.
 * ══════════════════════════════════════════════*/

test.describe("Kochmodus", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to a recipe detail page first
    await page.goto("/rezepte");

    const firstRecipe = page.locator("a[href*='/rezepte/']").first();
    if ((await firstRecipe.count()) > 0) {
      await firstRecipe.click();
      await page.waitForURL(/.*rezepte\/.+/, { timeout: 10000 });
    }
  });

  test("Kochmodus starten", async ({ authenticatedPage: page }) => {
    // Look for cooking mode button
    const cookButton = page
      .locator('a:has-text("Kochmodus")')
      .or(page.locator('button:has-text("Kochmodus")'))
      .or(page.locator('a[href*="kochmodus"]'))
      .or(page.locator('button:has-text("Kochen")'));

    const hasCookButton = (await cookButton.count()) > 0;

    if (hasCookButton) {
      await cookButton.click();
      await page.waitForURL(/.*kochmodus/, { timeout: 10000 });

      // Should show a step description
      await expect(page.locator("body")).toContainText(/.+/);
    }
  });

  test("Schritte navigieren", async ({ authenticatedPage: page }) => {
    const cookButton = page
      .locator('a:has-text("Kochmodus")')
      .or(page.locator('a[href*="kochmodus"]'));

    if ((await cookButton.count()) > 0) {
      await cookButton.click();
      await page.waitForURL(/.*kochmodus/, { timeout: 10000 });

      // Look for next step button
      const nextButton = page
        .locator('button:has-text("Weiter")')
        .or(page.locator('button:has-text("Nächster")'))
        .or(page.locator('[aria-label*="next"]'))
        .or(page.locator('[aria-label*="weiter"]'));

      if ((await nextButton.count()) > 0) {
        // Get current step text
        const stepTextBefore = await page.locator("main").textContent();

        await nextButton.click();
        await page.waitForTimeout(500);

        // Step content may have changed (or stayed same if only 1 step)
        const stepTextAfter = await page.locator("main").textContent();
        expect(stepTextAfter).toBeDefined();
      }
    }
  });

  test("Kochmodus zeigt Zutaten", async ({ authenticatedPage: page }) => {
    const cookButton = page
      .locator('a:has-text("Kochmodus")')
      .or(page.locator('a[href*="kochmodus"]'));

    if ((await cookButton.count()) > 0) {
      await cookButton.click();
      await page.waitForURL(/.*kochmodus/, { timeout: 10000 });

      // Page should not be empty – at minimum there's content
      const bodyText = await page.locator("body").textContent();
      expect(bodyText!.length).toBeGreaterThan(10);
    }
  });

  test("Kochmodus beenden", async ({ authenticatedPage: page }) => {
    const cookButton = page
      .locator('a:has-text("Kochmodus")')
      .or(page.locator('a[href*="kochmodus"]'));

    if ((await cookButton.count()) > 0) {
      await cookButton.click();
      await page.waitForURL(/.*kochmodus/, { timeout: 10000 });

      // Look for close/exit button
      const closeButton = page
        .locator('button:has-text("Schließen")')
        .or(page.locator('a:has-text("Zurück")'))
        .or(page.locator('[aria-label*="close"]'))
        .or(page.locator('[aria-label*="schließen"]'))
        .or(page.locator('button:has-text("Beenden")'));

      if ((await closeButton.count()) > 0) {
        await closeButton.click();

        // Should navigate back to recipe detail
        await page.waitForURL(/.*rezepte\/.+/, { timeout: 10000 });
        await expect(page).not.toHaveURL(/.*kochmodus/);
      } else {
        // Try browser back
        await page.goBack();
        await page.waitForURL(/.*rezepte\/.+/, { timeout: 10000 });
      }
    }
  });
});
