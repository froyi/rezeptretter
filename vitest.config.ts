import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [
      "node_modules/**",
      "e2e/**", // Playwright e2e tests – run via `npx playwright test`
    ],
    setupFiles: ["./src/test/setup.ts"],
  },
});
