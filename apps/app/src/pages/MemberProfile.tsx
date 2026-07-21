import { useGetMember } from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
import { Eyebrow, Loading, Tag } from "@/components/ui-atoms";

export default function MemberProfilePage({ id }: { id: string }) {
  const { data: member, isLoading } = useGetMember(id);

  if (isLoading) return <Loading />;
  if (!member) {
    return (
      <div className="fixed inset-0 animate-up flex items-center">
        <div className="max-w-[var(--container-page)] mx-auto px-7">
          <p className="text-body text-ink2 leading-body">
            anggota tidak ditemukan.
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

        <h1 className="text-feature font-light tracking-heading leading-heading mb-1">
          {member.name}
        </h1>
        <p className="text-body text-ink2 leading-body mb-10">
          {member.year} · {member.major}
        </p>

        <hr className="border-none border-b border-line m-0 mb-7" />

        {member.bio && (
          <div className="mb-7">
            <Eyebrow className="mb-1.5">Bio</Eyebrow>
            <p>{member.bio}</p>
          </div>
        )}
        <div className="mb-7">
          <Eyebrow className="mb-1.5">Skills</Eyebrow>
          <div className="flex flex-wrap items-center gap-1.5">
            {(member.skills ?? []).map((s) => (
              <Tag key={s} label={s} />
            ))}
          </div>
        </div>
        <div className="mb-7">
          <Eyebrow className="mb-1.5">Minat</Eyebrow>
          <div className="flex flex-wrap items-center gap-1.5">
            {(member.interests ?? []).map((s) => (
              <Tag key={s} label={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
