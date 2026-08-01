import {
  approveKaryaMember,
  createPost,
  declineKaryaMember,
  featureKarya,
  joinKarya,
  unfeatureKarya,
  useGetKarya,
  useGetKaryaPosts,
} from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
import { useState } from "react";
import {
  Avatar,
  Eyebrow,
  KaryaCover,
  Loading,
  Tag,
} from "@/components/ui-atoms";
import { STAGE_LABELS, timeAgo } from "@/components/ui-metadata";

export default function Karya({ id }: { id: string }) {
  const { data: karya, isLoading, refetch } = useGetKarya(id);
  const { data: posts = [], refetch: refetchPosts } = useGetKaryaPosts(id);
  const [busy, setBusy] = useState(false);
  const [postBody, setPostBody] = useState("");

  if (isLoading) return <Loading />;
  if (!karya) {
    return (
      <div className="fixed inset-0 animate-up flex items-center">
        <div className="max-w-[var(--container-page)] mx-auto px-7">
          <p className="text-body text-ink2 leading-body">
            karya tidak ditemukan.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={() => window.history.back()}
          >
            ← balik
          </Button>
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
      await createPost(id, { body });
      setPostBody("");
      await refetchPosts();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 animate-up overflow-y-auto">
      <div className="max-w-[var(--container-page)] mx-auto px-7 pt-10 pb-[80px]">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-transparent border-none cursor-pointer text-ink2 text-[13px] p-0 mb-10 flex items-center gap-1.5"
        >
          ← balik
        </button>

        <KaryaCover src={karya.coverUrl} size={72} radius={16} />

        <h1 className="text-feature font-light tracking-heading leading-heading mt-4 mb-3">
          {karya.title}
        </h1>

        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          {karya.stages.map((s) => (
            <Tag key={s} label={STAGE_LABELS[s]} />
          ))}
        </div>

        <p className="text-body text-ink leading-body mb-8">
          {karya.description}
        </p>

        {/* Portrait screenshot gallery (issue #19) — no screenshots, no
            gallery, never an empty slot. */}
        {portraitScreenshots.length > 0 && (
          <section
            className="flex gap-2 overflow-x-auto pb-4 mb-4 snap-x snap-mandatory hide-scrollbar"
            aria-label={`Tangkapan layar ${karya.title}`}
          >
            {portraitScreenshots.map((s, i) => (
              <img
                key={s.id}
                src={s.url}
                alt={`${karya.title} — tangkapan layar ${i + 1}`}
                loading="lazy"
                className="w-[280px] h-[400px] object-cover rounded-panel border border-line snap-center shrink-0"
              />
            ))}
          </section>
        )}

        {/* CTA driven by viewer membership */}
        {!membership && (
          <Button
            type="button"
            variant="primary"
            disabled={busy}
            onClick={() => act(() => joinKarya(id))}
            className="w-full justify-center"
          >
            Minta gabung
          </Button>
        )}
        {membership?.status === "pending" && (
          <Button
            type="button"
            variant="secondary"
            disabled
            className="w-full justify-center opacity-60 cursor-default"
          >
            Menunggu persetujuan
          </Button>
        )}

        {/* Admin-only feature toggle (S3.12a, DECISION-A). Server is the real
            authority; this is only shown to allowlisted viewers. */}
        {karya.viewerIsAdmin && (
          <button
            type="button"
            className={`w-full px-3.5 py-[7px] font-semibold text-ui rounded-card border transition-colors ${
              karya.featured
                ? "bg-accent text-bg border-accent"
                : "bg-accent-tint text-accent border-accent-line hover:bg-accent hover:text-bg hover:border-accent"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
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

        <hr className="border-none border-b border-line my-8" />

        {karya.interests.length > 0 && (
          <div className="mb-7">
            <Eyebrow className="mb-1.5">Minat / tag</Eyebrow>
            <div className="flex flex-wrap items-center gap-1.5">
              {karya.interests.map((s) => (
                <Tag key={s} label={s} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-7">
          <Eyebrow className="mb-1.5">
            Kontributor ({karya.roster.length})
          </Eyebrow>
          <div className="flex flex-wrap gap-2">
            {karya.roster.map((m) => (
              <Avatar key={m.id} name={m.name} image={m.image} />
            ))}
          </div>
        </div>

        {/* Owner-only: pending join requests */}
        {isOwner && karya.pendingRequests.length > 0 && (
          <div className="mb-7">
            <Eyebrow className="mb-1.5">Permintaan gabung</Eyebrow>
            {karya.pendingRequests.map((m) => (
              <div
                key={m.id}
                className="pending-row flex justify-between items-center bg-bg border border-line rounded-card p-3 mb-2"
              >
                <div className="flex items-center gap-3 text-body font-medium text-ink">
                  <Avatar name={m.name} image={m.image} size={28} />
                  <span>{m.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={busy}
                    onClick={() => act(() => approveKaryaMember(id, m.id))}
                  >
                    Terima
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => act(() => declineKaryaMember(id, m.id))}
                  >
                    Tolak
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr className="border-none border-b border-line my-8" />

        {/* Post stream — Sprint 3 (FR-18/19). Members compose; everyone reads. */}
        <div className="mb-7">
          <Eyebrow className="mb-1.5">Update</Eyebrow>

          {isMember && (
            <div className="composer bg-bg border border-line rounded-panel p-4 flex flex-col gap-3 mb-6 focus-within:border-accent-line transition-colors">
              <textarea
                className="composer-input bg-transparent border-none font-body text-body text-ink resize-none outline-none min-h-[60px] placeholder:text-ink3"
                rows={3}
                placeholder="bagikan progres, tantangan, atau capaian…"
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  disabled={busy || !postBody.trim()}
                  onClick={submitPost}
                >
                  Posting
                </Button>
              </div>
            </div>
          )}

          {posts.length === 0 ? (
            <p className="font-mono text-ui text-ink3 py-5">
              belum ada update.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map((p) => (
                <article
                  key={p.id}
                  className="post-card bg-bg border border-line rounded-panel p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={p.author.name}
                        image={p.author.image}
                        size={28}
                      />
                      <span className="text-ui font-medium text-ink">
                        {p.author.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-body text-ink leading-body whitespace-pre-wrap m-0">
                    {p.body}
                  </p>
                  <div className="flex justify-end">
                    <span className="text-micro text-ink3">
                      {timeAgo(p.createdAt)}
                    </span>
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
