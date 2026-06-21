import {
  type KaryaListItem,
  useGetFeatured,
  useGetFeed,
} from "@myapp/api-client-react";
import { useLocation } from "wouter";
import Feed from "@/components/Feed";
import { Avatar, STAGE_LABELS } from "@/components/ui-atoms";
import { firstName, type Member } from "@/lib/members";

/**
 * Feed-first community home (Sprint 3, DECISION-F): a hand-curated "Top picked
 * inspiring projects" section atop a reverse-chron feed of recent posts + new
 * karya. The Sprint-2 AI-discovery chat and members list were removed — they're
 * a Sprint-4 search/discovery concern. People-browsing survives the gap via
 * faces/titles in the feed/featured linking out.
 */
export default function CommunityHome({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const { data: featured = [] } = useGetFeatured();
  const { data: feed = [] } = useGetFeed();

  return (
    <div
      className="screen"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div className="nav">
        <div className="nav-inner">
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--ink3)",
            }}
          >
            Al-Fath Berkarya
          </span>
          <span style={{ fontSize: 13, color: "var(--ink2)" }}>
            {user.name} · {user.year}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px 80px" }}>
        <div className="wrap" style={{ padding: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 36,
            }}
          >
            <span style={{ fontSize: 15, color: "var(--ink2)" }}>
              hei {firstName(user.name)} 👋
            </span>
            <button
              type="button"
              onClick={() => navigate("/karya/new")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--accent)",
                fontSize: 13,
                padding: 0,
              }}
            >
              + buat karya
            </button>
          </div>

          <p className="sec-head">Pilihan inspiratif</p>
          {featured.length === 0 ? (
            <p className="empty-state">belum ada pilihan.</p>
          ) : (
            <div className="featured">
              {featured.map((k) => (
                <KaryaCard
                  key={k.id}
                  karya={k}
                  onOpen={() => navigate(`/karya/${k.id}`)}
                />
              ))}
            </div>
          )}

          <p className="sec-head" style={{ marginTop: 40 }}>
            Aktivitas terbaru
          </p>
          {feed.length === 0 ? (
            <p className="empty-state">belum ada aktivitas.</p>
          ) : (
            <Feed items={feed} />
          )}
        </div>
      </div>
    </div>
  );
}

/** A featured karya card — reuses the karya-card visual language. */
function KaryaCard({
  karya,
  onOpen,
}: {
  karya: KaryaListItem;
  onOpen: () => void;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: contains block children, can't use <button>
    <div
      className="karya-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <span className="karya-card-title">{karya.title}</span>
      <p className="karya-card-desc">{karya.description}</p>
      <div className="karya-card-foot">
        <div className="skills-wrap">
          {karya.stages.map((s) => (
            <span key={s} className="stage-chip">
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>
        <div className="roster">
          {karya.roster.map((m) => (
            <Avatar
              key={m.id}
              name={m.name}
              handle={m.handle}
              image={m.image}
              size={26}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
