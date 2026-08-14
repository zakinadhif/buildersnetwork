import {
  ApiError,
  createComment,
  deleteComment,
  type Member,
  useGetKarya,
  useGetKaryaPost,
  useGetPostComments,
} from "@myapp/api-client-react";
import { Avatar, Button, Eyebrow, Textarea } from "@myapp/ui";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import Shell from "@/components/Shell";
import { timeAgo } from "@/components/ui-metadata";

export default function KaryaPost({
  karyaId,
  postId,
  me,
}: {
  karyaId: string;
  postId: string;
  me: Member;
}) {
  const [, navigate] = useLocation();
  const karyaQuery = useGetKarya(karyaId);
  const postQuery = useGetKaryaPost(karyaId, postId);
  const commentsQuery = useGetPostComments(karyaId, postId);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const postNotFound =
    postQuery.error instanceof ApiError && postQuery.error.status === 404;
  const karya = karyaQuery.data;
  const post = postQuery.data;
  const comments = commentsQuery.data ?? [];
  const isOwner = karya?.createdBy === me.id;

  async function submitComment() {
    const trimmed = body.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await createComment(karyaId, postId, { body: trimmed });
      setBody("");
      await Promise.all([commentsQuery.refetch(), postQuery.refetch()]);
    } catch {
      setActionError("Komentar belum terkirim. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(commentId: string) {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await deleteComment(karyaId, postId, commentId);
      await Promise.all([commentsQuery.refetch(), postQuery.refetch()]);
    } catch {
      setActionError("Komentar belum dihapus. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

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
      <div className="rounded-panel border border-line bg-surface p-4">
        <Eyebrow as="div" className="mb-2">
          Rumah percakapan
        </Eyebrow>
        <p className="m-0 text-caption leading-body text-ink2">
          Komentar hidup di update ini. Timeline karya dan Scroll hanya
          menampilkan pintu masuknya.
        </p>
      </div>
    </>
  );

  if (postQuery.isLoading) {
    return (
      <Shell me={me} rail={rail}>
        <BackButton
          karyaId={karyaId}
          onBack={() => navigate(`/karya/${karyaId}`)}
        />
        <div role="status" aria-label="Memuat post" className="space-y-4">
          <div className="h-24 animate-pulse rounded-card bg-surface" />
          <div className="h-16 animate-pulse rounded-card bg-surface" />
          <div className="h-20 animate-pulse rounded-card bg-surface" />
        </div>
      </Shell>
    );
  }

  if (postNotFound) {
    return (
      <Shell me={me} rail={rail}>
        <BackButton
          karyaId={karyaId}
          onBack={() => navigate(`/karya/${karyaId}`)}
        />
        <div className="rounded-panel border border-line bg-surface px-6 py-10 text-center">
          <Eyebrow as="div" className="mb-3">
            404 · Post tidak ditemukan
          </Eyebrow>
          <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
            Update ini sudah tidak tersedia.
          </h1>
          <p className="m-0 text-body leading-body text-ink2">
            Kembali ke timeline karya untuk membaca update lainnya.
          </p>
        </div>
      </Shell>
    );
  }

  if (postQuery.isError || !post) {
    return (
      <Shell me={me} rail={rail}>
        <BackButton
          karyaId={karyaId}
          onBack={() => navigate(`/karya/${karyaId}`)}
        />
        <div
          role="alert"
          className="rounded-panel border border-line bg-surface px-6 py-10 text-center"
        >
          <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
            Post belum bisa dimuat.
          </h1>
          <p className="m-0 text-body leading-body text-ink2">
            Ada gangguan saat mengambil update ini. Coba lagi.
          </p>
          <Button className="mt-5" onClick={() => void postQuery.refetch()}>
            Coba lagi
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell me={me} rail={rail}>
      <BackButton
        karyaId={karyaId}
        onBack={() => navigate(`/karya/${karyaId}`)}
      />

      <article className="border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} image={post.author.image} size={44} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-title font-normal leading-heading text-ink">
              {karya?.title ?? "Post"}
            </div>
            <div className="mt-px text-micro text-ink3">
              diposting {post.author.name} · {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>
        <p className="mb-0 mt-4 whitespace-pre-wrap text-stat leading-body text-ink">
          {post.body}
        </p>
        <div className="mt-4 flex items-center gap-2 text-caption text-ink3">
          <MessageCircle size={12} strokeWidth={2} aria-hidden="true" />
          {post.commentCount} komentar
        </div>
      </article>

      <section aria-label="Komentar">
        <div className="flex gap-3 border-b border-line py-4">
          <Avatar name={me.name} size={36} />
          <div className="min-w-0 flex-1">
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={2}
              disabled={busy}
              aria-label="Tulis komentar"
              placeholder="Tulis komentar"
              className="min-h-0 resize-none border-0 bg-transparent px-0 py-1 text-body leading-body shadow-none focus-visible:ring-0"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-micro text-ink3">
                Semua member komunitas dapat berkomentar.
              </span>
              <Button
                variant="primary"
                disabled={!body.trim() || busy}
                className="h-[32px] shrink-0 rounded-full px-4"
                onClick={() => void submitComment()}
              >
                <Send size={12} aria-hidden="true" />
                <span className="ml-1.5 text-caption">
                  {busy ? "Mengirim…" : "Kirim"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {commentsQuery.isLoading ? (
          <div role="status" aria-label="Memuat komentar" className="space-y-0">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse border-b border-line bg-bg-hover"
              />
            ))}
          </div>
        ) : commentsQuery.isError ? (
          <div
            role="alert"
            className="border-b border-line px-2 py-8 text-center"
          >
            <p className="m-0 text-body text-ink2">
              Komentar belum bisa dimuat.
            </p>
            <Button
              className="mt-3"
              onClick={() => void commentsQuery.refetch()}
            >
              Coba lagi
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="border-b border-line px-2 py-9 text-center">
            <h2 className="m-0 font-display text-title font-normal text-ink">
              Belum ada komentar
            </h2>
            <p className="mb-0 mt-1 text-body text-ink3">
              Jadilah yang pertama memberi masukan untuk update ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {comments.map((comment) => {
              const ownComment = comment.author.id === me.id;
              const canModerate = ownComment || isOwner;
              return (
                <article
                  key={comment.id}
                  className="flex gap-3 border-b border-line py-4"
                >
                  <Avatar
                    name={comment.author.name}
                    image={comment.author.image}
                    size={36}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-ui font-medium text-ink">
                        {comment.author.name}
                      </span>
                      <span className="text-micro text-ink3">
                        {timeAgo(comment.createdAt)}
                      </span>
                      {canModerate && (
                        <button
                          type="button"
                          disabled={busy}
                          aria-label={
                            ownComment
                              ? "Hapus komentar saya"
                              : `Hapus komentar ${comment.author.name}`
                          }
                          className="ml-auto inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-micro text-ink3 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => void removeComment(comment.id)}
                        >
                          <Trash2 size={11} aria-hidden="true" />
                          {ownComment ? "Hapus" : "Hapus dari karya"}
                        </button>
                      )}
                    </div>
                    <p className="mb-0 mt-1 whitespace-pre-wrap text-body leading-body text-ink">
                      {comment.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Shell>
  );
}

function BackButton({
  karyaId,
  onBack,
}: {
  karyaId: string;
  onBack: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={`Kembali ke karya ${karyaId}`}
      className="mb-5 w-fit border-none bg-transparent p-0 text-title leading-none text-ink"
    >
      ←
    </button>
  );
}
