import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDarkMode } from "../use-dark-mode";

function mockMatchMedia(matches: boolean) {
  const mq = {
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn(() => mq),
  });
  return mq;
}

describe("useDarkMode", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("adds 'dark' class for dark preference", () => {
    renderHook(() => useDarkMode("dark"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class for light preference", () => {
    document.documentElement.classList.add("dark");
    renderHook(() => useDarkMode("light"));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("follows system dark preference via matchMedia", () => {
    mockMatchMedia(true);
    renderHook(() => useDarkMode("system"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("follows system light preference via matchMedia", () => {
    mockMatchMedia(false);
    renderHook(() => useDarkMode("system"));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("cleans up matchMedia listener on unmount", () => {
    const mq = mockMatchMedia(false);
    const { unmount } = renderHook(() => useDarkMode("system"));
    unmount();

    expect(mq.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
