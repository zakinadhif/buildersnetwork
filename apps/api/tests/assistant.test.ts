import type { AIProvider } from "@myapp/ai";
import { type LanguageModel, simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../src/app";
import { actionFromUIMessage } from "../src/lib/assistant";
import assistantRouter from "../src/routes/assistant";
import {
  createAuthMock,
  createDbMock,
  type MockUser,
  type WriteCall,
} from "./helpers/harness";

const MEMBER: MockUser & { name: string } = {
  id: "u-member",
  email: "member@test.com",
  name: "Hafiz Maulana",
};

const ai: AIProvider = {
  complete: async () => ({ text: "{}" }),
  async *stream() {
    yield "halo ";
    yield "dari asisten";
  },
};

const assistantModel = new MockLanguageModelV3({
  doStream: async () => ({
    stream: simulateReadableStream({
      chunks: [
        { type: "text-start", id: "text-1" },
        { type: "text-delta", id: "text-1", delta: "halo " },
        { type: "text-delta", id: "text-1", delta: "dari asisten" },
        { type: "text-end", id: "text-1" },
        {
          type: "finish",
          finishReason: { unified: "stop", raw: undefined },
          usage: {
            inputTokens: {
              total: 1,
              noCache: 1,
              cacheRead: undefined,
              cacheWrite: undefined,
            },
            outputTokens: { total: 2, text: 2, reasoning: undefined },
          },
        },
      ],
    }),
  }),
});

function mount(opts: {
  user?: (MockUser & { name?: string }) | null;
  reads?: unknown[][];
  provider?: AIProvider;
  model?: LanguageModel;
}): { app: Hono<AppEnv>; writes: WriteCall[] } {
  const { db, writes } = createDbMock(opts.reads ?? []);
  const auth = createAuthMock(opts.user ?? null);
  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    c.set("db", db as unknown as AppEnv["Variables"]["db"]);
    c.set("auth", auth as unknown as AppEnv["Variables"]["auth"]);
    c.set("ai", opts.provider ?? ai);
    c.set("assistantModel", opts.model ?? assistantModel);
    await next();
  });
  app.route("/api/assistant", assistantRouter);
  return { app, writes };
}

const json = (body: unknown) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("persistent assistant routes", () => {
  it("rejects an unauthenticated conversation list", async () => {
    const { app } = mount({ user: null });
    const response = await app.request("/api/assistant/conversations");
    expect(response.status).toBe(401);
  });

  it("creates a user-owned conversation with a persisted intro", async () => {
    const { app, writes } = mount({ user: MEMBER });
    const response = await app.request(
      "/api/assistant/conversations",
      json({ intent: "profile" }),
    );
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      id: string;
      intent: string;
      messages: { role: string; content: string }[];
    };
    expect(body.intent).toBe("profile");
    expect(body.messages[0]).toMatchObject({ role: "assistant" });
    expect(body.messages[0]?.content).toContain("Hafiz");
    expect(writes[0]?.values).toMatchObject({
      userId: MEMBER.id,
      intent: "profile",
    });
    expect(writes[1]?.values).toMatchObject({
      conversationId: body.id,
      role: "assistant",
    });
  });

  it("persists one user turn and the streamed assistant reply", async () => {
    const now = new Date("2026-08-13T00:00:00Z");
    const conversation = {
      id: "c1",
      userId: MEMBER.id,
      title: "Percakapan baru",
      intent: "general" as const,
      createdAt: now,
      updatedAt: now,
    };
    const { app, writes } = mount({
      user: MEMBER,
      reads: [
        [conversation],
        [
          {
            id: "m-user",
            conversationId: "c1",
            role: "user",
            content: "bantu aku riset",
            action: null,
            createdAt: now,
          },
        ],
      ],
    });
    const response = await app.request(
      "/api/assistant/conversations/c1/messages",
      json({ content: "bantu aku riset" }),
    );
    expect(response.status).toBe(200);
    const streamed = await response.text();
    expect(streamed).toContain('"delta":"halo "');
    expect(streamed).toContain('"delta":"dari asisten"');
    const assistantWrite = writes.find(
      (write) =>
        write.op === "insert" &&
        (write.values as { role?: string } | undefined)?.role === "assistant",
    );
    expect(assistantWrite?.values).toMatchObject({
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      ),
    });
    expect(writes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          op: "insert",
          values: expect.objectContaining({
            conversationId: "c1",
            role: "user",
            content: "bantu aku riset",
          }),
        }),
        expect.objectContaining({
          op: "insert",
          values: expect.objectContaining({
            conversationId: "c1",
            role: "assistant",
            content: "halo dari asisten",
          }),
        }),
        expect.objectContaining({ op: "update" }),
      ]),
    );
  });
});

describe("assistant structured actions", () => {
  it("maps a completed AI SDK profile tool result to a review action", () => {
    const action = actionFromUIMessage({
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "tool-draftProfile",
          toolCallId: "call-1",
          state: "output-available",
          input: {
            name: "",
            handle: "",
            bio: "lagi bikin tool komunitas",
            year: "",
            major: "",
            skills: ["React"],
            interests: ["Komunitas"],
          },
          output: {
            name: "",
            handle: "",
            bio: "lagi bikin tool komunitas",
            year: "",
            major: "",
            skills: ["React"],
            interests: ["Komunitas"],
          },
        },
      ],
    });
    expect(action).toEqual({
      type: "profile_draft",
      payload: {
        name: "",
        handle: "",
        bio: "lagi bikin tool komunitas",
        year: "",
        major: "",
        skills: ["React"],
        interests: ["Komunitas"],
      },
    });
  });
});
