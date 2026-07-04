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
      <div className="bn-head">
        <h1 className="bn-title">Minat Saya</h1>
        <span className="bn-title-sub">Karya yang selaras dengan minatmu</span>
      </div>

      {user.interests.length === 0 ? (
        <p className="bn-soon">
          Kamu belum nambahin minat.
          <br />
          <button
            type="button"
            className="post-karya-link"
            style={{ marginTop: 8, fontSize: 13 }}
            onClick={() => navigate("/assistant")}
          >
            Ngobrol sama asisten buat ngisi profilmu →
          </button>
        </p>
      ) : shown.length === 0 ? (
        <p className="empty-state">
          belum ada karya baru buat minat kamu — cek Launchpad buat semua
          aktivitas.
        </p>
      ) : (
        <Feed items={shown} />
      )}
    </>
  );
}
