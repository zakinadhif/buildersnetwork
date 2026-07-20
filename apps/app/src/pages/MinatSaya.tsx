import { useGetFeed } from "@myapp/api-client-react";
import { useLocation } from "wouter";
import Feed from "@/components/Feed";
import type { Member } from "@/lib/members";

/**
 * "Minat Saya" (issue #8 rail item) — the Launchpad feed narrowed to the
 * member's own interests. Reuses `useGetFeed()` and filters client-side (posts
 * carry no interest in the feed payload, so this narrows to new-karya items
 * whose interests intersect the member's). No new endpoint.
 */
export default function MinatSaya({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const { data: feed = [] } = useGetFeed();

  const mine = new Set(user.interests.map((i) => i.toLowerCase()));
  const shown = feed.filter(
    (it) =>
      it.type === "karya" &&
      it.interests.some((i) => mine.has(i.toLowerCase())),
  );

  return (
    <>
      <div className="flex items-baseline gap-2.5 mb-6">
        <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">Minat Saya</h1>
        <span className="font-body text-caption text-ink3">Karya yang selaras dengan minatmu</span>
      </div>

      {user.interests.length === 0 ? (
        <p className="py-12 font-mono text-body text-ink3 leading-body">
          Kamu belum nambahin minat.
          <br />
          <button
            type="button"
            className="bg-transparent border-none p-0 cursor-pointer text-[13px] text-ink2 transition-colors hover:text-accent mt-2"
            onClick={() => navigate("/assistant")}
          >
            Ngobrol sama asisten buat ngisi profilmu →
          </button>
        </p>
      ) : shown.length === 0 ? (
        <p className="font-mono text-ui text-ink3 py-5">
          belum ada karya baru buat minat kamu — cek Launchpad buat semua
          aktivitas.
        </p>
      ) : (
        <Feed items={shown} />
      )}
    </>
  );
}
