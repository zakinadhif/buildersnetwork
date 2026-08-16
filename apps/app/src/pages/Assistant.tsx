import { useChat } from "@ai-sdk/react";
import {
  type AssistantAction,
  type AssistantConversationSummary,
  type AssistantIntent,
  type AssistantMessage,
  createAssistantConversation,
  deleteAssistantConversation,
  getGetAssistantConversationQueryKey,
  getGetMeQueryKey,
  getListAssistantConversationsQueryKey,
  saveProfile,
  useGetAssistantConversation,
  useListAssistantConversations,
} from "@myapp/api-client-react";
import { Button, Eyebrow } from "@myapp/ui";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  CheckCircle2,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  Search,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import Shell from "@/components/Shell";
import {
  Dots,
  EditField,
  InterestsEditor,
  Loading,
  SkillsEditor,
} from "@/components/ui-atoms";
import type { KaryaDraft } from "@/lib/karya-draft-context";
import type { Member } from "@/lib/members";
import { useKaryaDraft } from "@/lib/use-karya-draft";

type ConversationGroup = "Hari ini" | "7 hari terakhir" | "Lebih lama";
type Phase = "workspace" | "profile-review" | "saving" | "done";

const STARTERS: { label: string; intent: AssistantIntent }[] = [
  { label: "Bantu buat karya baru", intent: "karya" },
  { label: "Sunting profil saya", intent: "profile" },
  { label: "Rapikan kabar progres", intent: "general" },
];

const pick = (draft: string, existing: string | null | undefined) =>
  draft.trim() ? draft : (existing ?? "");

function union(existing: string[], draft: string[]): string[] {
  const result = [...existing];
  const seen = new Set(existing.map((item) => item.toLowerCase()));
  for (const item of draft) {
    if (item.trim() && !seen.has(item.toLowerCase())) {
      result.push(item);
      seen.add(item.toLowerCase());
    }
  }
  return result;
}

function mergeProfile(existing: Member, action: AssistantAction): Member {
  if (action.type !== "profile_draft") return existing;
  const draft = action.payload;
  return {
    id: existing.id,
    name: pick(draft.name, existing.name),
    handle: pick(draft.handle, existing.handle) || null,
    bio: pick(draft.bio, existing.bio) || null,
    year: pick(draft.year, existing.year),
    major: pick(draft.major, existing.major),
    skills: union(existing.skills, draft.skills),
    interests: union(existing.interests, draft.interests),
  };
}

function groupFor(updatedAt: string): ConversationGroup {
  const updated = new Date(updatedAt);
  const now = new Date();
  if (updated.toDateString() === now.toDateString()) return "Hari ini";
  if (now.getTime() - updated.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return "7 hari terakhir";
  }
  return "Lebih lama";
}

function ConversationRail({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: AssistantConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("id");
  const filtered = conversations.filter((conversation) =>
    conversation.title.toLocaleLowerCase("id").includes(normalized),
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onNew}
      >
        <MessageSquarePlus size={15} strokeWidth={1.8} aria-hidden="true" />
        Percakapan baru
      </Button>
      <label className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2">
        <Search
          size={14}
          strokeWidth={1.8}
          className="text-ink3"
          aria-hidden="true"
        />
        <span className="sr-only">Cari percakapan</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari percakapan"
          className="min-w-0 flex-1 border-none bg-transparent font-body text-ui text-ink outline-none"
        />
      </label>
      <div className="flex flex-col gap-5">
        {(["Hari ini", "7 hari terakhir", "Lebih lama"] as const).map(
          (group) => {
            const items = filtered.filter(
              (conversation) => groupFor(conversation.updatedAt) === group,
            );
            if (items.length === 0) return null;
            return (
              <section key={group}>
                <Eyebrow as="h2" className="mb-2 px-2">
                  {group}
                </Eyebrow>
                <div className="flex flex-col gap-0.5">
                  {items.map((conversation) => {
                    const active = selectedId === conversation.id;
                    return (
                      <div
                        key={conversation.id}
                        className={`group flex items-center rounded-card pr-1 ${active ? "bg-accent-tint" : "hover:bg-bg-hover"}`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelect(conversation.id)}
                          aria-current={active ? "page" : undefined}
                          className={`min-w-0 flex-1 truncate border-none bg-transparent px-2.5 py-2 text-left font-body text-ui ${active ? "font-medium text-accent" : "font-normal text-ink2"}`}
                        >
                          {conversation.title}
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus ${conversation.title}`}
                          title="Hapus percakapan"
                          onClick={() => onDelete(conversation.id)}
                          className="rounded-card border-none bg-transparent p-1 text-ink3 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={14} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          },
        )}
      </div>
    </>
  );
}

function ActionCard({
  action,
  onReview,
}: {
  action: AssistantAction;
  onReview: () => void;
}) {
  const profile = action.type === "profile_draft";
  const title = profile
    ? "Perubahan profil siap ditinjau"
    : action.payload.title;
  const detail = profile
    ? action.payload.bio || "Draft profil disusun dari percakapan ini."
    : `${action.payload.stages?.join(", ") || "idea"} · ${action.payload.interests?.join(", ") || "tanpa tag"}`;
  return (
    <div className="mt-3 max-w-[480px] rounded-panel border border-accent-line bg-surface p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
          <CheckCircle2 size={15} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Eyebrow as="div" className="mb-1 !text-accent">
            {profile ? "Perubahan profil" : "Karya baru"}
          </Eyebrow>
          <div className="font-body text-body font-medium text-ink">
            {title}
          </div>
          <p className="mb-0 mt-1 font-body text-caption leading-body text-ink2">
            {detail}
          </p>
        </div>
      </div>
      <div className="flex justify-end border-t border-line pt-3">
        <Button type="button" variant="primary" size="sm" onClick={onReview}>
          {profile ? "Tinjau perubahan" : "Tinjau draft karya"}
        </Button>
      </div>
    </div>
  );
}

function textFromParts(parts: UIMessage["parts"]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function actionFromPart(
  part: UIMessage["parts"][number],
): AssistantAction | null {
  const toolPart = part as {
    type: string;
    state?: string;
    output?: unknown;
  };
  if (toolPart.state !== "output-available") return null;
  if (toolPart.type === "tool-draftProfile") {
    return {
      type: "profile_draft",
      payload: toolPart.output as Extract<
        AssistantAction,
        { type: "profile_draft" }
      >["payload"],
    };
  }
  if (toolPart.type === "tool-draftKarya") {
    return {
      type: "karya_draft",
      payload: toolPart.output as Extract<
        AssistantAction,
        { type: "karya_draft" }
      >["payload"],
    };
  }
  return null;
}

function toUIMessage(message: AssistantMessage): UIMessage {
  const parts: UIMessage["parts"] = [
    { type: "text", text: message.content, state: "done" },
  ];
  if (message.action?.type === "profile_draft") {
    parts.push({
      type: "tool-draftProfile",
      toolCallId: `stored-${message.id}`,
      state: "output-available",
      input: message.action.payload,
      output: message.action.payload,
    });
  }
  if (message.action?.type === "karya_draft") {
    parts.push({
      type: "tool-draftKarya",
      toolCallId: `stored-${message.id}`,
      state: "output-available",
      input: message.action.payload,
      output: message.action.payload,
    });
  }
  return { id: message.id, role: message.role, parts };
}

function MessageList({
  messages,
  busy,
  onAction,
}: {
  messages: UIMessage[];
  busy: boolean;
  onAction: (action: AssistantAction) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: message and stream changes intentionally trigger scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  return (
    <div className="flex-1 overflow-y-auto py-2 pb-6">
      <div className="flex flex-col gap-6">
        {messages.map((message, index) =>
          message.role === "assistant" ? (
            <div key={message.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
                <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 max-w-[520px] whitespace-pre-wrap font-body text-body leading-body text-ink2">
                  {textFromParts(message.parts) ||
                    (busy && index === messages.length - 1 ? <Dots /> : null)}
                </p>
                {message.parts.map((part) => {
                  const action = actionFromPart(part);
                  return action ? (
                    <ActionCard
                      key={"toolCallId" in part ? part.toolCallId : part.type}
                      action={action}
                      onReview={() => onAction(action)}
                    />
                  ) : null;
                })}
              </div>
            </div>
          ) : (
            <p
              key={message.id}
              className="m-0 ml-auto max-w-[76%] rounded-panel bg-surface px-4 py-3 font-body text-body leading-body text-ink"
            >
              {textFromParts(message.parts)}
            </p>
          ),
        )}
        {busy && messages.at(-1)?.role !== "assistant" && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
              <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <p className="m-0 max-w-[520px] whitespace-pre-wrap font-body text-body leading-body text-ink2">
              <Dots />
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function Composer({
  busy,
  onSend,
}: {
  busy: boolean;
  onSend: (content: string) => Promise<void>;
}) {
  const [input, setInput] = useState("");
  const send = async () => {
    const content = input.trim();
    if (!content || busy) return;
    setInput("");
    await onSend(content);
  };
  return (
    <div className="sticky bottom-0 mt-6 bg-bg pb-3 pt-3">
      <div className="rounded-panel border border-line bg-surface p-2 shadow-[0_8px_24px_oklch(0%_0_0_/_6%)]">
        <textarea
          className="chat-textarea w-full resize-none border-none bg-transparent px-2 py-1.5 font-body text-body leading-body text-ink outline-none placeholder:text-ink3"
          rows={2}
          placeholder="Minta bantuan atau tindakan…"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Lampirkan konteks"
            disabled
            title="Lampiran segera hadir"
            className="rounded-full border-none bg-transparent p-2 text-ink3 disabled:opacity-40"
          >
            <Paperclip size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Kirim"
            className="flex size-8 items-center justify-center rounded-full border-none bg-ink text-bg disabled:opacity-30"
            onClick={() => void send()}
            disabled={!input.trim() || busy}
          >
            <SendHorizontal size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationWorkspace({
  conversation,
  autoSend,
  onAutoSendConsumed,
  onAction,
  onSettled,
}: {
  conversation: {
    id: string;
    messages: AssistantMessage[];
  };
  autoSend: string | null;
  onAutoSendConsumed: () => void;
  onAction: (action: AssistantAction) => void;
  onSettled: () => Promise<void>;
}) {
  const initialMessages = useMemo(
    () => conversation.messages.map(toUIMessage),
    [conversation.messages],
  );
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `/api/assistant/conversations/${encodeURIComponent(conversation.id)}/messages`,
        prepareSendMessagesRequest: ({ messages }) => {
          const latest = [...messages]
            .reverse()
            .find((message) => message.role === "user");
          return {
            body: { content: latest ? textFromParts(latest.parts) : "" },
          };
        },
      }),
    [conversation.id],
  );
  const { messages, sendMessage, status, error } = useChat({
    id: conversation.id,
    messages: initialMessages,
    transport,
    onFinish: () => {
      void onSettled();
    },
  });
  const sentAutomatically = useRef(false);

  useEffect(() => {
    if (!autoSend || sentAutomatically.current) return;
    sentAutomatically.current = true;
    onAutoSendConsumed();
    void sendMessage({ text: autoSend });
  }, [autoSend, onAutoSendConsumed, sendMessage]);

  const busy = status === "submitted" || status === "streaming";
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageList messages={messages} busy={busy} onAction={onAction} />
      {error && (
        <p role="alert" className="mb-2 font-body text-caption text-danger">
          Ada yang gagal saat menghubungi asisten. Coba kirim lagi.
        </p>
      )}
      <Composer
        busy={busy}
        onSend={(content) => sendMessage({ text: content })}
      />
      <p className="mb-0 pb-6 text-center font-body text-micro text-ink3">
        Asisten selalu meminta konfirmasi sebelum mengubah atau menerbitkan
        sesuatu.
      </p>
    </div>
  );
}

export default function Assistant({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { setDraft: setKaryaDraft } = useKaryaDraft();
  const { data: conversations = [], isLoading } =
    useListAssistantConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newConversation, setNewConversation] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("workspace");
  const [profileDraft, setProfileDraft] = useState<Member>(user);

  const activeConversationId =
    selectedId ?? (newConversation ? null : (conversations[0]?.id ?? null));
  const showingNewConversation =
    newConversation ||
    (!activeConversationId && !isLoading && conversations.length === 0);

  const { data: conversation, isLoading: conversationLoading } =
    useGetAssistantConversation(activeConversationId ?? "", {
      query: {
        queryKey: getGetAssistantConversationQueryKey(
          activeConversationId ?? "",
        ),
        enabled: Boolean(activeConversationId),
      },
    });

  const createConversation = async (intent: AssistantIntent) => {
    const created = await createAssistantConversation({ intent });
    await queryClient.invalidateQueries({
      queryKey: getListAssistantConversationsQueryKey(),
    });
    queryClient.setQueryData(
      getGetAssistantConversationQueryKey(created.id),
      created,
    );
    setSelectedId(created.id);
    setNewConversation(false);
    setPhase("workspace");
    return created;
  };

  const removeConversation = async (id: string) => {
    if (
      !window.confirm(
        "Hapus percakapan ini? Tindakan ini tidak bisa dibatalkan.",
      )
    ) {
      return;
    }
    await deleteAssistantConversation(id);
    if (activeConversationId === id) {
      setSelectedId(null);
      setNewConversation(true);
    }
    await queryClient.invalidateQueries({
      queryKey: getListAssistantConversationsQueryKey(),
    });
  };

  const startConversationAndSend = async (content: string) => {
    setSendError(null);
    setPendingMessage(content);
    try {
      await createConversation("general");
    } catch (error) {
      console.error(error);
      setPendingMessage(null);
      setSendError("Ada yang gagal saat membuat percakapan. Coba lagi.");
    }
  };

  const refreshConversation = async () => {
    if (!activeConversationId) return;
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetAssistantConversationQueryKey(activeConversationId),
      }),
      queryClient.invalidateQueries({
        queryKey: getListAssistantConversationsQueryKey(),
      }),
    ]);
  };

  const reviewAction = (action: AssistantAction) => {
    if (action.type === "profile_draft") {
      setProfileDraft(mergeProfile(user, action));
      setPhase("profile-review");
      return;
    }
    const draft: KaryaDraft = {
      title: action.payload.title,
      description: action.payload.description,
      stages: action.payload.stages?.length ? action.payload.stages : ["idea"],
      interests: action.payload.interests ?? [],
    };
    setKaryaDraft(draft);
    navigate("/karya/new");
  };

  const applyProfile = async () => {
    setPhase("saving");
    try {
      await saveProfile({
        name: profileDraft.name,
        handle: profileDraft.handle ?? undefined,
        bio: profileDraft.bio ?? undefined,
        interests: profileDraft.interests,
        year: profileDraft.year,
        major: profileDraft.major,
        skills: profileDraft.skills,
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setPhase("done");
    } catch (error) {
      console.error(error);
      setPhase("profile-review");
    }
  };

  if (isLoading || phase === "saving") {
    return (
      <Loading
        label={
          phase === "saving" ? "lagi nyimpen profil kamu" : "memuat percakapan"
        }
      />
    );
  }

  const title = showingNewConversation
    ? "Percakapan baru"
    : (conversation?.title ?? "Asisten AI");
  const setProfile = <K extends keyof Member>(key: K, value: Member[K]) =>
    setProfileDraft((current) => ({ ...current, [key]: value }));

  return (
    <Shell
      me={user}
      mainClassName="h-screen min-h-0 pb-0 max-[900px]:h-auto max-[900px]:min-h-screen"
      rail={
        <ConversationRail
          conversations={conversations}
          selectedId={activeConversationId}
          onSelect={(id) => {
            setPendingMessage(null);
            setSelectedId(id);
            setNewConversation(false);
            setPhase("workspace");
          }}
          onNew={() => {
            setPendingMessage(null);
            setSelectedId(null);
            setNewConversation(true);
            setPhase("workspace");
          }}
          onDelete={(id) => void removeConversation(id)}
        />
      }
    >
      <header className="mb-6 hidden shrink-0 items-center gap-3 border-b border-line pb-5 min-[901px]:flex">
        <span className="flex size-9 items-center justify-center rounded-card bg-accent-tint text-accent">
          <Sparkles size={18} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="m-0 truncate font-display text-feature font-normal text-ink">
            {title}
          </h1>
          <p className="m-0 font-body text-micro text-ink3">
            Asisten AI Al-Fath
          </p>
        </div>
      </header>

      {phase === "done" ? (
        <div className="flex flex-1 flex-col justify-center py-12">
          <p className="mb-8 font-body text-body leading-body text-ink2">
            Profil kamu ke-update ✓
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate("/profil")}
            >
              Lihat profil →
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPhase("workspace")}
            >
              Kembali ke percakapan
            </Button>
          </div>
        </div>
      ) : phase === "profile-review" ? (
        <div className="overflow-y-auto pb-8">
          <p className="mb-8 mt-1 font-body text-body leading-body text-ink2">
            Ini draft dari percakapanmu. Cek dan edit dulu—belum ada yang
            disimpan.
          </p>
          <div className="pf mb-7">
            <Eyebrow className="mb-1.5">Nama</Eyebrow>
            <EditField
              value={profileDraft.name}
              onChange={(value) => setProfile("name", value)}
            />
          </div>
          <div className="pf mb-7">
            <Eyebrow className="mb-1.5">Handle</Eyebrow>
            <EditField
              value={profileDraft.handle ?? ""}
              onChange={(value) => setProfile("handle", value)}
            />
          </div>
          <div className="pf mb-7">
            <Eyebrow className="mb-1.5">Angkatan</Eyebrow>
            <EditField
              value={profileDraft.year}
              onChange={(value) => setProfile("year", value)}
            />
          </div>
          <div className="pf mb-7">
            <Eyebrow className="mb-1.5">Jurusan</Eyebrow>
            <EditField
              value={profileDraft.major}
              onChange={(value) => setProfile("major", value)}
            />
          </div>
          <div className="pf mb-7">
            <Eyebrow className="mb-1.5">Bio</Eyebrow>
            <EditField
              value={profileDraft.bio ?? ""}
              onChange={(value) => setProfile("bio", value)}
              multiline
            />
          </div>
          <div className="pf mb-7">
            <Eyebrow className="mb-1.5">Skills</Eyebrow>
            <SkillsEditor
              skills={profileDraft.skills}
              onChange={(value) => setProfile("skills", value)}
            />
          </div>
          <div className="pf mb-7">
            <Eyebrow className="mb-1.5">Minat</Eyebrow>
            <InterestsEditor
              interests={profileDraft.interests}
              onChange={(value) => setProfile("interests", value)}
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-line pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPhase("workspace")}
            >
              Kembali
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void applyProfile()}
            >
              Terapkan ke profil →
            </Button>
          </div>
        </div>
      ) : showingNewConversation ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-panel bg-accent-tint text-accent">
              <Sparkles size={22} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h2 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
              Apa yang ingin kamu kerjakan?
            </h2>
            <p className="mb-6 mt-0 max-w-[440px] font-body text-body leading-body text-ink2">
              Percakapan dan hasil draft tersimpan di akunmu. Tidak ada yang
              diubah sebelum kamu meninjaunya.
            </p>
            <div className="grid w-full max-w-[500px] gap-2 sm:grid-cols-3">
              {STARTERS.map((starter) => (
                <Button
                  key={starter.label}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start whitespace-normal px-3 py-3 text-left text-caption leading-body"
                  onClick={() => void createConversation(starter.intent)}
                >
                  {starter.label}
                </Button>
              ))}
            </div>
          </div>
          {sendError && (
            <p role="alert" className="mb-2 font-body text-caption text-danger">
              {sendError}
            </p>
          )}
          <Composer busy={false} onSend={startConversationAndSend} />
          <p className="mb-0 pb-6 text-center font-body text-micro text-ink3">
            Asisten selalu meminta konfirmasi sebelum mengubah atau menerbitkan
            sesuatu.
          </p>
        </div>
      ) : conversationLoading || !conversation ? (
        <div className="flex flex-1 items-center justify-center text-ink3">
          memuat percakapan
          <Dots />
        </div>
      ) : (
        <ConversationWorkspace
          key={conversation.id}
          conversation={conversation}
          autoSend={pendingMessage}
          onAutoSendConsumed={() => setPendingMessage(null)}
          onAction={reviewAction}
          onSettled={refreshConversation}
        />
      )}
    </Shell>
  );
}
