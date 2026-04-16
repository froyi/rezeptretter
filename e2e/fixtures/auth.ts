import { test as base, expect, type Page } from "@playwright/test";

/* ──────────────────────────────────────────────
 * E2E Auth Fixture
 *
 * Provides an `authenticatedPage` that is already
 * logged in via the test account.
 *
 * Required env vars:
 *   E2E_TEST_EMAIL    – e.g. e2e-test@rezeptretter.de
 *   E2E_TEST_PASSWORD – password for the test account
 * ──────────────────────────────────────────────*/

const E2E_EMAIL = process.env.E2E_TEST_EMAIL || "";
const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD || "";

async function loginViaUI(page: Page) {
  if (!E2E_EMAIL || !E2E_PASSWORD) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.local",
    );
  }

  await page.goto("/login");
  await page.waitForSelector("#login-email");

  await page.fill("#login-email", E2E_EMAIL);
  await page.fill("#login-password", E2E_PASSWORD);
  await page.click('button[type="submit"]:has-text("Anmelden")');

  // Wait for redirect to /rezepte
  await page.waitForURL("**/rezepte**", { timeout: 15000 });
}

/**
 * Extended test fixture with authenticated page
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await loginViaUI(page);
    await use(page);
  },
});

export { expect };
export { loginViaUI };
