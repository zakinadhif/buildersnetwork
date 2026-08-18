import { useGetFeed, useListMembers } from "@myapp/api-client-react";
import { X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import Feed from "@/components/Feed";
import { Avatar, Eyebrow } from "@/components/ui-atoms";
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

/**
 * Scroll is the Launchpad hero: a calm, reverse-chronological river of real
 * karya events. It deliberately has no ranking, leaderboard, composer,
 * comments, or appreciation controls.
 */
export default function Scroll({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const { enabled } = useFeatureFlags();
  const { data: feed = [] } = useGetFeed();
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
