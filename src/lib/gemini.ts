/* ──────────────────────────────────────────────
 * Gemini AI Client
 * Centralized client for Google Gemini API calls.
 * Re-usable for future features (KI-Zutat-Ersatz, Auto-Tagging, etc.)
 * ──────────────────────────────────────────────*/
import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey"
      );
    }
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

export interface GeminiOptions {
  /** The model to use. Defaults to gemini-2.5-flash */
  model?: string;
  /** Optional image to include (base64-encoded) */
  imageBase64?: string;
  /** MIME type of the image (e.g., image/jpeg) */
  imageMimeType?: string;
  /** Expected response MIME type (e.g., application/json) */
  responseMimeType?: string;
}

/**
 * Generate content using Gemini AI.
 * Supports text-only and multimodal (text + image) requests.
 */
export async function generateContent(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const client = getClient();
  const model = options.model ?? "gemini-2.5-flash";

  // Build parts array
  const parts: Array<
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  > = [{ text: prompt }];

  if (options.imageBase64 && options.imageMimeType) {
    parts.push({
      inlineData: {
        data: options.imageBase64,
        mimeType: options.imageMimeType,
      },
    });
  }

  const response = await client.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: options.responseMimeType
      ? { responseMimeType: options.responseMimeType }
      : undefined,
  });

  return response.text ?? "";
}
