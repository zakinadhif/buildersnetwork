import { useListMembers } from "@myapp/api-client-react";
import { Avatar, cn, Eyebrow, Tag } from "@myapp/ui";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import Shell from "@/components/Shell";
import type { Member } from "@/lib/members";
import { backNavigationState } from "@/lib/navigation";

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function uniqueValues(members: Member[], select: (member: Member) => string[]) {
  return [...new Set(members.flatMap(select))].sort((a, b) =>
    a.localeCompare(b, "id"),
  );
}

function MemberRow({ member }: { member: Member }) {
  const [location, navigate] = useLocation();

  return (
    <button
      type="button"
      onClick={() => navigate(`/member/${member.id}`, { state: backNavigationState(location) })}
      aria-label={`Buka profil ${member.name}`}
      className="grid w-full cursor-pointer items-start gap-x-4 border-0 border-b border-line bg-transparent py-[18px] text-left transition-colors hover:bg-bg-layer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ gridTemplateColumns: "auto 1fr" }}
    >
      <Avatar name={member.name} size={40} />
      <span className="flex min-w-0 flex-col gap-[5px]">
        <span className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-display text-title font-normal text-ink">
            {member.name}
          </span>
          {member.handle && (
            <span className="font-body text-micro text-ink3">
              @{member.handle}
            </span>
          )}
          <span className="ml-auto font-body text-micro text-ink3">
            {member.year} · {member.major}
          </span>
        </span>
        {member.bio && (
          <span className="font-body text-body leading-body text-ink2">
            {member.bio}
          </span>
        )}
        <span className="mt-0.5 flex flex-wrap gap-1">
          {member.skills.map((skill) => (
            <Tag key={skill} label={skill} accent />
          ))}
          {member.interests.map((interest) => (
            <Tag key={interest} label={interest} />
          ))}
        </span>
      </span>
    </button>
  );
}

function FilterColumn({
  label,
  items,
  active,
  onToggle,
}: {
  label: string;
  items: string[];
  active: string[];
  onToggle: (value: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <Eyebrow as="div" className="mb-2.5">
        {label}
      </Eyebrow>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const selected = active.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              aria-pressed={selected}
              className={cn(
                "cursor-pointer rounded-card border-none px-2 py-1 text-left font-body text-ui",
                selected
                  ? "bg-accent-tint font-medium text-accent"
                  : "bg-transparent font-normal text-ink2",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function People({ user }: { user: Member }) {
  const { data: members = [], isPending, isError, refetch } = useListMembers();
  const [query, setQuery] = useState("");
  const [activeInterests, setActiveInterests] = useState<string[]>([]);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);

  const interests = useMemo(
    () => uniqueValues(members, (member) => member.interests),
    [members],
  );
  const skills = useMemo(
    () => uniqueValues(members, (member) => member.skills),
    [members],
  );
  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");

    return members.filter((member) => {
      const searchable = [
        member.name,
        member.handle ?? "",
        member.bio ?? "",
        ...member.skills,
        ...member.interests,
      ].map((value) => value.toLocaleLowerCase("id"));
      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchable.some((value) => value.includes(normalizedQuery));
      const matchesSkills =
        activeSkills.length === 0 ||
        member.skills.some((skill) => activeSkills.includes(skill));
      const matchesInterests =
        activeInterests.length === 0 ||
        member.interests.some((interest) => activeInterests.includes(interest));

      return matchesQuery && matchesSkills && matchesInterests;
    });
  }, [activeInterests, activeSkills, members, query]);

  const hasFilters =
    activeInterests.length > 0 || activeSkills.length > 0 || query.length > 0;
  const clearFilters = () => {
    setQuery("");
    setActiveInterests([]);
    setActiveSkills([]);
  };

  const rail = isPending ? (
    <p className="font-body text-ui text-ink3">Memuat filter…</p>
  ) : isError ? (
    <p className="font-body text-ui text-ink3">
      Filter tersedia setelah direktori berhasil dimuat.
    </p>
  ) : (
    <>
      <FilterColumn
        label="Minat"
        items={interests}
        active={activeInterests}
        onToggle={(value) =>
          setActiveInterests((current) => toggleValue(current, value))
        }
      />
      <FilterColumn
        label="Keahlian"
        items={skills}
        active={activeSkills}
        onToggle={(value) =>
          setActiveSkills((current) => toggleValue(current, value))
        }
      />
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="self-start cursor-pointer rounded-card border border-line bg-transparent px-2.5 py-1.5 font-body text-micro tracking-tag text-ink2"
        >
          Hapus filter
        </button>
      )}
    </>
  );

  return (
    <Shell me={user} rail={rail}>
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-3 hidden items-baseline gap-2.5 min-[901px]:flex">
            <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">
              People
            </h1>
            <span className="font-body text-caption text-ink3">
              Direktori builder — cari lewat skill &amp; minat
            </span>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari builder, skill, minat…"
            aria-label="Cari builder berdasarkan nama, skill, atau minat"
            disabled={isPending || isError}
            className="w-full border-0 border-b-2 border-ink bg-transparent py-1.5 font-body font-light tracking-[-0.02em] text-ink outline-none placeholder:text-ink3 disabled:cursor-not-allowed disabled:border-line"
            style={{ fontSize: 22 }}
          />
        </div>

        <div className="flex items-baseline justify-between border-b border-line pb-2">
          <Eyebrow as="span">Builder</Eyebrow>
          {!isPending && !isError && (
            <span className="font-body text-micro tabular-nums text-ink3">
              {filteredMembers.length} orang
            </span>
          )}
        </div>

        {isPending ? (
          <p className="py-8 text-center font-body text-body text-ink3">
            Memuat direktori builder…
          </p>
        ) : isError ? (
          <div
            className="flex flex-col items-center gap-3 py-8 text-center"
            role="alert"
          >
            <p className="font-body text-body text-ink2">
              Direktori belum bisa dimuat.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="cursor-pointer rounded-card border border-line bg-transparent px-3 py-1.5 font-body text-ui text-ink"
            >
              Coba lagi
            </button>
          </div>
        ) : members.length === 0 ? (
          <p className="py-8 text-center font-body text-body text-ink3">
            Belum ada builder di direktori.
          </p>
        ) : filteredMembers.length === 0 ? (
          <p className="py-8 text-center font-body text-body text-ink3">
            Tidak ada builder yang cocok.
          </p>
        ) : (
          <div>
            {filteredMembers.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
