import { useState } from "react";
import type { Message } from "./index";

/**
 * Streams a response from POST /api/ai/stream, updating `streamingText` with
 * each chunk as it arrives. Returns a promise that resolves to the full text.
 *
 * `streamingText` is null when idle, an empty string at the very start of a
 * request (show a loading indicator), and the accumulated text while streaming.
 */
export function useStream() {
  const [streamingText, setStreamingText] = useState<string | null>(null);

  async function stream(messages: Message[]): Promise<string> {
    setStreamingText("");
    let accumulated = "";

    const res = await fetch("/api/ai/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok || !res.body) {
      setStreamingText(null);
      throw new Error(`Stream failed: ${res.status} ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingText(accumulated);
      }
    } finally {
      reader.releaseLock();
      setStreamingText(null);
    }

    return accumulated;
  }

  return { streamingText, stream };
}
