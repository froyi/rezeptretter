import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/* ──────────────────────────────────────────────
 * Mock: next/navigation
 * ──────────────────────────────────────────────*/
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

/* ──────────────────────────────────────────────
 * Mock: next/cache
 * ──────────────────────────────────────────────*/
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

/* ──────────────────────────────────────────────
 * Mock: next/headers
 * ──────────────────────────────────────────────*/
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((key: string) => {
      if (key === "host") return "localhost:3000";
      if (key === "x-forwarded-proto") return "http";
      return null;
    }),
  })),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));
