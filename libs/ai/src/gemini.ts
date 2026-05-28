import { GoogleGenAI } from "@google/genai";
import type { AIProvider, CompleteOptions, Message } from "./index";

function toGeminiContents(messages: Message[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export function createGeminiAI(
  apiKey: string,
  model = "gemini-2.5-flash-lite",
): AIProvider {
  const ai = new GoogleGenAI({ apiKey });

  return {
    async complete(messages: Message[], opts: CompleteOptions = {}) {
      const response = await ai.models.generateContent({
        model,
        contents: toGeminiContents(messages),
        config: { maxOutputTokens: opts.maxTokens ?? 1024 },
      });
      return { text: response.text ?? "" };
    },

    async *stream(messages: Message[], opts: CompleteOptions = {}) {
      const result = await ai.models.generateContentStream({
        model,
        contents: toGeminiContents(messages),
        config: { maxOutputTokens: opts.maxTokens ?? 1024 },
      });
      for await (const chunk of result) {
        if (chunk.text) yield chunk.text;
      }
    },
  };
}
