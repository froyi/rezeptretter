import { describe, it, expect } from "vitest";
import { scaleAmount, formatNumber } from "../scale-amount";

/* ══════════════════════════════════════════════
 * formatNumber
 * ══════════════════════════════════════════════*/
describe("formatNumber", () => {
  it("returns integer as string without decimals", () => {
    expect(formatNumber(5)).toBe("5");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(100)).toBe("100");
  });

  it("replaces decimal point with comma", () => {
    expect(formatNumber(1.5)).toBe("1,5");
    expect(formatNumber(0.75)).toBe("0,75");
  });

  it("strips trailing zeros after comma", () => {
    expect(formatNumber(2.1)).toBe("2,1");
    expect(formatNumber(3.0)).toBe("3"); // 3.0 is integer
  });

  it("limits to 2 decimal places", () => {
    expect(formatNumber(1.333)).toBe("1,33");
    expect(formatNumber(2.666)).toBe("2,67"); // rounded
  });
});

/* ══════════════════════════════════════════════
 * scaleAmount – basic scaling
 * ══════════════════════════════════════════════*/
describe("scaleAmount", () => {
  describe("basic number scaling", () => {
    it("doubles an integer amount", () => {
      expect(scaleAmount("250", 2, 4)).toBe("500");
    });

    it("halves an integer amount", () => {
      expect(scaleAmount("500", 4, 2)).toBe("250");
    });

    it("scales with a decimal result", () => {
      expect(scaleAmount("100", 4, 3)).toBe("75");
    });

    it("scales comma-separated decimals", () => {
      expect(scaleAmount("1,5", 2, 4)).toBe("3");
    });

    it("scales dot-separated decimals", () => {
      // The regex uses \\d+[.,]?\\d* so dots should work too
      expect(scaleAmount("1.5", 2, 4)).toBe("3");
    });
  });

  describe("with units", () => {
    it("preserves unit suffix", () => {
      expect(scaleAmount("250 g", 2, 4)).toBe("500 g");
    });

    it("preserves complex unit suffix", () => {
      expect(scaleAmount("2 EL Olivenöl", 2, 4)).toBe("4 EL Olivenöl");
    });
  });

  describe("unicode fractions", () => {
    it("scales ½", () => {
      expect(scaleAmount("½", 2, 4)).toBe("1");
    });

    it("scales ¼", () => {
      expect(scaleAmount("¼", 1, 4)).toBe("1");
    });

    it("scales ¾", () => {
      expect(scaleAmount("¾", 1, 2)).toBe("1,5");
    });

    it("scales ⅓", () => {
      const result = scaleAmount("⅓", 1, 3);
      expect(formatNumber(1 / 3 * 3)).toBe("1");
      expect(result).toBe("1");
    });

    it("scales ⅔", () => {
      expect(scaleAmount("⅔", 1, 3)).toBe("2");
    });

    it("scales ⅕", () => {
      expect(scaleAmount("⅕", 1, 5)).toBe("1");
    });

    it("scales ⅛", () => {
      expect(scaleAmount("⅛", 1, 8)).toBe("1");
    });

    it("scales unicode fraction with trailing text", () => {
      // ½ at 4→2 servings: (0.5/4)*2 = 0.25
      expect(scaleAmount("½ TL", 4, 2)).toBe("0,25 TL");
    });
  });

  describe("edge cases", () => {
    it("returns empty string for null amount", () => {
      expect(scaleAmount(null, 2, 4)).toBe("");
    });

    it("returns empty string for empty string amount", () => {
      expect(scaleAmount("", 2, 4)).toBe("");
    });

    it("returns amount unchanged when original servings equals current", () => {
      expect(scaleAmount("250 g", 4, 4)).toBe("250 g");
    });

    it("returns amount unchanged when original servings is 0 (division by zero guard)", () => {
      expect(scaleAmount("250", 0, 4)).toBe("250");
    });

    it("returns non-numeric text unchanged", () => {
      expect(scaleAmount("etwas", 2, 4)).toBe("etwas");
      expect(scaleAmount("nach Bedarf", 2, 4)).toBe("nach Bedarf");
    });

    it("returns non-fraction, non-numeric single char unchanged", () => {
      expect(scaleAmount("x", 2, 4)).toBe("x");
    });
  });
});
