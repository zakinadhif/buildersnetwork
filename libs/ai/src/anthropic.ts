import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, CompleteOptions, Message } from "./index";

export function createAnthropicAI(
  apiKey: string,
  model = "claude-sonnet-4-6",
): AIProvider {
  const client = new Anthropic({ apiKey });

  return {
    async complete(messages: Message[], opts: CompleteOptions = {}) {
      const response = await client.messages.create({
        model,
        max_tokens: opts.maxTokens ?? 1024,
        messages,
      });
      const text =
        response.content[0]?.type === "text" ? response.content[0].text : "";
      return { text };
    },

    async *stream(messages: Message[], opts: CompleteOptions = {}) {
      const stream = client.messages.stream({
        model,
        max_tokens: opts.maxTokens ?? 1024,
        messages,
      });
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
    },
  };
}
