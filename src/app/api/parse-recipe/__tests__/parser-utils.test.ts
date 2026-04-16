import { describe, it, expect } from "vitest";
import {
  parseDuration,
  parseServings,
  splitIngredient,
  parseIngredients,
  parseSteps,
  findRecipeInJsonLd,
  extractSourceName,
  extractText,
  extractImage,
} from "../utils";

/* ══════════════════════════════════════════════
 * parseDuration
 * ══════════════════════════════════════════════*/
describe("parseDuration", () => {
  it("parses minutes only: PT25M → 25", () => {
    expect(parseDuration("PT25M")).toBe(25);
  });

  it("parses hours + minutes: PT1H30M → 90", () => {
    expect(parseDuration("PT1H30M")).toBe(90);
  });

  it("parses hours only: PT2H → 120", () => {
    expect(parseDuration("PT2H")).toBe(120);
  });

  it("parses case-insensitively: pt45m → 45", () => {
    expect(parseDuration("pt45m")).toBe(45);
  });

  it("falls back to plain number string: '45' → 45", () => {
    expect(parseDuration("45")).toBe(45);
  });

  it("returns null for null input", () => {
    expect(parseDuration(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseDuration("")).toBeNull();
  });

  it("returns null for non-duration string", () => {
    expect(parseDuration("ungültig")).toBeNull();
  });

  it("returns null for non-string types", () => {
    expect(parseDuration(42)).toBeNull();
    expect(parseDuration(undefined)).toBeNull();
  });
});

/* ══════════════════════════════════════════════
 * parseServings
 * ══════════════════════════════════════════════*/
describe("parseServings", () => {
  it("returns number directly", () => {
    expect(parseServings(4)).toBe(4);
  });

  it("extracts number from string: '4 Portionen' → 4", () => {
    expect(parseServings("4 Portionen")).toBe(4);
  });

  it("extracts number from string: '12 Stück' → 12", () => {
    expect(parseServings("12 Stück")).toBe(12);
  });

  it("takes first element from array", () => {
    expect(parseServings(["4", "6"])).toBe(4);
  });

  it("returns null for null", () => {
    expect(parseServings(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(parseServings(undefined)).toBeNull();
  });

  it("returns null for non-numeric string", () => {
    expect(parseServings("viele")).toBeNull();
  });
});

/* ══════════════════════════════════════════════
 * splitIngredient
 * ══════════════════════════════════════════════*/
describe("splitIngredient", () => {
  it("splits '250g Mehl'", () => {
    expect(splitIngredient("250g Mehl")).toEqual({
      amount: "250g",
      name: "Mehl",
    });
  });

  it("splits '2 EL Olivenöl'", () => {
    expect(splitIngredient("2 EL Olivenöl")).toEqual({
      amount: "2 EL",
      name: "Olivenöl",
    });
  });

  it("splits '500 ml Milch'", () => {
    expect(splitIngredient("500 ml Milch")).toEqual({
      amount: "500 ml",
      name: "Milch",
    });
  });

  it("splits '1 Prise Salz'", () => {
    expect(splitIngredient("1 Prise Salz")).toEqual({
      amount: "1 Prise",
      name: "Salz",
    });
  });

  it("handles no amount: 'Salz' → empty amount", () => {
    expect(splitIngredient("Salz")).toEqual({
      amount: "",
      name: "Salz",
    });
  });

  it("handles 'nach Bedarf' → empty amount", () => {
    expect(splitIngredient("nach Bedarf")).toEqual({
      amount: "",
      name: "nach Bedarf",
    });
  });

  it("splits fraction: '1/2 Zitrone'", () => {
    const result = splitIngredient("1/2 Zitrone");
    expect(result.amount).toBe("1/2");
    expect(result.name).toBe("Zitrone");
  });
});

/* ══════════════════════════════════════════════
 * parseIngredients
 * ══════════════════════════════════════════════*/
describe("parseIngredients", () => {
  it("returns empty array for null/undefined", () => {
    expect(parseIngredients(null)).toEqual([]);
    expect(parseIngredients(undefined)).toEqual([]);
  });

  it("returns empty array for non-array", () => {
    expect(parseIngredients("not an array")).toEqual([]);
  });

  it("parses string array", () => {
    const result = parseIngredients(["250g Mehl", "2 Eier"]);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ amount: "250g", name: "Mehl", sort_order: 0 });
    expect(result[1]).toMatchObject({ amount: "2", name: "Eier", sort_order: 1 });
  });

  it("filters empty strings", () => {
    const result = parseIngredients(["250g Mehl", "", "  "]);
    expect(result).toHaveLength(1);
  });

  it("handles object items with text property", () => {
    const result = parseIngredients([{ text: "250g Mehl" }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Mehl");
  });

  it("handles object items with name property", () => {
    const result = parseIngredients([{ name: "Salz" }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Salz");
  });
});

/* ══════════════════════════════════════════════
 * parseSteps
 * ══════════════════════════════════════════════*/
describe("parseSteps", () => {
  it("returns empty array for null/undefined", () => {
    expect(parseSteps(null)).toEqual([]);
    expect(parseSteps(undefined)).toEqual([]);
  });

  it("returns empty array for non-array non-string", () => {
    expect(parseSteps(42)).toEqual([]);
  });

  it("parses string by splitting on newlines (filters short lines)", () => {
    const input = "Mehl in eine Schüssel geben.\nEier hinzufügen und verrühren.\nKurz.";
    const result = parseSteps(input);
    expect(result).toHaveLength(2); // "Kurz." is < 10 chars
    expect(result[0].step_number).toBe(1);
    expect(result[0].description).toContain("Mehl");
  });

  it("parses string array", () => {
    const result = parseSteps(["Schritt eins ausführen", "Schritt zwei"]);
    expect(result).toHaveLength(2);
    expect(result[0].step_number).toBe(1);
    expect(result[1].step_number).toBe(2);
  });

  it("parses HowToStep objects", () => {
    const result = parseSteps([
      { "@type": "HowToStep", text: "Den Teig kneten" },
      { "@type": "HowToStep", text: "30 Minuten ruhen lassen" },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].description).toBe("Den Teig kneten");
  });

  it("parses HowToSection with nested steps", () => {
    const result = parseSteps([
      {
        "@type": "HowToSection",
        name: "Teig",
        itemListElement: [
          { "@type": "HowToStep", text: "Mehl sieben" },
          { "@type": "HowToStep", text: "Butter hinzufügen" },
        ],
      },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Teig");
    expect(result[0].description).toBe("Mehl sieben");
  });

  it("filters empty descriptions", () => {
    const result = parseSteps([
      { "@type": "HowToStep", text: "Gültig" },
      { "@type": "HowToStep", text: "" },
    ]);
    expect(result).toHaveLength(1);
  });

  it("renumbers steps sequentially after filtering", () => {
    const result = parseSteps(["Erster Schritt.", "Zweiter Schritt.", "Dritter Schritt."]);
    expect(result[0].step_number).toBe(1);
    expect(result[1].step_number).toBe(2);
    expect(result[2].step_number).toBe(3);
  });
});

/* ══════════════════════════════════════════════
 * findRecipeInJsonLd
 * ══════════════════════════════════════════════*/
describe("findRecipeInJsonLd", () => {
  it("finds direct Recipe object", () => {
    const data = { "@type": "Recipe", name: "Kuchen" };
    expect(findRecipeInJsonLd(data)).toBe(data);
  });

  it("finds Recipe in @graph array", () => {
    const recipe = { "@type": "Recipe", name: "Kuchen" };
    const data = { "@graph": [{ "@type": "WebPage" }, recipe] };
    expect(findRecipeInJsonLd(data)).toBe(recipe);
  });

  it("finds Recipe with array @type", () => {
    const data = { "@type": ["Recipe", "Thing"], name: "Kuchen" };
    expect(findRecipeInJsonLd(data)).toBe(data);
  });

  it("finds Recipe in top-level array", () => {
    const recipe = { "@type": "Recipe", name: "Kuchen" };
    expect(findRecipeInJsonLd([{ "@type": "WebSite" }, recipe])).toBe(recipe);
  });

  it("returns null when no Recipe found", () => {
    expect(findRecipeInJsonLd({ "@type": "WebPage" })).toBeNull();
  });

  it("returns null for null/undefined", () => {
    expect(findRecipeInJsonLd(null)).toBeNull();
    expect(findRecipeInJsonLd(undefined)).toBeNull();
  });
});

/* ══════════════════════════════════════════════
 * extractSourceName
 * ══════════════════════════════════════════════*/
describe("extractSourceName", () => {
  it("maps known domains", () => {
    expect(extractSourceName(new URL("https://www.chefkoch.de/rezept/123"))).toBe("Chefkoch");
    expect(extractSourceName(new URL("https://www.lecker.de/rezept"))).toBe("Lecker");
    expect(extractSourceName(new URL("https://www.eatsmarter.de/rezept"))).toBe("EatSmarter");
  });

  it("strips www. prefix", () => {
    expect(extractSourceName(new URL("https://www.chefkoch.de"))).toBe("Chefkoch");
    expect(extractSourceName(new URL("https://chefkoch.de"))).toBe("Chefkoch");
  });

  it("capitalizes unknown domains", () => {
    expect(extractSourceName(new URL("https://meinkochen.de/rezept"))).toBe("Meinkochen");
  });
});

/* ══════════════════════════════════════════════
 * extractText
 * ══════════════════════════════════════════════*/
describe("extractText", () => {
  it("returns trimmed string", () => {
    expect(extractText("  hello  ")).toBe("hello");
  });

  it("returns null for null/undefined/empty", () => {
    expect(extractText(null)).toBeNull();
    expect(extractText(undefined)).toBeNull();
    expect(extractText("")).toBeNull();
  });

  it("extracts from array (first element)", () => {
    expect(extractText(["first", "second"])).toBe("first");
  });

  it("extracts name from object", () => {
    expect(extractText({ name: "Test" })).toBe("Test");
  });
});

/* ══════════════════════════════════════════════
 * extractImage
 * ══════════════════════════════════════════════*/
describe("extractImage", () => {
  it("returns string directly", () => {
    expect(extractImage("https://img.jpg")).toBe("https://img.jpg");
  });

  it("returns null for null", () => {
    expect(extractImage(null)).toBeNull();
  });

  it("extracts from string array", () => {
    expect(extractImage(["https://img.jpg"])).toBe("https://img.jpg");
  });

  it("extracts url from object array", () => {
    expect(extractImage([{ url: "https://img.jpg" }])).toBe("https://img.jpg");
  });

  it("extracts url from object", () => {
    expect(extractImage({ url: "https://img.jpg" })).toBe("https://img.jpg");
  });

  it("extracts @id from object", () => {
    expect(extractImage({ "@id": "https://img.jpg" })).toBe("https://img.jpg");
  });
});
