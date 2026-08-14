import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export function createGeminiModel(
  apiKey: string,
  model = "gemini-2.5-flash-lite",
): LanguageModel {
  return createGoogleGenerativeAI({ apiKey })(model);
}
