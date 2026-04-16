import { describe, it, expect, vi, beforeEach } from "vitest";
import * as cheerio from "cheerio";
import {
  isSocialMediaUrl,
  extractOgMetadata,
} from "../social-media-parser";

/* ──────────────────────────────────────────────
 * isSocialMediaUrl
 * ──────────────────────────────────────────────*/
describe("isSocialMediaUrl", () => {
  const testCases: Array<{ url: string; expected: boolean; label: string }> = [
    // Instagram – positive
    {
      url: "https://www.instagram.com/p/ABC123/",
      expected: true,
      label: "Instagram post",
    },
    {
      url: "https://instagram.com/p/ABC123/",
      expected: true,
      label: "Instagram post without www",
    },
    {
      url: "https://www.instagram.com/reel/ABC123/",
      expected: true,
      label: "Instagram reel",
    },
    {
      url: "https://www.instagram.com/reels/ABC123/",
      expected: true,
      label: "Instagram reels",
    },
    // Instagram – negative
    {
      url: "https://www.instagram.com/username/",
      expected: false,
      label: "Instagram profile",
    },
    {
      url: "https://www.instagram.com/",
      expected: false,
      label: "Instagram homepage",
    },
    // Other sites – negative
    {
      url: "https://www.chefkoch.de/rezepte/123",
      expected: false,
      label: "Chefkoch recipe",
    },
    {
      url: "https://www.youtube.com/watch?v=abc",
      expected: false,
      label: "YouTube video",
    },
    // TikTok – positive
    {
      url: "https://www.tiktok.com/@user/video/123",
      expected: true,
      label: "TikTok video",
    },
    {
      url: "https://vm.tiktok.com/ZMe12345/",
      expected: true,
      label: "TikTok short link (vm.tiktok.com)",
    },
    {
      url: "https://tiktok.com/@chefkochtiktok/video/7891234567890123456",
      expected: true,
      label: "TikTok video without www",
    },
    // TikTok – negative
    {
      url: "https://www.tiktok.com/explore",
      expected: false,
      label: "TikTok explore page",
    },
  ];

  testCases.forEach(({ url, expected, label }) => {
    it(`${expected ? "✅" : "❌"} ${label}: ${url}`, () => {
      expect(isSocialMediaUrl(new URL(url))).toBe(expected);
    });
  });
});

/* ──────────────────────────────────────────────
 * extractOgMetadata
 * ──────────────────────────────────────────────*/
describe("extractOgMetadata", () => {
  it("extracts all OG tags from HTML", () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Pasta Aglio e Olio" />
          <meta property="og:description" content="200g Spaghetti, 4 Knoblauchzehen, Olivenöl, Chiliflocken. Knoblauch in Scheiben schneiden..." />
          <meta property="og:image" content="https://example.com/pasta.jpg" />
          <meta property="og:site_name" content="Instagram" />
        </head>
        <body></body>
      </html>
    `;
    const $ = cheerio.load(html);
    const result = extractOgMetadata($);

    expect(result.title).toBe("Pasta Aglio e Olio");
    expect(result.description).toContain("200g Spaghetti");
    expect(result.image).toBe("https://example.com/pasta.jpg");
    expect(result.siteName).toBe("Instagram");
  });

  it("returns null for missing OG tags", () => {
    const html = `
      <html>
        <head><title>No OG Tags</title></head>
        <body></body>
      </html>
    `;
    const $ = cheerio.load(html);
    const result = extractOgMetadata($);

    expect(result.title).toBeNull();
    expect(result.description).toBeNull();
    expect(result.image).toBeNull();
    expect(result.siteName).toBeNull();
  });

  it("handles partial OG tags", () => {
    const html = `
      <html>
        <head>
          <meta property="og:description" content="Leckeres Rezept für Pfannkuchen" />
        </head>
        <body></body>
      </html>
    `;
    const $ = cheerio.load(html);
    const result = extractOgMetadata($);

    expect(result.title).toBeNull();
    expect(result.description).toBe("Leckeres Rezept für Pfannkuchen");
    expect(result.image).toBeNull();
  });

  it("trims whitespace from OG values", () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="  Rezept mit Spaces  " />
        </head>
        <body></body>
      </html>
    `;
    const $ = cheerio.load(html);
    const result = extractOgMetadata($);

    expect(result.title).toBe("Rezept mit Spaces");
  });
});
