import type { AIProvider, CompleteOptions, Message } from "./index";

// Workers AI returns SSE when stream:true — each line is "data: {...}" or "data: [DONE]"
type WorkersAIMessage = Array<{ role: string; content: string }>;

export interface WorkersAIBinding {
  run(
    model: string,
    input: { messages: WorkersAIMessage; stream?: boolean },
  ): Promise<{ response?: string } | ReadableStream<Uint8Array>>;
}

export function createWorkersAI(
  binding: WorkersAIBinding,
  model = "@cf/meta/llama-4-scout-17b-16e-instruct",
): AIProvider {
  return {
    async complete(messages: Message[], _opts: CompleteOptions = {}) {
      const result = (await binding.run(model, { messages })) as {
        response?: string;
      };
      return { text: result.response ?? "" };
    },

    async *stream(messages: Message[], _opts: CompleteOptions = {}) {
      const result = await binding.run(model, { messages, stream: true });
      const readable = result as ReadableStream<Uint8Array>;
      const reader = readable.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // SSE lines arrive as "data: {...}\n\n" — split on newlines and flush complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data) as { response?: string };
              if (parsed.response) yield parsed.response;
            } catch {
              // malformed SSE line — skip
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}
