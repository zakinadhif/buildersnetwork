import {
  createPost,
  useGetFeed,
  useListKarya,
  useListMembers,
} from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import Feed from "@/components/Feed";
import { Avatar, Eyebrow, KaryaCover, Textarea } from "@/components/ui-atoms";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import { firstName, type Member } from "@/lib/members";
import { backNavigationState } from "@/lib/navigation";

const assistantPromptDismissalKey = (memberId: string) =>
  `builders-network:assistant-prompt-dismissed:${memberId}`;

function assistantPromptIsDismissed(memberId: string) {
  if (typeof localStorage === "undefined") return false;

  try {
    return (
      localStorage.getItem(assistantPromptDismissalKey(memberId)) === "true"
    );
  } catch {
    // Storage unavailable (private mode / quota) — degrade to the current session.
    return false;
  }
}

function Composer({
  user,
  onPosted,
}: {
  user: Member;
  onPosted: () => Promise<unknown>;
}) {
  const { data: karya = [], isLoading } = useListKarya();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A kabar belongs to work, not to a person. The roster is also the access
  // boundary enforced by the API: only a karya's members can publish to it.
  const myKarya = karya.filter((item) =>
    item.roster.some((member) => member.id === user.id),
  );
  const selected = myKarya.find((item) => item.id === chosenId) ?? myKarya[0];

  async function submit() {
    const trimmed = body.trim();
    if (!selected || !trimmed || busy) return;

    setBusy(true);
    setError(null);
    try {
      await createPost(selected.id, { body: trimmed });
      setBody("");
      await onPosted();
    } catch {
      setError("Update belum terkirim. Isinya tetap aman—coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-28 animate-pulse border-b border-line bg-surface" />
    );
  }

  if (!selected) {
    return (
      <div className="mb-4 flex items-center gap-3.5 rounded-panel border border-line bg-surface p-4">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 font-body text-body font-medium text-ink">
            Kabar selalu punya karya
          </p>
          <p className="m-0 font-body text-caption leading-compact text-ink3">
            Yang tayang di sini kemajuan sebuah karya, dan karyanya yang jadi
            penulis.
          </p>
        </div>
        <a
          href="/karya/new"
          className="shrink-0 rounded-card bg-accent px-3.5 py-2 font-body text-ui font-medium text-accent-fg"
        >
          Bikin karya
        </a>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-line pb-4 sm:-mx-[var(--shell-gutter)] sm:px-[var(--shell-gutter)]">
      <div className="flex items-center gap-3">
        {selected.coverUrl ? (
          <KaryaCover
            src={selected.coverUrl}
            size={40}
            radius={11}
            alt={`Logo ${selected.title}`}
          />
        ) : (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-line bg-accent-tint font-display text-title text-accent"
            aria-hidden="true"
          >
            {selected.title.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate font-display text-title leading-heading text-ink">
            {selected.title}
          </p>
          <p className="mt-px font-body text-micro text-ink3">
            diposting {user.name}
          </p>
        </div>
        {myKarya.length > 1 && (
          <Button
            variant="outline"
            onClick={() => setSwitching((value) => !value)}
            aria-expanded={switching}
            className="h-auto shrink-0 rounded-full border-line bg-transparent px-[11px] py-[5px] font-body text-caption font-medium text-ink2 hover:bg-transparent hover:text-ink"
          >
            Ganti <ChevronDown size={13} strokeWidth={2} aria-hidden="true" />
          </Button>
        )}
      </div>

      {switching && (
        <div className="border-t border-line pt-3">
          <Eyebrow as="div" className="mb-2">
            Posting sebagai
          </Eyebrow>
          <div className="flex flex-col gap-0.5">
            {myKarya.map((item) => {
              const active = item.id === selected.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setChosenId(item.id);
                    setSwitching(false);
                  }}
                  className={`flex cursor-pointer items-center gap-[9px] rounded-card border-none px-2 py-1.5 text-left font-body text-ui ${active ? "bg-accent-tint font-medium text-accent" : "bg-transparent font-normal text-ink2"}`}
                >
                  {item.coverUrl ? (
                    <KaryaCover
                      src={item.coverUrl}
                      size={22}
                      radius={7}
                      alt=""
                    />
                  ) : (
                    <span
                      className="flex size-[22px] items-center justify-center rounded-[7px] bg-accent-tint font-display text-micro text-accent"
                      aria-hidden="true"
                    >
                      {item.title.charAt(0)}
                    </span>
                  )}
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        placeholder="Ceritakan secukupnya. Yang paling berguna biasanya bagian yang tidak terduga."
        aria-label="Isi kabar"
        className="w-full resize-y font-body text-body leading-body text-ink"
      />

      {error && (
        <p role="alert" className="m-0 text-caption text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <p className="m-0 font-body text-micro leading-compact text-ink3">
          Tayang di halaman {selected.title}, lalu muncul di Scroll orang yang
          mengikutinya.
        </p>
        <Button
          variant="primary"
          disabled={!body.trim() || busy}
          onClick={submit}
          className="ml-auto h-auto shrink-0 px-4 py-2 font-medium"
        >
          {busy ? "Memposting…" : "Posting"}
        </Button>
      </div>
    </div>
  );
}

/** Scroll is the Launchpad hero: a calm, reverse-chronological river of karya events. */
export default function Scroll({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const { enabled } = useFeatureFlags();
  const { data: feed = [], refetch } = useGetFeed();
  const posts = feed.filter((item) => item.type === "post");
  const [isAssistantPromptDismissed, setIsAssistantPromptDismissed] = useState(
    () => assistantPromptIsDismissed(user.id),
  );

  const dismissAssistantPrompt = () => {
    setIsAssistantPromptDismissed(true);

    try {
      localStorage.setItem(assistantPromptDismissalKey(user.id), "true");
    } catch {
      // Storage unavailable (private mode / quota) — remain dismissed in memory.
    }
  };

  return (
    <>
      <div className="mb-1.5 hidden items-baseline gap-2.5 min-[901px]:flex">
        <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">
          Scroll
        </h1>
        <span className="font-body text-caption text-ink3">
          Kabar progres dari karya di komunitas
        </span>
      </div>

      <Composer user={user} onPosted={() => refetch()} />

      {enabled("aiAssistant") && !isAssistantPromptDismissed && (
        <div className="my-4 flex w-full items-center gap-2 rounded-panel border border-accent-line bg-accent-tint px-[18px] py-3.5">
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5 border-none bg-transparent p-0 text-left transition-opacity hover:opacity-85"
            onClick={() => navigate("/assistant")}
          >
            <span
              className="shrink-0 font-display text-[28px] leading-none text-accent"
              aria-hidden="true"
            >
              ✦
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-0.5 block font-display text-title leading-heading text-ink">
                hei {firstName(user.name)} 👋
              </span>
              <span className="block font-body text-body leading-body text-ink2">
                Butuh teman berpikir? Asisten AI tetap bisa kamu buka kapan
                saja.
              </span>
            </span>
            <span
              className="shrink-0 text-ui font-semibold text-accent"
              aria-hidden="true"
            >
              Buka →
            </span>
          </button>
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded-card border-none bg-transparent p-1 text-ink3 transition-colors hover:bg-accent-line hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Tutup pengingat Asisten AI"
            onClick={dismissAssistantPrompt}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="py-8 text-center font-body text-body text-ink3">
          Belum ada post progres.
        </p>
      ) : (
        <Feed items={posts} edgeToEdge />
      )}
    </>
  );
}

/**
 * Uses only the member data already available today. Full People browsing is a
 * separate task; this rail is a small doorway into existing member pages.
 */
export function ScrollRail({ user }: { user: Member }) {
  const [location, navigate] = useLocation();
  const { data: members = [] } = useListMembers();
  const toMeet = members.filter((member) => member.id !== user.id).slice(0, 5);

  return (
    <>
      <section className="flex flex-col">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <Eyebrow>Kenalan dengan builder</Eyebrow>
          <button
            type="button"
            className="border-none bg-transparent p-0 font-body text-micro text-accent-mid"
            onClick={() => navigate("/people")}
          >
            Lihat semua
          </button>
        </div>
        {toMeet.length === 0 ? (
          <p className="py-5 font-mono text-ui text-ink3">
            belum ada builder lain.
          </p>
        ) : (
          <ul className="flex list-none flex-col">
            {toMeet.map((member) => (
              <li
                key={member.id}
                className="border-b border-line last:border-none"
              >
                <button
                  type="button"
                  className="group flex w-full cursor-pointer items-start gap-2.5 border-none bg-transparent py-2.5 text-left"
                  onClick={() =>
                    navigate(`/member/${member.id}`, {
                      state: backNavigationState(location),
                    })
                  }
                >
                  <Avatar name={member.name} size={34} />
                  <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="bn-builder-name text-ui font-medium text-ink group-hover:text-accent">
                      {member.name}
                    </span>
                    <span className="text-micro text-ink3">
                      {[member.handle && `@${member.handle}`, member.year]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    {member.skills.length > 0 && (
                      <span className="mt-0.5 flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-[3px] border border-line bg-bg px-1.5 py-[1px] text-micro text-ink2"
                          >
                            {skill}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-panel bg-accent p-4">
        <p className="mb-3 text-body leading-compact text-accent-fg">
          Punya progres baru? Bagikan dari halaman karya tempat progres itu
          hidup.
        </p>
        <button
          type="button"
          className="w-full cursor-pointer rounded-card border-none bg-accent-fg px-3.5 py-[7px] font-body text-ui font-semibold text-accent"
          onClick={() => navigate("/karya/new")}
        >
          Mulai karya baru
        </button>
      </section>
    </>
  );
}
