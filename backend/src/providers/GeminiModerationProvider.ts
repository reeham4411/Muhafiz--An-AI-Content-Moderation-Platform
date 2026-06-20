import { IModerationProvider } from "./IModerationProvider";
import { ModerationCategory, ProviderModerationResult, CategoryProviderResult } from "../types";
import { env } from "../config/env";

const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Real AI moderation using Google Gemini Vision API.
 * Sends the image + a structured prompt asking Gemini to score each category,
 * and parses a strict JSON response back into ProviderModerationResult.
 */
export class GeminiModerationProvider implements IModerationProvider {
  public readonly name = "gemini-vision";

  private buildPrompt(categories: ModerationCategory[]): string {
    return `You are an AI content moderation system. Analyze the provided image strictly for these categories: ${categories.join(
      ", "
    )}.

For EACH category, return whether a violation is detected, a confidence score between 0 and 1, and a short one-sentence reasoning.

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "results": [
    {
      "category": "CATEGORY_NAME",
      "violationDetected": true,
      "confidenceScore": 0.0,
      "reasoning": "short reasoning"
    }
  ]
}

You must include exactly one entry per category listed above, using the exact category strings given.`;
  }

  async moderateImage(
    imageBuffer: Buffer,
    mimeType: string,
    categories: ModerationCategory[]
  ): Promise<ProviderModerationResult> {
    const url = `${GEMINI_ENDPOINT_BASE}/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [
            { text: this.buildPrompt(categories) },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBuffer.toString("base64"),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Gemini API returned no content");
    }

    let parsed: { results: CategoryProviderResult[] };
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      throw new Error(`Failed to parse Gemini response as JSON: ${rawText}`);
    }

    // Ensure every requested category is present; fill gaps defensively
    const resultMap = new Map(parsed.results.map((r) => [r.category, r]));
    const results: CategoryProviderResult[] = categories.map((category) => {
      const found = resultMap.get(category);
      if (found) {
        return {
          category,
          violationDetected: Boolean(found.violationDetected),
          confidenceScore: Math.min(1, Math.max(0, Number(found.confidenceScore) || 0)),
          reasoning: found.reasoning || "No reasoning provided by model.",
        };
      }
      return {
        category,
        violationDetected: false,
        confidenceScore: 0,
        reasoning: "Category missing from model response; defaulted to no violation.",
      };
    });

    return { results, provider: this.name };
  }
}
