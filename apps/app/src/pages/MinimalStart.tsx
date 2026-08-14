import { getGetMeQueryKey, saveProfile } from "@myapp/api-client-react";
import { Avatar, Button, Eyebrow, Input, Textarea } from "@myapp/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { EntryAlert, EntryLayout } from "@/components/EntryLayout";

const SKILLS = ["React", "Figma", "Python", "UI/UX", "Product", "Data"];
const INTERESTS = [
  "Web",
  "Mobile",
  "AI/ML",
  "Edukasi",
  "Komunitas",
  "Open Source",
];

function suggestedHandle(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

function ChoicePills({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <Eyebrow as="legend" className="mb-2">
        {label}
      </Eyebrow>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((item) => item !== option)
                    : [...selected, option],
                )
              }
              className={`rounded-full border px-3 py-1.5 text-ui transition-colors ${
                active
                  ? "border-ink bg-ink text-bg"
                  : "border-line bg-bg text-ink2 hover:border-line-dark hover:text-ink"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function MinimalStart({
  defaultName = "",
}: {
  defaultName?: string;
}) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [name, setName] = useState(defaultName);
  const [handle, setHandle] = useState(() => suggestedHandle(defaultName));
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [busyDestination, setBusyDestination] = useState<
    "/home" | "/assistant" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const invalid = !name.trim() || handle.trim().length < 3 || !major || !year;

  async function save(destination: "/home" | "/assistant") {
    if (invalid || busyDestination) return;
    setBusyDestination(destination);
    setError(null);
    try {
      await saveProfile({
        name: name.trim(),
        handle: handle.trim(),
        bio: bio.trim(),
        year,
        major,
        skills,
        interests,
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      navigate(destination);
    } catch {
      setError("Profil belum tersimpan. Isianmu tetap aman—coba lagi.");
      setBusyDestination(null);
    }
  }

  return (
    <EntryLayout
      eyebrow="Siapkan profil"
      title="Biar builder lain tahu siapa kamu."
      description="Isi identitas, keahlian, dan hal yang ingin kamu eksplorasi. Semuanya bisa disunting lagi dari Profil Saya."
      wide
    >
      {error && <EntryAlert>{error}</EntryAlert>}

      <div className="grid gap-5 rounded-panel border border-line bg-surface p-5 sm:grid-cols-2">
        <div className="flex items-center gap-4 sm:col-span-2">
          <Avatar name={name || "Profil"} size={64} />
          <div>
            <Eyebrow as="div" className="mb-1.5">
              Foto profil · opsional
            </Eyebrow>
            <p className="m-0 text-caption leading-body text-ink3">
              Kamu bisa menambahkan foto nanti dari Profil Saya.
            </p>
          </div>
        </div>

        <label htmlFor="profile-name">
          <Eyebrow as="span" className="mb-1.5 block">
            Nama
          </Eyebrow>
          <Input
            id="profile-name"
            aria-label="Nama"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          {!name.trim() && (
            <span className="mt-1.5 block text-micro text-accent">
              Nama perlu diisi.
            </span>
          )}
        </label>

        <label>
          <Eyebrow as="span" className="mb-1.5 block">
            Handle
          </Eyebrow>
          <div className="flex rounded-card border border-line bg-bg focus-within:ring-2 focus-within:ring-accent">
            <span className="px-3 py-2.5 text-body text-ink3">@</span>
            <input
              aria-label="Handle"
              value={handle}
              onChange={(event) =>
                setHandle(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "")
                    .slice(0, 24),
                )
              }
              className="min-w-0 flex-1 border-none bg-transparent py-2.5 pr-3 text-body text-ink outline-none"
            />
          </div>
          {handle.trim().length < 3 && (
            <span className="mt-1.5 block text-micro text-accent">
              Minimal 3 karakter.
            </span>
          )}
        </label>

        <label>
          <Eyebrow as="span" className="mb-1.5 block">
            Program studi
          </Eyebrow>
          <select
            aria-label="Program studi"
            value={major}
            onChange={(event) => setMajor(event.target.value)}
            className="h-[42px] w-full rounded-card border border-line bg-bg px-3 text-body text-ink outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Pilih program studi</option>
            <option value="Teknik Informatika">S1 Teknik Informatika</option>
            <option value="Sistem Informasi">S1 Sistem Informasi</option>
            <option value="Desain Komunikasi Visual">
              S1 Desain Komunikasi Visual
            </option>
          </select>
        </label>

        <label>
          <Eyebrow as="span" className="mb-1.5 block">
            Angkatan
          </Eyebrow>
          <select
            aria-label="Angkatan"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="h-[42px] w-full rounded-card border border-line bg-bg px-3 text-body text-ink outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Pilih angkatan</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </label>

        <label htmlFor="profile-bio" className="sm:col-span-2">
          <Eyebrow as="span" className="mb-1.5 block">
            Tentang kamu · opsional
          </Eyebrow>
          <Textarea
            id="profile-bio"
            aria-label="Tentang kamu"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            maxLength={180}
            className="resize-none bg-bg"
          />
          <span className="mt-1 block text-right text-micro text-ink3">
            {bio.length}/180
          </span>
        </label>

        <ChoicePills
          label="Keahlian · opsional"
          options={SKILLS}
          selected={skills}
          onChange={setSkills}
        />
        <ChoicePills
          label="Minat · opsional"
          options={INTERESTS}
          selected={interests}
          onChange={setInterests}
        />
      </div>

      <div className="mt-5 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button
          variant="ghost"
          size="lg"
          disabled={invalid || busyDestination !== null}
          onClick={() => save("/assistant")}
        >
          {busyDestination === "/assistant"
            ? "Menyimpan profil…"
            : "Simpan, lalu buka asisten AI"}
        </Button>
        <Button
          size="lg"
          disabled={invalid || busyDestination !== null}
          onClick={() => save("/home")}
          className="bg-ink text-bg hover:bg-ink/90"
        >
          {busyDestination === "/home" ? "Menyimpan profil…" : "Simpan & masuk"}
        </Button>
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-panel border border-accent-line bg-accent-tint p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div>
          <Eyebrow as="div" className="mb-1.5 text-accent">
            Lebih nyaman ngobrol?
          </Eyebrow>
          <p className="m-0 max-w-[520px] text-caption leading-body text-ink2">
            Kenalan lewat chat AI, lalu edit draf profilnya sebelum kamu simpan.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 border-accent-line bg-bg"
          onClick={() => navigate("/onboarding")}
        >
          Mulai onboarding dengan AI →
        </Button>
      </div>

      <p className="mt-3 text-right text-caption leading-body text-ink3">
        Keduanya opsional — pilih cara mulai yang paling nyaman buatmu.
      </p>
    </EntryLayout>
  );
}
