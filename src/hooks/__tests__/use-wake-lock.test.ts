import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWakeLock } from "../use-wake-lock";

describe("useWakeLock", () => {
  let mockWakeLock: {
    release: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockWakeLock = {
      release: vi.fn(),
      addEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, "wakeLock", {
      writable: true,
      configurable: true,
      value: {
        request: vi.fn(() => Promise.resolve(mockWakeLock)),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests wake lock on mount when enabled", async () => {
    renderHook(() => useWakeLock(true));

    // Allow async effects to resolve
    await vi.waitFor(() => {
      expect(navigator.wakeLock.request).toHaveBeenCalledWith("screen");
    });
  });

  it("does not request wake lock when disabled", () => {
    renderHook(() => useWakeLock(false));
    expect(navigator.wakeLock.request).not.toHaveBeenCalled();
  });

  it("does not throw when wake lock API is unavailable", () => {
    Object.defineProperty(navigator, "wakeLock", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    expect(() => renderHook(() => useWakeLock(true))).not.toThrow();
  });

  it("releases wake lock on unmount", async () => {
    const { unmount } = renderHook(() => useWakeLock(true));

    await vi.waitFor(() => {
      expect(navigator.wakeLock.request).toHaveBeenCalled();
    });

    unmount();
    expect(mockWakeLock.release).toHaveBeenCalled();
  });
});
