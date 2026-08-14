import { streamText } from "ai";
import { describe, expect, it } from "vitest";
import { createWorkersAI as createWorkersAIProvider } from "workers-ai-provider";
import {
  normalizeWorkersAIStream,
  withWorkersAIStreamCompatibility,
} from "../src/lib/workers-ai-model";

const encodeStream = (chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });

describe("Workers AI stream compatibility", () => {
  it("removes only a native response duplicated in the OpenAI-compatible delta", async () => {
    const input = encodeStream([
      'data: {"response":"oke","choices":[{"delta":{"content":"oke"}}]}\n',
      '\ndata: {"response":"?","choices":[{"delta":{"content":"!"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);

    const output = await new Response(normalizeWorkersAIStream(input)).text();

    expect(output).toContain('data: {"choices":[{"delta":{"content":"oke"}}]}');
    expect(output).toContain(
      'data: {"response":"?","choices":[{"delta":{"content":"!"}}]}',
    );
    expect(output).toContain("data: [DONE]");
  });

  it("makes workers-ai-provider emit each dual-format token once", async () => {
    const binding = withWorkersAIStreamCompatibility({
      run: async () =>
        encodeStream([
          'data: {"response":"oke","choices":[{"delta":{"content":"oke"}}]}\n\n',
          'data: {"response":", ","choices":[{"delta":{"content":", "}}]}\n\n',
          'data: {"response":"berarti","choices":[{"delta":{"content":"berarti"}}]}\n\n',
          "data: [DONE]\n\n",
        ]),
    });
    const model = createWorkersAIProvider({
      binding: binding as NonNullable<
        Parameters<typeof createWorkersAIProvider>[0]["binding"]
      >,
    })("@cf/meta/llama-4-scout-17b-16e-instruct");

    const result = streamText({ model, prompt: "mulai" });

    await expect(result.text).resolves.toBe("oke, berarti");
  });
});
