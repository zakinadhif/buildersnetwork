import {
  getGetMeQueryKey,
  type Member,
  saveProfile,
} from "@myapp/api-client-react";
import { Avatar, Button, Eyebrow, Input, Tag, Textarea } from "@myapp/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { InterestsEditor, SkillsEditor } from "@/components/ui-atoms";

type Draft = Pick<
  Member,
  "name" | "handle" | "bio" | "year" | "major" | "skills" | "interests"
>;

function fromMember(me: Member): Draft {
  return {
    name: me.name,
    handle: me.handle,
    bio: me.bio,
    year: me.year,
    major: me.major,
    skills: [...me.skills],
    interests: [...me.interests],
  };
}

function EmptyValue({ children }: { children: string }) {
  return <span className="text-body text-ink3">{children}</span>;
}

function ProfileTags({
  values,
  empty,
  accent = false,
}: {
  values: string[];
  empty: string;
  accent?: boolean;
}) {
  if (!values.length) return <EmptyValue>{empty}</EmptyValue>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <Tag key={value} label={value} accent={accent} />
      ))}
    </div>
  );
}

export default function OwnProfile({ me }: { me: Member }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => fromMember(me));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function save() {
    if (!draft.name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await saveProfile({
        name: draft.name.trim(),
        handle: draft.handle?.trim() || undefined,
        bio: draft.bio?.trim() || undefined,
        year: draft.year.trim(),
        major: draft.major.trim(),
        skills: draft.skills,
        interests: draft.interests,
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setBusy(false);
      setEditing(false);
    } catch {
      setError("Profil belum tersimpan. Isianmu tetap aman—coba lagi.");
      setBusy(false);
    }
  }

  return (
    <div className="pb-10 pt-1">
      <header className="mb-7 flex items-start justify-between gap-5">
        <div>
          <Eyebrow as="div" className="mb-2">
            Profil Saya
          </Eyebrow>
          <h1 className="m-0 font-display text-feature font-normal leading-heading tracking-heading text-ink">
            Kelola identitasmu.
          </h1>
        </div>
        {!editing && (
          <Button
            variant="primary"
            onClick={() => {
              setDraft(fromMember(me));
              setEditing(true);
            }}
          >
            Sunting profil
          </Button>
        )}
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-card border border-accent-line bg-accent-tint px-3.5 py-3 text-ui leading-body text-accent"
        >
          {error}
        </div>
      )}

      <section className="rounded-panel border border-line bg-surface p-5">
        <div className="mb-5 flex items-center gap-4">
          <Avatar
            name={(editing ? draft.name : me.name) || me.name}
            size={72}
          />
          <div className="min-w-0">
            <h2 className="mb-1 mt-0 font-display text-title font-normal text-ink">
              {(editing ? draft.name : me.name) || me.name}
            </h2>
            <span className="text-ui text-ink3">
              {(editing ? draft.handle : me.handle)
                ? `@${editing ? draft.handle : me.handle}`
                : "Handle belum diisi"}
            </span>
          </div>
        </div>

        {editing ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <label htmlFor="profile-name">
              <Eyebrow as="span" className="mb-1.5 block">
                Nama
              </Eyebrow>
              <Input
                id="profile-name"
                value={draft.name}
                onChange={(event) => set("name", event.target.value)}
              />
            </label>
            <label htmlFor="profile-handle">
              <Eyebrow as="span" className="mb-1.5 block">
                Handle
              </Eyebrow>
              <Input
                id="profile-handle"
                value={draft.handle ?? ""}
                onChange={(event) => set("handle", event.target.value)}
              />
            </label>
            <label htmlFor="profile-major">
              <Eyebrow as="span" className="mb-1.5 block">
                Jurusan
              </Eyebrow>
              <Input
                id="profile-major"
                value={draft.major}
                onChange={(event) => set("major", event.target.value)}
              />
            </label>
            <label htmlFor="profile-year">
              <Eyebrow as="span" className="mb-1.5 block">
                Angkatan
              </Eyebrow>
              <Input
                id="profile-year"
                value={draft.year}
                onChange={(event) => set("year", event.target.value)}
              />
            </label>
            <label htmlFor="profile-bio" className="sm:col-span-2">
              <Eyebrow as="span" className="mb-1.5 block">
                Tentang kamu
              </Eyebrow>
              <Textarea
                id="profile-bio"
                rows={4}
                value={draft.bio ?? ""}
                onChange={(event) => set("bio", event.target.value)}
                className="resize-none bg-bg"
              />
            </label>
            <div className="sm:col-span-2">
              <Eyebrow as="div" className="mb-2">
                Keahlian
              </Eyebrow>
              <SkillsEditor
                skills={draft.skills}
                onChange={(value) => set("skills", value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Eyebrow as="div" className="mb-2">
                Minat
              </Eyebrow>
              <InterestsEditor
                interests={draft.interests}
                onChange={(value) => set("interests", value)}
              />
            </div>
            <div className="flex justify-end gap-3 border-t border-line pt-5 sm:col-span-2">
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setDraft(fromMember(me));
                  setError(null);
                  setEditing(false);
                }}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                disabled={busy || !draft.name.trim()}
                onClick={save}
              >
                {busy ? "Menyimpan…" : "Simpan perubahan"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-t border-line py-4">
              <Eyebrow as="div" className="mb-1">
                Tentang kamu
              </Eyebrow>
              <p className="m-0 text-body leading-body text-ink2">
                {me.bio ||
                  "Tambahkan bio singkat agar builder lain mengenalmu."}
              </p>
            </div>
            <div className="border-t border-line py-4">
              <Eyebrow as="div" className="mb-1">
                Kampus
              </Eyebrow>
              <p className="m-0 text-body leading-body text-ink2">
                {[me.major, me.year].filter(Boolean).join(" · ") ||
                  "Jurusan dan angkatan belum diisi."}
              </p>
            </div>
            <div className="border-t border-line py-4">
              <Eyebrow as="div" className="mb-2">
                Keahlian
              </Eyebrow>
              <ProfileTags
                values={me.skills}
                empty="Belum ada keahlian. Tambahkan sekarang."
                accent
              />
            </div>
            <div className="border-t border-line pt-4">
              <Eyebrow as="div" className="mb-2">
                Minat
              </Eyebrow>
              <ProfileTags
                values={me.interests}
                empty="Belum ada minat. Tambahkan sekarang."
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
