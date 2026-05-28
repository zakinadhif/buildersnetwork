import type { AIProvider } from "@myapp/ai";
import { AiCompleteBody } from "@myapp/api-zod";
import { Hono } from "hono";
import { streamText } from "hono/streaming";

type Variables = { ai: AIProvider };

const app = new Hono<{ Variables: Variables }>();

app.post("/complete", async (c) => {
  const ai = c.get("ai");

  const raw = await c.req.json();
  const parsed = AiCompleteBody.safeParse(raw);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request" },
      400,
    );
  }

  const { text } = await ai.complete(parsed.data.messages);
  return c.json({ text });
});

app.post("/stream", async (c) => {
  const ai = c.get("ai");

  const raw = await c.req.json();
  const parsed = AiCompleteBody.safeParse(raw);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request" },
      400,
    );
  }

  return streamText(c, async (stream) => {
    for await (const chunk of ai.stream(parsed.data.messages)) {
      await stream.write(chunk);
    }
  });
});

export default app;
