import { IModerationProvider } from "./IModerationProvider";
import { GeminiModerationProvider } from "./GeminiModerationProvider";
import { MockModerationProvider } from "./MockModerationProvider";
import { env } from "../config/env";

/**
 * Factory that picks the active moderation provider.
 * Falls back to MockModerationProvider automatically when GEMINI_API_KEY is absent,
 * so the backend is always runnable. Swap/add providers here (Groq, Rekognition, etc).
 */
export function getModerationProvider(): IModerationProvider {
  if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
    return new GeminiModerationProvider();
  }
  console.warn("[providers] GEMINI_API_KEY not set -> using MockModerationProvider fallback");
  return new MockModerationProvider();
}
