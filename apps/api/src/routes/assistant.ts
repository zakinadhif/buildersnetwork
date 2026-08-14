import {
  CreateAssistantConversationBody,
  SendAssistantMessageBody,
} from "@myapp/api-zod";
import { atomicWrite } from "@myapp/db";
import { assistantConversations, assistantMessages } from "@myapp/db/schema";
import {
  convertToModelMessages,
  type ModelMessage,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { and, asc, desc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../app";
import {
  actionFromUIMessage,
  activeAssistantTools,
  assistantIntro,
  assistantPrompt,
  assistantTitleFrom,
  assistantTools,
  defaultAssistantTitle,
  shouldFinalizeDraft,
  textFromUIMessage,
} from "../lib/assistant";

const app = new Hono<AppEnv>();

async function getSession(c: Context<AppEnv>) {
  return c.get("auth").api.getSession({ headers: c.req.raw.headers });
}

const asDate = (value: Date | string | number) =>
  value instanceof Date ? value : new Date(value);

const summary = (row: typeof assistantConversations.$inferSelect) => ({
  id: row.id,
  title: row.title,
  intent: row.intent,
  createdAt: asDate(row.createdAt).toISOString(),
  updatedAt: asDate(row.updatedAt).toISOString(),
});

const message = (row: typeof assistantMessages.$inferSelect) => ({
  id: row.id,
  role: row.role,
  content: row.content,
  action: row.action ?? null,
  createdAt: asDate(row.createdAt).toISOString(),
});

function storedUIMessage(
  row: typeof assistantMessages.$inferSelect,
): UIMessage {
  if (row.parts?.length) {
    return {
      id: row.id,
      role: row.role,
      parts: row.parts as UIMessage["parts"],
    };
  }

  const parts: UIMessage["parts"] = [
    { type: "text", text: row.content, state: "done" },
  ];
  if (row.action?.type === "profile_draft") {
    parts.push({
      type: "tool-draftProfile",
      toolCallId: `stored-${row.id}`,
      state: "output-available",
      input: row.action.payload,
      output: row.action.payload,
    });
  }
  if (row.action?.type === "karya_draft") {
    parts.push({
      type: "tool-draftKarya",
      toolCallId: `stored-${row.id}`,
      state: "output-available",
      input: row.action.payload,
      output: row.action.payload,
    });
  }
  return { id: row.id, role: row.role, parts };
}

async function ownedConversation(
  c: Context<AppEnv>,
  id: string,
  userId: string,
) {
  const [conversation] = await c
    .get("db")
    .select()
    .from(assistantConversations)
    .where(
      and(
        eq(assistantConversations.id, id),
        eq(assistantConversations.userId, userId),
      ),
    )
    .limit(1);
  return conversation;
}

app.get("/conversations", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const rows = await c
    .get("db")
    .select()
    .from(assistantConversations)
    .where(eq(assistantConversations.userId, session.user.id))
    .orderBy(desc(assistantConversations.updatedAt));
  return c.json(rows.map(summary));
});

app.post("/conversations", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const parsed = CreateAssistantConversationBody.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request" },
      400,
    );
  }

  const db = c.get("db");
  const id = crypto.randomUUID();
  const now = new Date();
  const title =
    parsed.data.title?.trim() || defaultAssistantTitle(parsed.data.intent);
  const first = (session.user.name || "kamu").split(" ")[0];
  const intro = assistantIntro(parsed.data.intent, first);
  const introId = crypto.randomUUID();

  await atomicWrite(db, (executor) => [
    executor.insert(assistantConversations).values({
      id,
      userId: session.user.id,
      title,
      intent: parsed.data.intent,
      createdAt: now,
      updatedAt: now,
    }),
    executor.insert(assistantMessages).values({
      id: introId,
      conversationId: id,
      role: "assistant",
      content: intro,
      parts: [{ type: "text", text: intro, state: "done" }],
      createdAt: now,
    }),
  ]);

  return c.json(
    {
      id,
      title,
      intent: parsed.data.intent,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      messages: [
        {
          id: introId,
          role: "assistant" as const,
          content: intro,
          action: null,
          createdAt: now.toISOString(),
        },
      ],
    },
    201,
  );
});

app.get("/conversations/:id", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const conversation = await ownedConversation(
    c,
    c.req.param("id"),
    session.user.id,
  );
  if (!conversation) return c.json({ error: "not found" }, 404);

  const messages = await c
    .get("db")
    .select()
    .from(assistantMessages)
    .where(eq(assistantMessages.conversationId, conversation.id))
    .orderBy(asc(assistantMessages.createdAt));
  return c.json({ ...summary(conversation), messages: messages.map(message) });
});

app.delete("/conversations/:id", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const conversation = await ownedConversation(
    c,
    c.req.param("id"),
    session.user.id,
  );
  if (!conversation) return c.json({ error: "not found" }, 404);
  await c
    .get("db")
    .delete(assistantConversations)
    .where(eq(assistantConversations.id, conversation.id));
  return c.json({ ok: true });
});

app.post("/conversations/:id/messages", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const parsed = SendAssistantMessageBody.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request" },
      400,
    );
  }

  const db = c.get("db");
  const conversation = await ownedConversation(
    c,
    c.req.param("id"),
    session.user.id,
  );
  if (!conversation) return c.json({ error: "not found" }, 404);

  const content = parsed.data.content.trim();
  if (!content) return c.json({ error: "message is required" }, 400);
  const now = new Date();
  await db.insert(assistantMessages).values({
    id: crypto.randomUUID(),
    conversationId: conversation.id,
    role: "user",
    content,
    parts: [{ type: "text", text: content }],
    createdAt: now,
  });

  const currentMessages = await db
    .select()
    .from(assistantMessages)
    .where(eq(assistantMessages.conversationId, conversation.id))
    .orderBy(asc(assistantMessages.createdAt));

  const history: ModelMessage[] = await convertToModelMessages(
    currentMessages.map(storedUIMessage),
    { tools: assistantTools },
  );

  const shouldRetitle =
    conversation.title === defaultAssistantTitle(conversation.intent);
  const nextTitle = shouldRetitle
    ? assistantTitleFrom(content)
    : conversation.title;
  const activeTools = activeAssistantTools(conversation.intent);
  const forcedTool =
    activeTools.length === 1 && shouldFinalizeDraft(content)
      ? { type: "tool" as const, toolName: activeTools[0] }
      : undefined;

  const result = streamText({
    model: c.get("assistantModel"),
    system: assistantPrompt(conversation.intent),
    messages: history,
    ...(activeTools.length > 0
      ? {
          tools: assistantTools,
          activeTools,
          ...(forcedTool ? { toolChoice: forcedTool } : {}),
        }
      : {}),
    stopWhen: stepCountIs(2),
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse({
    generateMessageId: () => crypto.randomUUID(),
    onFinish: async ({ responseMessage }) => {
      const typedMessage = responseMessage as UIMessage;
      const reply = textFromUIMessage(typedMessage);
      const action = actionFromUIMessage(typedMessage);
      if (!reply && !action) return;
      const completedAt = new Date();
      await atomicWrite(db, (executor) => [
        executor.insert(assistantMessages).values({
          id: responseMessage.id,
          conversationId: conversation.id,
          role: "assistant",
          content: reply,
          action,
          parts: responseMessage.parts,
          createdAt: completedAt,
        }),
        executor
          .update(assistantConversations)
          .set({ title: nextTitle, updatedAt: completedAt })
          .where(eq(assistantConversations.id, conversation.id)),
      ]);
    },
  });
});

export default app;
