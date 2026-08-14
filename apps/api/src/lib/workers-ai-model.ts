function normalizeWorkersAISSELine(line: string): string {
  const carriageReturn = line.endsWith("\r") ? "\r" : "";
  const content = carriageReturn ? line.slice(0, -1) : line;
  if (!content.startsWith("data:")) return line;

  const data = content.slice(5).trimStart();
  try {
    const event = JSON.parse(data) as {
      response?: unknown;
      choices?: Array<{ delta?: { content?: unknown } }>;
    };
    const openAIText = event.choices?.[0]?.delta?.content;

    if (typeof event.response !== "string" || event.response !== openAIText) {
      return line;
    }

    // workers-ai-provider reads both fields independently. Prefer the richer
    // OpenAI-compatible shape when Cloudflare includes the same token in both.
    delete event.response;
    return `data: ${JSON.stringify(event)}${carriageReturn}`;
  } catch {
    return line;
  }
}

export function normalizeWorkersAIStream(
  stream: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return stream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          controller.enqueue(
            encoder.encode(`${normalizeWorkersAISSELine(line)}\n`),
          );
        }
      },
      flush(controller) {
        buffer += decoder.decode();
        if (buffer) {
          controller.enqueue(encoder.encode(normalizeWorkersAISSELine(buffer)));
        }
      },
    }),
  );
}

/**
 * Cloudflare can expose one streamed token in both its native `response` field
 * and `choices[0].delta.content`. workers-ai-provider currently maps both to
 * separate AI SDK text deltas, duplicating every token in the UI and database.
 * Normalize only those dual-format events before they reach the provider.
 */
export function withWorkersAIStreamCompatibility<Binding extends object>(
  binding: Binding,
): Binding {
  return new Proxy(binding, {
    get(target, property) {
      const value = Reflect.get(target, property, target) as unknown;
      if (property !== "run" || typeof value !== "function") return value;

      return async (...args: unknown[]) => {
        const result = (await Reflect.apply(value, target, args)) as unknown;
        return result instanceof ReadableStream
          ? normalizeWorkersAIStream(result)
          : result;
      };
    },
  });
}
