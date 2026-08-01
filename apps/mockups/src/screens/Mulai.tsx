/**
 * Al-Fath Berkarya — Mulai (profil lengkap) · issue #102
 *
 * A direct, form-based setup. It collects every field needed by the public and
 * self profile surfaces without routing through an AI or conversational ramp.
 */

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, Eyebrow } from "@myapp/ui";
import { PreviewStates } from "../components/PreviewStates";
import { PillMultiSelect } from "../components/PillMultiSelect";

type StartState = "ready" | "busy" | "error";

const SKILLS = ["React", "Figma", "Python", "UI/UX", "Product", "Data"];
const INTERESTS = ["Web", "Mobile", "AI/ML", "Edukasi", "Komunitas", "Open Source"];

export default function MulaiScreen() {
  const photoInput = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<StartState>("ready");
  const [name, setName] = useState("Zaki Nadhif");
  const [handle, setHandle] = useState("zaki_n");
  const [bio, setBio] = useState("Suka membangun produk digital yang berguna untuk komunitas.");
  const [skills, setSkills] = useState(["React", "Product"]);
  const [interests, setInterests] = useState(["Web", "Komunitas"]);
  const [photoName, setPhotoName] = useState("");
  const invalid = name.trim().length === 0 || handle.trim().length < 3;

  return (
    <div className="min-h-screen bg-bg px-6 py-12 font-body">
      <div className="mx-auto w-full max-w-[720px]">
        <Eyebrow as="div" className="mb-3.5">Siapkan profil</Eyebrow>
        <h1 className="mb-2.5 mt-0 font-display text-feature font-light tracking-heading leading-heading text-ink">
          Biar builder lain tahu siapa kamu.
        </h1>
        <p className="mb-8 mt-0 max-w-[600px] font-body text-body leading-body text-ink2">
          Isi identitas, keahlian, dan hal yang ingin kamu eksplorasi. Semuanya bisa disunting lagi dari Profil Saya.
        </p>

        <PreviewStates
          label="State simpan"
          value={state}
          onChange={setState}
          options={[
            { value: "ready", label: "Siap" },
            { value: "busy", label: "Menyimpan" },
            { value: "error", label: "Gagal" },
          ]}
        />

        {state === "error" && (
          <div role="alert" className="mb-5 rounded-card border border-accent-line bg-accent-tint px-3.5 py-3 font-body text-ui leading-body text-accent">
            Profil belum tersimpan. Isianmu tetap aman—coba lagi.
          </div>
        )}

        <div className="grid gap-5 rounded-panel border border-line bg-surface p-5 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2">
            <Avatar name={name || "Profil"} size={64} />
            <div className="min-w-0 flex-1">
              <Eyebrow as="div" className="mb-1.5">Foto profil <span className="font-normal normal-case tracking-normal text-ink3">· opsional</span></Eyebrow>
              <input
                ref={photoInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? "")}
              />
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                className="inline-flex items-center gap-2 rounded-card border border-dashed border-line-dark bg-bg px-3 py-2 font-body text-caption font-medium text-ink2"
              >
                <Camera size={15} strokeWidth={1.8} aria-hidden="true" />
                {photoName || "Pilih foto"}
              </button>
              <p className="mb-0 mt-1.5 font-body text-micro text-ink3">JPG, PNG, atau WebP. Maksimal 5 MB.</p>
            </div>
          </div>
          <label className="block">
            <Eyebrow as="span" className="mb-1.5 block">Nama</Eyebrow>
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-card border border-line bg-bg px-3 py-2.5 font-body text-body text-ink outline-none" />
            {!name.trim() && <span className="mt-1.5 block font-body text-micro text-accent">Nama perlu diisi.</span>}
          </label>
          <label className="block">
            <Eyebrow as="span" className="mb-1.5 block">Handle</Eyebrow>
            <div className="flex rounded-card border border-line bg-bg">
              <span className="px-3 py-2.5 font-body text-body text-ink3">@</span>
              <input value={handle} onChange={(event) => setHandle(event.target.value.replace(/\s/g, ""))} className="min-w-0 flex-1 border-none bg-transparent py-2.5 pr-3 font-body text-body text-ink outline-none" />
            </div>
            {handle.trim().length < 3 && <span className="mt-1.5 block font-body text-micro text-accent">Minimal 3 karakter.</span>}
          </label>
          <label className="block">
            <Eyebrow as="span" className="mb-1.5 block">Program studi</Eyebrow>
            <select defaultValue="informatika" className="w-full rounded-card border border-line bg-bg px-3 py-2.5 font-body text-body text-ink outline-none">
              <option value="informatika">S1 Teknik Informatika</option>
              <option value="sistem-informasi">S1 Sistem Informasi</option>
              <option value="dkv">S1 Desain Komunikasi Visual</option>
            </select>
          </label>
          <label className="block">
            <Eyebrow as="span" className="mb-1.5 block">Angkatan</Eyebrow>
            <select defaultValue="2023" className="w-full rounded-card border border-line bg-bg px-3 py-2.5 font-body text-body text-ink outline-none">
              <option>2025</option><option>2024</option><option>2023</option><option>2022</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <Eyebrow as="span" className="mb-1.5 block">Tentang kamu</Eyebrow>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} maxLength={180} className="w-full resize-none rounded-card border border-line bg-bg px-3 py-2.5 font-body text-body leading-body text-ink outline-none" />
            <span className="mt-1 block text-right font-body text-micro text-ink3">{bio.length}/180</span>
          </label>
          <div>
            <Eyebrow as="div" className="mb-2">Keahlian</Eyebrow>
            <PillMultiSelect selected={skills} options={SKILLS} onChange={setSkills} placeholder="Cari keahlian" ariaLabel="keahlian" />
          </div>
          <div>
            <Eyebrow as="div" className="mb-2">Minat</Eyebrow>
            <PillMultiSelect selected={interests} options={INTERESTS} onChange={setInterests} placeholder="Cari minat" ariaLabel="minat" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="m-0 font-body text-caption leading-body text-ink3">Kamu bisa mengubah semua informasi ini dari Profil Saya.</p>
          <button
            type="button"
            disabled={invalid || state === "busy"}
            className="cursor-pointer rounded-card border-none bg-ink px-[22px] py-3 font-body text-ui font-semibold tracking-heading text-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "busy" ? "Menyimpan profil…" : "Simpan & masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
