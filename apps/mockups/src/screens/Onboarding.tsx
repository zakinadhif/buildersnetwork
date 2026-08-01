/**
 * Al-Fath Berkarya — Asisten AI · P1 exploration
 *
 * One canonical, action-capable AI workspace. Contextual ramps elsewhere may
 * open this surface, but they never host another chat. The center owns the
 * active conversation; the right rail owns persistent conversation history.
 * Product mutations are always previewed and explicitly confirmed.
 */

import { useState } from "react";
import {
  CheckCircle2,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  Search,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { MainColumn, RailColumn, cn, Eyebrow } from "@myapp/ui";
import { Shell } from "../components/Shell";

type ActionPreview = {
  kind: string;
  title: string;
  detail: string;
  confirmLabel: string;
};

type Message = {
  role: "ai" | "user";
  text: string;
  action?: ActionPreview;
};

type Conversation = {
  id: string;
  title: string;
  group: "Hari ini" | "7 hari terakhir" | "Lebih lama";
  messages: Message[];
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "buat-karya",
    title: "Buat draft Peta Kost",
    group: "Hari ini",
    messages: [
      { role: "ai", text: "Ceritakan karya yang ingin kamu buat. Aku bisa menyusun draftnya, tetapi kamu tetap meninjau sebelum apa pun diterbitkan." },
      { role: "user", text: "Buatkan karya bernama Peta Kost untuk membantu mahasiswa membandingkan kost dekat kampus dari harga, fasilitas, dan ulasan penghuni." },
      {
        role: "ai",
        text: "Draft dasarnya sudah siap. Aku memilih tahap Ide dan minat Web, Maps, serta Komunitas dari konteksmu. Tinjau dulu sebelum draft ini dibuat di akunmu.",
        action: {
          kind: "Karya baru",
          title: "Peta Kost",
          detail: "Ide · Web, Maps, Komunitas",
          confirmLabel: "Tinjau & buat draft",
        },
      },
    ],
  },
  {
    id: "edit-profil",
    title: "Perjelas profil saya",
    group: "Hari ini",
    messages: [
      { role: "user", text: "Bio profilku terlalu umum. Aku suka frontend dan product, terutama untuk masalah komunitas." },
      {
        role: "ai",
        text: "Aku merapikannya tanpa menambah klaim baru. Perubahan ini baru diterapkan setelah kamu menyetujuinya.",
        action: {
          kind: "Perubahan profil",
          title: "Bio baru",
          detail: "Product-minded frontend builder yang suka mengubah masalah komunitas menjadi pengalaman digital yang sederhana dan bisa diuji.",
          confirmLabel: "Tinjau & terapkan",
        },
      },
    ],
  },
  {
    id: "kabar-beta",
    title: "Tulis kabar rilis beta",
    group: "7 hari terakhir",
    messages: [
      { role: "user", text: "Aku baru rilis beta. Bantu tulis kabar progres yang tidak terdengar promosi." },
      { role: "ai", text: "Versi beta akhirnya bisa dicoba. Fokus minggu ini bukan menambah fitur, tetapi melihat apakah pencarian, filter harga, dan informasi fasilitas sudah cukup membantu calon penghuni membandingkan pilihan." },
    ],
  },
  {
    id: "riset-awal",
    title: "Pertanyaan riset awal",
    group: "Lebih lama",
    messages: [
      { role: "user", text: "Bantu aku menyusun pertanyaan riset untuk mahasiswa yang sedang mencari kost." },
      { role: "ai", text: "Mulai dari pengalaman terakhir mereka: bagian paling melelahkan, informasi yang ternyata keliru saat survei, dan siapa yang paling mereka percaya ketika menilai sebuah kost." },
    ],
  },
];

const STARTERS = [
  "Bantu buat karya baru",
  "Sunting profil saya",
  "Rapikan kabar progres",
];

function ActionCard({ action }: { action: ActionPreview }) {
  return (
    <div className="mt-3 max-w-[480px] rounded-panel border border-accent-line bg-surface p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
          <CheckCircle2 size={15} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Eyebrow as="div" className="mb-1 !text-accent">{action.kind}</Eyebrow>
          <div className="font-body text-body font-medium text-ink">{action.title}</div>
          <p className="mb-0 mt-1 font-body text-caption leading-body text-ink2">{action.detail}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-line pt-3">
        <button type="button" className="rounded-card border border-line bg-transparent px-3 py-2 font-body text-caption font-medium text-ink2">
          Ubah dulu
        </button>
        <button type="button" className="rounded-card border-none bg-ink px-3 py-2 font-body text-caption font-medium text-bg">
          {action.confirmLabel}
        </button>
      </div>
    </div>
  );
}

function ConversationRail({
  selectedId,
  onSelect,
  onNew,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = CONVERSATIONS.filter((conversation) =>
    conversation.title.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")),
  );

  return (
    <RailColumn className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onNew}
        className="flex w-full items-center justify-center gap-2 rounded-card border border-line bg-surface px-3 py-2.5 font-body text-ui font-medium text-ink"
      >
        <MessageSquarePlus size={15} strokeWidth={1.8} aria-hidden="true" />
        Percakapan baru
      </button>

      <label className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2">
        <Search size={14} strokeWidth={1.8} className="text-ink3" aria-hidden="true" />
        <span className="sr-only">Cari percakapan</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari percakapan"
          className="min-w-0 flex-1 border-none bg-transparent font-body text-ui text-ink outline-none"
        />
      </label>

      <div className="flex flex-col gap-5">
        {(["Hari ini", "7 hari terakhir", "Lebih lama"] as const).map((group) => {
          const items = filtered.filter((conversation) => conversation.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group}>
              <Eyebrow as="h2" className="mb-2 px-2">{group}</Eyebrow>
              <div className="flex flex-col gap-0.5">
                {items.map((conversation) => {
                  const active = selectedId === conversation.id;
                  return (
                    <div key={conversation.id} className={cn("group flex items-center rounded-card pr-1", active ? "bg-accent-tint" : "hover:bg-bg-hover")}>
                      <button
                        type="button"
                        onClick={() => onSelect(conversation.id)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "min-w-0 flex-1 truncate border-none bg-transparent px-2.5 py-2 text-left font-body text-ui",
                          active ? "font-medium text-accent" : "font-normal text-ink2",
                        )}
                      >
                        {conversation.title}
                      </button>
                      <button type="button" aria-label={`Opsi ${conversation.title}`} className="rounded-card border-none bg-transparent p-1 text-ink3 opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
                        <MoreHorizontal size={14} aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </RailColumn>
  );
}

function ChatComposer() {
  return (
    <div className="sticky bottom-0 mt-6 bg-bg pb-6 pt-3">
      <div className="rounded-panel border border-line bg-surface p-2 shadow-[0_8px_24px_oklch(0%_0_0_/_6%)]">
        <textarea rows={2} placeholder="Minta bantuan atau tindakan…" className="w-full resize-none border-none bg-transparent px-2 py-1.5 font-body text-body leading-body text-ink outline-none" />
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Lampirkan konteks" className="rounded-full border-none bg-transparent p-2 text-ink3">
            <Paperclip size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Kirim" className="flex size-8 items-center justify-center rounded-full border-none bg-ink text-bg">
            <SendHorizontal size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="mb-0 mt-2 text-center font-body text-micro text-ink3">
        Asisten selalu meminta konfirmasi sebelum mengubah atau menerbitkan sesuatu.
      </p>
    </div>
  );
}

export default function OnboardingScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(CONVERSATIONS[0].id);
  const selected = CONVERSATIONS.find((conversation) => conversation.id === selectedId) ?? null;

  return (
    <Shell active="onboarding">
      <MainColumn className="flex min-h-screen flex-col pb-0">
        <header className="mb-6 flex items-center gap-3 border-b border-line pb-5">
          <span className="flex size-9 items-center justify-center rounded-card bg-accent-tint text-accent">
            <Sparkles size={18} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="m-0 truncate font-display text-feature font-normal text-ink">{selected?.title ?? "Percakapan baru"}</h1>
            <p className="m-0 font-body text-micro text-ink3">Asisten AI Al-Fath · Eksplorasi P1</p>
          </div>
        </header>

        {selected ? (
          <div className="flex flex-1 flex-col gap-6">
            {selected.messages.map((message, index) =>
              message.role === "ai" ? (
                <div key={`${selected.id}-${index}`} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
                    <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 max-w-[520px] whitespace-pre-wrap font-body text-body leading-body text-ink2">{message.text}</p>
                    {message.action && <ActionCard action={message.action} />}
                  </div>
                </div>
              ) : (
                <p key={`${selected.id}-${index}`} className="m-0 ml-auto max-w-[76%] rounded-panel bg-surface px-4 py-3 font-body text-body leading-body text-ink">
                  {message.text}
                </p>
              ),
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-panel bg-accent-tint text-accent">
              <Sparkles size={22} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h2 className="mb-2 mt-0 font-display text-feature font-normal text-ink">Apa yang ingin kamu kerjakan?</h2>
            <p className="mb-6 mt-0 max-w-[440px] font-body text-body leading-body text-ink2">
              Satu tempat untuk berpikir, menulis, dan menjalankan tindakan di Al-Fath dengan persetujuanmu.
            </p>
            <div className="grid w-full max-w-[500px] gap-2 sm:grid-cols-3">
              {STARTERS.map((prompt) => (
                <button key={prompt} type="button" className="rounded-card border border-line bg-surface px-3 py-3 text-left font-body text-caption leading-body text-ink2">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <ChatComposer />
      </MainColumn>

      <ConversationRail selectedId={selectedId} onSelect={setSelectedId} onNew={() => setSelectedId(null)} />
    </Shell>
  );
}
