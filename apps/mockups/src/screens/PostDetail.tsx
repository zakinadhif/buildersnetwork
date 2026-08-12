/**
 * Issue #144 direction: `/karya/:karyaId/posts/:postId` is the canonical home
 * of one update and its first-layer conversation. Karya and Scroll only tease
 * the thread; composing and moderation live here.
 */
import { useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { Avatar, Button, KaryaCover, MainColumn, RailColumn, Textarea, cn } from "@myapp/ui";
import { PreviewStates } from "../components/PreviewStates";
import { Shell } from "../components/Shell";
import { COMMENTS, COMMENT_AUTHORS, POSTS } from "../data/comments";
import { KARYA } from "../data/karya";
import { useNavigate } from "../gallery";
import { relativeTime } from "../lib/format";
import { coverFor } from "../lib/images";
import { Eyebrow } from "@myapp/ui";

type ViewerRole = "owner" | "community" | "signed-out";
type ThreadState = "populated" | "empty" | "composing" | "loading" | "error" | "not-found";
const REVIEW_DRAFT = "Filter berdasarkan tipe kerja juga akan membantu";

function RoleToggle({ role, onChange }: { role: ViewerRole; onChange: (role: ViewerRole) => void }) {
  return (
    <div className="flex gap-0.5 rounded-full border border-line bg-surface p-[3px]">
      {([["owner", "Owner"], ["community", "Komunitas"], ["signed-out", "Tamu"]] as const).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={role === value}
          className={cn(
            "flex-1 cursor-pointer rounded-full border-none px-3 py-[5px] font-body text-micro",
            role === value ? "bg-ink font-medium text-bg" : "bg-transparent text-ink2",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function PostDetailScreen() {
  const navigate = useNavigate();
  const [role, setRole] = useState<ViewerRole>("community");
  const [threadState, setThreadState] = useState<ThreadState>("populated");
  const [body, setBody] = useState("");
  const post = POSTS[0];
  const karya = KARYA.find((item) => item.id === post.karyaId) ?? KARYA[0];
  const comments = threadState === "empty" ? [] : COMMENTS.filter((comment) => comment.postId === post.id);
  const busy = threadState === "composing";

  function changeThreadState(next: ThreadState) {
    setThreadState(next);
    setBody(next === "composing" || next === "error" ? REVIEW_DRAFT : "");
  }

  return (
    <Shell active="post-detail">
      <MainColumn>
        <header className="mx-[calc(-1*var(--shell-gutter))] mb-5 flex min-h-11 items-center gap-4 border-b border-line px-[var(--shell-gutter)] pb-3 max-[900px]:mx-0 max-[900px]:px-0">
          <button
            type="button"
            onClick={() => navigate("karya-detail")}
            aria-label={`Kembali ke ${karya.title}`}
            className="cursor-pointer border-none bg-transparent p-0 font-body text-title leading-none text-ink"
          >
            ←
          </button>
          <h1 className="m-0 font-display text-title font-normal text-ink">Post</h1>
        </header>

        {threadState === "not-found" ? (
          <div className="rounded-panel border border-line bg-surface px-6 py-10 text-center">
            <Eyebrow as="div" className="mb-3">404 · Post tidak ditemukan</Eyebrow>
            <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">Update ini sudah tidak tersedia.</h1>
            <p className="m-0 font-body text-body leading-body text-ink2">Kembali ke timeline karya untuk membaca update lainnya.</p>
          </div>
        ) : (
          <>
            <article className="mx-[calc(-1*var(--shell-gutter))] border-b border-line px-[var(--shell-gutter)] pb-4 max-[900px]:mx-0 max-[900px]:px-0">
              <div className="flex items-center gap-3">
                <div className="relative size-12 shrink-0">
                  <KaryaCover src={coverFor(karya.interests)} size={46} radius={13} alt={`Logo ${karya.title}`} />
                  <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-surface leading-none shadow-[0_0_0_2px_var(--color-surface)]">
                    <Avatar name={post.author} size={17} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-title font-normal leading-heading text-ink">{karya.title}</div>
                  <div className="mt-px font-body text-micro text-ink3">diposting {post.author}</div>
                </div>
              </div>
              <p className="mb-0 mt-4 font-body text-stat leading-body text-ink">{post.body}</p>
              <div className="mt-4 flex items-center gap-2 font-body text-caption text-ink3">
                <span>{relativeTime(post.hoursAgo)}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle size={12} strokeWidth={2} aria-hidden="true" />
                  {comments.length} komentar
                </span>
              </div>
            </article>

            <section aria-label="Komentar">
              {role === "signed-out" ? (
                <div className="mx-[calc(-1*var(--shell-gutter))] flex items-center justify-between gap-3 border-b border-line px-[var(--shell-gutter)] py-4 max-[900px]:mx-0 max-[900px]:px-0">
                  <span className="font-body text-body text-ink2">Masuk untuk ikut berkomentar.</span>
                  <Button variant="outline" className="h-auto shrink-0 px-3 py-1.5 text-caption">Masuk</Button>
                </div>
              ) : (
                <div className="mx-[calc(-1*var(--shell-gutter))] flex gap-3 border-b border-line px-[var(--shell-gutter)] py-4 max-[900px]:mx-0 max-[900px]:px-0">
                  <Avatar name="Zaki Nadhif" size={36} />
                  <div className="min-w-0 flex-1">
                    <Textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      rows={2}
                      disabled={busy}
                      aria-label="Tulis komentar"
                      placeholder="Tulis komentar"
                      className={cn(
                        "min-h-0 resize-none border-0 bg-transparent px-0 py-1 font-body text-body leading-body shadow-none focus-visible:ring-0",
                        threadState === "error" && "text-danger",
                      )}
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span
                        role={threadState === "error" ? "alert" : undefined}
                        className={cn("font-body text-micro text-ink3", threadState === "error" && "text-danger")}
                      >
                        {threadState === "error"
                          ? "Komentar belum terkirim. Coba lagi."
                          : role === "community"
                            ? "Semua member komunitas dapat berkomentar."
                            : "Berkomentar sebagai anggota karya."}
                      </span>
                      <Button variant="primary" disabled={!body.trim() || busy} className="h-[32px] shrink-0 rounded-full px-4">
                        <Send size={12} aria-hidden="true" />
                        <span className="ml-1.5 font-body text-caption">{busy ? "Mengirim…" : threadState === "error" ? "Coba lagi" : "Kirim"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {threadState === "loading" ? (
                <div role="status" aria-label="Memuat komentar" className="space-y-0">
                  {[0, 1, 2].map((item) => <div key={item} className="mx-[calc(-1*var(--shell-gutter))] h-20 animate-pulse border-b border-line bg-bg-hover px-[var(--shell-gutter)] max-[900px]:mx-0 max-[900px]:px-0" />)}
                </div>
              ) : (
                <div className="flex flex-col">
                  {comments.map((comment) => {
                    const author = COMMENT_AUTHORS[comment.authorId];
                    const ownComment = comment.authorId === 99;
                    const canModerate = ownComment || role === "owner";
                    return (
                      <article key={comment.id} className="mx-[calc(-1*var(--shell-gutter))] flex gap-3 border-b border-line px-[var(--shell-gutter)] py-4 max-[900px]:mx-0 max-[900px]:px-0">
                        <Avatar name={author} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="font-body text-ui font-medium text-ink">{author}</span>
                            <span className="font-body text-micro text-ink3">{comment.createdAt}</span>
                            {canModerate && (
                              <button
                                type="button"
                                aria-label={ownComment ? "Hapus komentar saya" : `Hapus komentar ${author}`}
                                className="ml-auto inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-body text-micro text-ink3"
                              >
                                <Trash2 size={11} aria-hidden="true" />
                                {ownComment ? "Hapus" : "Hapus dari karya"}
                              </button>
                            )}
                          </div>
                          <p className="mb-0 mt-1 font-body text-body leading-body text-ink">{comment.body}</p>
                        </div>
                      </article>
                    );
                  })}
                  {comments.length === 0 && (
                    <div className="mx-[calc(-1*var(--shell-gutter))] border-b border-line px-[var(--shell-gutter)] py-9 text-center max-[900px]:mx-0 max-[900px]:px-0">
                      <h2 className="m-0 font-display text-title font-normal text-ink">Belum ada komentar</h2>
                      <p className="mb-0 mt-1 font-body text-body text-ink3">Jadilah yang pertama memberi masukan untuk update ini.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </MainColumn>

      <RailColumn>
        <PreviewStates
          label="State post detail"
          value={threadState}
          onChange={changeThreadState}
          options={[
            { value: "populated", label: "Terisi" },
            { value: "empty", label: "Kosong" },
            { value: "composing", label: "Mengirim" },
            { value: "loading", label: "Loading" },
            { value: "error", label: "Gagal" },
            { value: "not-found", label: "404" },
          ]}
        >
          <Eyebrow as="div" className="mb-2">Peran</Eyebrow>
          <RoleToggle role={role} onChange={setRole} />
        </PreviewStates>
        <div className="rounded-card border border-line bg-surface p-3.5">
          <Eyebrow as="div" className="mb-2">Rumah percakapan</Eyebrow>
          <p className="m-0 font-body text-caption leading-body text-ink2">Post punya permalink sendiri. Timeline karya dan Scroll hanya menampilkan teaser yang membuka halaman ini.</p>
        </div>
      </RailColumn>
    </Shell>
  );
}
