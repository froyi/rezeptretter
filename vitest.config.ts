import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/__tests__/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/**",
        "src/hooks/**",
        "src/app/actions/**",
        "src/app/api/**",
      ],
      exclude: ["src/test/**", "src/**/__tests__/**"],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
