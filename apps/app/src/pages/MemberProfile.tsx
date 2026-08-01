import {
  ApiError,
  type Member,
  useGetFeed,
  useGetMember,
  useListKarya,
} from "@myapp/api-client-react";
import { Avatar, Button, Eyebrow, KaryaCover, Tag } from "@myapp/ui";
import { useLocation } from "wouter";
import Shell from "@/components/Shell";
import { STAGE_LABELS, timeAgo } from "@/components/ui-metadata";
import {
  memberProfileState,
  memberProjects,
  memberUpdates,
} from "@/lib/member-profile";

export default function MemberProfilePage({
  id,
  me,
}: {
  id: string;
  me: Member;
}) {
  const [, navigate] = useLocation();
  const memberQuery = useGetMember(id);
  const karyaQuery = useListKarya();
  const feedQuery = useGetFeed();
  const errorStatus =
    memberQuery.error instanceof ApiError
      ? memberQuery.error.status
      : undefined;
  const state = memberProfileState({
    loading: memberQuery.isLoading,
    failed: memberQuery.isError,
    errorStatus,
    hasData: Boolean(memberQuery.data),
  });
  const member = memberQuery.data;
  const isSelf = id === me.id;

  if (state !== "ready" || !member) {
    return (
      <Shell me={me}>
        <button
          type="button"
          onClick={() => navigate("/people")}
          className="mb-6 w-fit border-none bg-transparent p-0 text-ui text-ink2"
        >
          ← Kembali ke People
        </button>
        {state === "loading" ? (
          <div
            role="status"
            aria-label="Memuat profil member"
            className="space-y-4"
          >
            <div className="h-20 w-20 animate-pulse rounded-full bg-surface" />
            <div className="h-8 w-1/2 animate-pulse rounded-card bg-surface" />
            <div className="h-20 animate-pulse rounded-card bg-surface" />
          </div>
        ) : state === "not-found" ? (
          <div className="rounded-panel border border-line bg-surface px-6 py-10 text-center">
            <Eyebrow as="div" className="mb-3">
              404 · Profil tidak ditemukan
            </Eyebrow>
            <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
              Builder ini belum bisa ditemukan.
            </h1>
            <p className="m-0 text-body leading-body text-ink2">
              Kembali ke People untuk melihat builder lain.
            </p>
          </div>
        ) : (
          <div
            role="alert"
            className="rounded-panel border border-line bg-surface px-6 py-10 text-center"
          >
            <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
              Profil belum bisa dimuat.
            </h1>
            <p className="m-0 text-body leading-body text-ink2">
              Ada gangguan saat mengambil profil. Coba lagi.
            </p>
            <Button className="mt-5" onClick={() => void memberQuery.refetch()}>
              Coba lagi
            </Button>
          </div>
        )}
      </Shell>
    );
  }

  const projects = memberProjects(karyaQuery.data ?? [], member.id);
  const updates = memberUpdates(feedQuery.data ?? [], member.id);
  const rail = (
    <>
      <div className="rounded-panel border border-line bg-surface p-4">
        <Eyebrow as="div" className="mb-2">
          {isSelf ? "Profil publikmu" : "Profil publik"}
        </Eyebrow>
        <p className="m-0 text-caption leading-body text-ink2">
          {isSelf
            ? "Ini tampilan yang dilihat komunitas. Pengelolaan profil tetap berada di Profil Saya."
            : "Lihat identitas, keahlian, minat, dan karya publik builder ini. Pesan dan ajakan kolaborasi hadir di P1."}
        </p>
      </div>
      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex justify-between">
          <Eyebrow as="span">Karya</Eyebrow>
          <span className="text-ui text-ink2">{projects.length}</span>
        </div>
        <div className="flex justify-between">
          <Eyebrow as="span">Keahlian</Eyebrow>
          <span className="text-ui text-ink2">{member.skills.length}</span>
        </div>
        <div className="flex justify-between gap-3">
          <Eyebrow as="span">Angkatan</Eyebrow>
          <span className="text-right text-ui text-ink2">
            {member.year || "Belum diisi"}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <Shell me={me} rail={rail}>
      <button
        type="button"
        onClick={() => navigate("/people")}
        className="mb-6 w-fit border-none bg-transparent p-0 text-ui text-ink2"
      >
        ← Kembali ke People
      </button>

      <div className="flex items-start gap-[18px]">
        <Avatar name={member.name} size={76} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="mb-[3px] mt-0 font-display text-feature font-normal leading-heading tracking-heading text-ink">
              {member.name}
            </h1>
            {isSelf && <Eyebrow as="span">Kamu</Eyebrow>}
          </div>
          <div className="mb-2.5 text-ui text-ink3">
            {member.handle ? `@${member.handle}` : "Handle belum diisi"}
            {(member.year || member.major) && " · "}
            {[member.year, member.major].filter(Boolean).join(" · ")}
          </div>
          <p className="m-0 text-body leading-body text-ink2">
            {member.bio || "Builder baru yang belum melengkapi bio."}
          </p>
        </div>
      </div>

      <Eyebrow as="h2" className="mb-2.5 mt-[30px]">
        Keahlian
      </Eyebrow>
      <div className="mb-[22px] flex flex-wrap gap-1.5">
        {member.skills.length ? (
          member.skills.map((skill) => <Tag key={skill} label={skill} accent />)
        ) : (
          <span className="text-body text-ink3">Belum ditambahkan.</span>
        )}
      </div>

      <Eyebrow as="h2" className="mb-2.5">
        Minat
      </Eyebrow>
      <div className="mb-[30px] flex flex-wrap gap-1.5">
        {member.interests.length ? (
          member.interests.map((interest) => (
            <Tag key={interest} label={interest} />
          ))
        ) : (
          <span className="text-body text-ink3">Belum ditambahkan.</span>
        )}
      </div>

      <Eyebrow as="h2" className="mb-1">
        Karya yang digarap
      </Eyebrow>
      {karyaQuery.isLoading ? (
        <p role="status" className="py-[18px] text-body text-ink3">
          Memuat karya…
        </p>
      ) : karyaQuery.isError ? (
        <div role="alert" className="my-3 rounded-card border border-line p-4">
          <p className="m-0 text-body text-ink2">Karya belum bisa dimuat.</p>
          <Button className="mt-3" onClick={() => void karyaQuery.refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <p className="py-[18px] text-body text-ink3">
          Belum ada karya yang dibagikan.
        </p>
      ) : (
        <div>
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => navigate(`/karya/${project.id}`)}
              className="flex w-full gap-3.5 border-x-0 border-b-0 border-t border-line bg-transparent py-3.5 text-left"
            >
              <KaryaCover
                src={project.coverUrl}
                size={60}
                radius={12}
                alt={project.title}
              />
              <span className="min-w-0 flex-1">
                <span className="mb-[3px] flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-title text-ink">
                    {project.title}
                  </span>
                  {project.stages.length > 0 && (
                    <Eyebrow as="span">
                      {STAGE_LABELS[project.stages[project.stages.length - 1]]}
                    </Eyebrow>
                  )}
                </span>
                <span className="block text-caption leading-body text-ink2">
                  {project.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <Eyebrow as="h2" className="mb-1 mt-[30px]">
        Aktivitas terbaru
      </Eyebrow>
      {feedQuery.isLoading ? (
        <p role="status" className="py-[18px] text-body text-ink3">
          Memuat aktivitas…
        </p>
      ) : feedQuery.isError ? (
        <div role="alert" className="my-3 rounded-card border border-line p-4">
          <p className="m-0 text-body text-ink2">
            Aktivitas belum bisa dimuat.
          </p>
          <Button className="mt-3" onClick={() => void feedQuery.refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : updates.length === 0 ? (
        <p className="py-[18px] text-body text-ink3">
          Belum ada update publik dari builder ini.
        </p>
      ) : (
        <div>
          {updates.map((update) => (
            <article key={update.id} className="border-t border-line py-4">
              <button
                type="button"
                onClick={() => navigate(`/karya/${update.karya.id}`)}
                className="border-none bg-transparent p-0 text-left"
              >
                <span className="font-display text-title text-ink">
                  {update.karya.title}
                </span>
              </button>
              <p className="mb-2 mt-1 whitespace-pre-wrap text-body leading-body text-ink2">
                {update.body}
              </p>
              <span className="text-micro text-ink3">
                {timeAgo(update.createdAt)}
              </span>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}
