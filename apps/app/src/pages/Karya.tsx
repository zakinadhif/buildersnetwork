import {
  ApiError,
  approveKaryaMember,
  createPost,
  declineKaryaMember,
  featureKarya,
  joinKarya,
  type Member,
  unfeatureKarya,
  useGetKarya,
  useGetKaryaPosts,
} from "@myapp/api-client-react";
import { Avatar, Button, Eyebrow, Tag } from "@myapp/ui";
import { useState } from "react";
import { useLocation } from "wouter";
import Shell from "@/components/Shell";
import { STAGE_LABELS, timeAgo } from "@/components/ui-metadata";
import { karyaDetailState, orderedScreenshots } from "@/lib/karya-detail";
import { backNavigationState } from "@/lib/navigation";

export default function Karya({ id, me }: { id: string; me: Member }) {
  const [location, navigate] = useLocation();
  const detail = useGetKarya(id);
  const postsQuery = useGetKaryaPosts(id);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [postBody, setPostBody] = useState("");
  const errorStatus =
    detail.error instanceof ApiError ? detail.error.status : undefined;
  const state = karyaDetailState({
    loading: detail.isLoading,
    hasData: Boolean(detail.data),
    errorStatus,
    failed: detail.isError,
  });
  const karya = detail.data;

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await fn();
      await detail.refetch();
    } catch {
      setActionError("Aksi belum berhasil. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPost() {
    const body = postBody.trim();
    if (!body || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await createPost(id, { body });
      setPostBody("");
      await postsQuery.refetch();
    } catch {
      setActionError("Update belum terkirim. Isinya tetap aman—coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (state !== "ready" || !karya) {
    return (
      <Shell me={me} header={{ title: "Karya", backTo: "/karya" }}>
        {state === "loading" ? (
          <div
            role="status"
            aria-label="Memuat detail karya"
            className="space-y-4"
          >
            <div className="h-[220px] animate-pulse rounded-panel bg-surface" />
            <div className="h-9 w-2/3 animate-pulse rounded-card bg-surface" />
            <div className="h-20 animate-pulse rounded-card bg-surface" />
          </div>
        ) : state === "not-found" ? (
          <div className="rounded-panel border border-line bg-surface px-6 py-10 text-center">
            <Eyebrow as="div" className="mb-3">
              404 · Karya tidak ditemukan
            </Eyebrow>
            <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
              Halamannya belum bisa dibuka.
            </h1>
            <p className="m-0 text-body leading-body text-ink2">
              Karya mungkin sudah dihapus atau tautannya tidak lengkap.
            </p>
          </div>
        ) : (
          <div
            role="alert"
            className="rounded-panel border border-line bg-surface px-6 py-10 text-center"
          >
            <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
              Detail karya belum bisa dimuat.
            </h1>
            <p className="m-0 text-body leading-body text-ink2">
              Ada gangguan saat mengambil data karya. Coba lagi.
            </p>
            <Button className="mt-5" onClick={() => void detail.refetch()}>
              Coba lagi
            </Button>
          </div>
        )}
      </Shell>
    );
  }

  const membership = karya.viewerMembership;
  const isOwner = membership?.role === "owner";
  const isMember = membership?.status === "member";
  const screenshots = orderedScreenshots(karya.screenshots ?? []);
  const posts = postsQuery.data ?? [];

  const rail = (
    <>
      {actionError && (
        <div
          role="alert"
          className="rounded-card border border-accent-line bg-accent-tint px-3.5 py-3 text-caption leading-body text-accent"
        >
          {actionError}
        </div>
      )}
      {!membership ? (
        <Button
          variant="primary"
          disabled={busy}
          className="w-full"
          onClick={() => act(() => joinKarya(id))}
        >
          Minta gabung
        </Button>
      ) : membership.status === "pending" ? (
        <Button disabled className="w-full">
          Menunggu persetujuan
        </Button>
      ) : (
        <p className="m-0 rounded-card border border-line bg-surface px-3.5 py-3 text-caption leading-body text-ink2">
          {isOwner ? "Kamu pemilik karya ini." : "Kamu anggota karya ini."}
        </p>
      )}

      {karya.viewerIsAdmin && (
        <Button
          variant="outline"
          disabled={busy}
          className="w-full"
          onClick={() =>
            act(() => (karya.featured ? unfeatureKarya(id) : featureKarya(id)))
          }
        >
          {karya.featured ? "Hapus dari unggulan" : "Tandai unggulan"}
        </Button>
      )}

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow as="span">Tahap</Eyebrow>
          <span className="text-right text-ui text-ink2">
            {karya.stages.length
              ? STAGE_LABELS[karya.stages[karya.stages.length - 1]]
              : "Belum ditentukan"}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <Eyebrow as="span">Tim</Eyebrow>
          <span className="text-ui text-ink2">{karya.roster.length} orang</span>
        </div>
      </div>
    </>
  );

  return (
    <Shell
      me={me}
      rail={rail}
      header={{ title: karya.title, backTo: "/karya" }}
    >

      {karya.coverUrl ? (
        <img
          src={karya.coverUrl}
          alt={`Sampul ${karya.title}`}
          className="block h-[220px] w-full rounded-panel border border-line object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`Belum ada sampul untuk ${karya.title}`}
          className="flex h-[160px] items-center justify-center rounded-panel border border-line bg-surface"
        >
          <span className="font-display text-feature text-ink3">
            {karya.title.slice(0, 1)}
          </span>
        </div>
      )}

      <div className="mb-2.5 mt-[22px] flex flex-wrap items-center gap-2">
        {karya.featured && (
          <Eyebrow as="span" className="text-accent">
            Unggulan
          </Eyebrow>
        )}
        {karya.stages.map((stage) => (
          <Eyebrow as="span" key={stage}>
            {STAGE_LABELS[stage]}
          </Eyebrow>
        ))}
      </div>
      <h1 className="mb-3 mt-0 font-display text-display font-normal leading-heading tracking-heading text-ink">
        {karya.title}
      </h1>

      {karya.roster.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="flex">
            {karya.roster.map((member, index) => (
              <button
                key={member.id}
                type="button"
                aria-label={`Buka profil ${member.name}`}
                onClick={() =>
                  navigate(`/member/${member.id}`, {
                    state: backNavigationState(location),
                  })
                }
                className="relative border-none bg-transparent p-0"
                style={{
                  marginLeft: index === 0 ? 0 : -8,
                  zIndex: karya.roster.length - index,
                }}
              >
                <Avatar name={member.name} image={member.image} size={30} />
              </button>
            ))}
          </div>
          <span className="text-ui text-ink2">
            {karya.roster.map((member) => member.name).join(" · ")}
          </span>
        </div>
      ) : (
        <p className="mb-4 text-ui text-ink3">Belum ada anggota karya.</p>
      )}

      <p className="m-0 text-body leading-body text-ink2">
        {karya.description}
      </p>
      <div className="mt-3.5 flex flex-wrap gap-1">
        {karya.interests.map((interest) => (
          <Tag key={interest} label={interest} />
        ))}
      </div>

      <Eyebrow as="h2" className="mb-3 mt-[34px]">
        Tangkapan layar
      </Eyebrow>
      {screenshots.length === 0 ? (
        <p className="m-0 rounded-card border border-dashed border-line-dark px-4 py-5 text-body text-ink3">
          Belum ada tangkapan layar. Update karya tetap bisa dibaca di bawah.
        </p>
      ) : (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1.5">
          {screenshots.map((shot, index) => (
            <img
              key={shot.id}
              src={shot.url}
              alt={`${karya.title} — layar ${index + 1}`}
              loading="lazy"
              className={`shrink-0 snap-start rounded-panel border border-line bg-bg object-cover ${
                shot.orientation === "portrait"
                  ? "h-[300px] w-auto"
                  : "h-[220px] w-[390px]"
              }`}
            />
          ))}
        </div>
      )}

      {isOwner && karya.pendingRequests.length > 0 && (
        <section className="mt-[34px]">
          <Eyebrow as="h2" className="mb-3">
            Permintaan gabung
          </Eyebrow>
          {karya.pendingRequests.map((member) => (
            <div
              key={member.id}
              className="pending-row mb-2 flex items-center justify-between rounded-card border border-line bg-surface p-3"
            >
              <div className="flex items-center gap-3 text-body font-medium text-ink">
                <Avatar name={member.name} image={member.image} size={28} />
                <span>{member.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={() => act(() => approveKaryaMember(id, member.id))}
                >
                  Terima
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => act(() => declineKaryaMember(id, member.id))}
                >
                  Tolak
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      <Eyebrow as="h2" className="mb-3 mt-[34px]">
        Update terbaru
      </Eyebrow>
      {isMember && (
        <div className="composer mb-5 flex flex-col gap-3 rounded-panel border border-line bg-surface p-4 focus-within:border-accent-line">
          <textarea
            className="composer-input min-h-[60px] resize-none border-none bg-transparent text-body text-ink outline-none placeholder:text-ink3"
            rows={3}
            placeholder="Bagikan progres, tantangan, atau capaian…"
            value={postBody}
            onChange={(event) => setPostBody(event.target.value)}
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              disabled={busy || !postBody.trim()}
              onClick={submitPost}
            >
              Posting
            </Button>
          </div>
        </div>
      )}

      {postsQuery.isLoading ? (
        <p role="status" className="py-5 text-ui text-ink3">
          Memuat update…
        </p>
      ) : postsQuery.isError ? (
        <div role="alert" className="rounded-card border border-line p-4">
          <p className="m-0 text-body text-ink2">Update belum bisa dimuat.</p>
          <Button className="mt-3" onClick={() => void postsQuery.refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <p className="rounded-card border border-dashed border-line-dark px-4 py-5 text-body text-ink3">
          Belum ada update dari tim karya ini.
        </p>
      ) : (
        <div className="flex flex-col">
          {posts.map((post) => (
            <article
              key={post.id}
              className="post-card border-t border-line py-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <Avatar
                  name={post.author.name}
                  image={post.author.image}
                  size={28}
                />
                <span className="text-ui font-medium text-ink">
                  {post.author.name}
                </span>
                <span className="ml-auto text-micro text-ink3">
                  {timeAgo(post.createdAt)}
                </span>
              </div>
              <p className="m-0 whitespace-pre-wrap text-body leading-body text-ink">
                {post.body}
              </p>
              <button
                type="button"
                className="mt-3 cursor-pointer border-none bg-transparent p-0 text-left text-caption font-medium text-accent-mid"
                onClick={() =>
                  navigate(`/karya/${id}/posts/${post.id}`, {
                    state: backNavigationState(location),
                  })
                }
              >
                {post.commentCount > 0
                  ? `${post.commentCount} komentar · Lihat percakapan →`
                  : "Beri komentar →"}
              </button>
              {post.latestComment && (
                <button
                  type="button"
                  className="mt-3 flex w-full gap-2.5 border-t border-line bg-transparent pt-3 text-left"
                  onClick={() =>
                    navigate(`/karya/${id}/posts/${post.id}`, {
                      state: backNavigationState(location),
                    })
                  }
                >
                  <Avatar
                    name={post.latestComment.author.name}
                    image={post.latestComment.author.image}
                    size={28}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-ui font-medium text-ink">
                      {post.latestComment.author.name}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-ui leading-body text-ink2">
                      {post.latestComment.body}
                    </span>
                  </span>
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}
