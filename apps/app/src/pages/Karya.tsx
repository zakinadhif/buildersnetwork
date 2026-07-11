import {
  approveKaryaMember,
  createPost,
  declineKaryaMember,
  featureKarya,
  joinKarya,
  type PostKind,
  unfeatureKarya,
  useGetKarya,
  useGetKaryaPosts,
} from "@myapp/api-client-react";
import { useState } from "react";
import {
  Avatar,
  KaryaCover,
  Loading,
  POST_KIND_LABELS,
  POST_KIND_ORDER,
  STAGE_LABELS,
  timeAgo,
} from "@/components/ui-atoms";

export default function Karya({ id }: { id: string }) {
  const { data: karya, isLoading, refetch } = useGetKarya(id);
  const { data: posts = [], refetch: refetchPosts } = useGetKaryaPosts(id);
  const [busy, setBusy] = useState(false);
  const [postKind, setPostKind] = useState<PostKind>("progress");
  const [postBody, setPostBody] = useState("");

  if (isLoading) return <Loading />;
  if (!karya) {
    return (
      <div className="screen" style={{ display: "flex", alignItems: "center" }}>
        <div className="wrap">
          <p className="sub">karya tidak ditemukan.</p>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: 24 }}
            onClick={() => window.history.back()}
          >
            ← balik
          </button>
        </div>
      </div>
    );
  }

  const membership = karya.viewerMembership;
  const isOwner = membership?.role === "owner";
  const isMember = membership?.status === "member";
  const portraitScreenshots = (karya.screenshots ?? []).filter(
    (s) => s.orientation === "portrait",
  );

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function submitPost() {
    const body = postBody.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      await createPost(id, { kind: postKind, body });
      setPostBody("");
      await refetchPosts();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--ink2)",
            fontSize: 13,
            padding: 0,
            marginBottom: 40,
          }}
        >
          ← balik
        </button>

        <KaryaCover url={karya.coverUrl} size={72} className="karya-cover-lg" />

        <h1
          style={{
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: "-0.025em",
            marginBottom: 12,
          }}
        >
          {karya.title}
        </h1>

        <div className="skills-wrap" style={{ marginBottom: 24 }}>
          {karya.stages.map((s) => (
            <span key={s} className="stage-chip">
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 32 }}>
          {karya.description}
        </p>

        {/* Portrait screenshot gallery (issue #19) — no screenshots, no
            gallery, never an empty slot. */}
        {portraitScreenshots.length > 0 && (
          <section
            className="screenshot-gallery"
            aria-label={`Tangkapan layar ${karya.title}`}
          >
            {portraitScreenshots.map((s, i) => (
              <img
                key={s.id}
                src={s.url}
                alt={`${karya.title} — tangkapan layar ${i + 1}`}
                loading="lazy"
                className="screenshot-gallery-img"
              />
            ))}
          </section>
        )}

        {/* CTA driven by viewer membership */}
        {!membership && (
          <button
            type="button"
            className="btn btn-dark"
            disabled={busy}
            onClick={() => act(() => joinKarya(id))}
          >
            Minta gabung
          </button>
        )}
        {membership?.status === "pending" && (
          <button
            type="button"
            className="btn btn-outline"
            disabled
            style={{ opacity: 0.6, cursor: "default" }}
          >
            Menunggu persetujuan
          </button>
        )}

        {/* Admin-only feature toggle (S3.12a, DECISION-A). Server is the real
            authority; this is only shown to allowlisted viewers. */}
        {karya.viewerIsAdmin && (
          <button
            type="button"
            className={`btn feature-toggle${karya.featured ? " on" : ""}`}
            disabled={busy}
            onClick={() =>
              act(() =>
                karya.featured ? unfeatureKarya(id) : featureKarya(id),
              )
            }
          >
            {karya.featured ? "✦ Hapus dari unggulan" : "✦ Tandai unggulan"}
          </button>
        )}

        <hr className="hr" />

        {karya.interests.length > 0 && (
          <div className="pf">
            <p className="label">Minat / tag</p>
            <div className="skills-wrap">
              {karya.interests.map((s) => (
                <span key={s} className="chip" style={{ cursor: "default" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pf">
          <p className="label">Kontributor ({karya.roster.length})</p>
          <div className="roster">
            {karya.roster.map((m) => (
              <Avatar
                key={m.id}
                name={m.name}
                handle={m.handle}
                image={m.image}
              />
            ))}
          </div>
        </div>

        {/* Owner-only: pending join requests */}
        {isOwner && karya.pendingRequests.length > 0 && (
          <div className="pf">
            <p className="label">Permintaan gabung</p>
            {karya.pendingRequests.map((m) => (
              <div key={m.id} className="pending-row">
                <div className="pending-id">
                  <Avatar
                    name={m.name}
                    handle={m.handle}
                    image={m.image}
                    size={28}
                  />
                  <span style={{ fontSize: 14 }}>{m.name}</span>
                </div>
                <div className="pending-actions">
                  <button
                    type="button"
                    className="btn btn-dark"
                    disabled={busy}
                    onClick={() => act(() => approveKaryaMember(id, m.id))}
                  >
                    Terima
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busy}
                    onClick={() => act(() => declineKaryaMember(id, m.id))}
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr className="hr" />

        {/* Post stream — Sprint 3 (FR-18/19). Members compose; everyone reads. */}
        <div className="pf">
          <p className="label">Update</p>

          {isMember && (
            <div className="composer">
              <div className="kind-select">
                {POST_KIND_ORDER.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`kind-chip kind-${k} kind-pick${
                      postKind === k ? " on" : ""
                    }`}
                    aria-pressed={postKind === k}
                    onClick={() => setPostKind(k)}
                  >
                    {POST_KIND_LABELS[k]}
                  </button>
                ))}
              </div>
              <textarea
                className="composer-input"
                rows={3}
                placeholder="bagikan progres, tantangan, atau capaian…"
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-dark"
                disabled={busy || !postBody.trim()}
                onClick={submitPost}
              >
                Posting
              </button>
            </div>
          )}

          {posts.length === 0 ? (
            <p className="empty-state">belum ada update.</p>
          ) : (
            <div className="stream">
              {posts.map((p) => (
                <article key={p.id} className="post-card">
                  <div className="post-card-head">
                    <div className="post-author">
                      <Avatar
                        name={p.author.name}
                        handle={p.author.handle}
                        image={p.author.image}
                        size={28}
                      />
                      <span className="post-author-name">{p.author.name}</span>
                    </div>
                    <span className={`kind-chip kind-${p.kind}`}>
                      {POST_KIND_LABELS[p.kind]}
                    </span>
                  </div>
                  <p className="post-body">{p.body}</p>
                  <div className="post-card-foot">
                    <span className="post-time">{timeAgo(p.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
