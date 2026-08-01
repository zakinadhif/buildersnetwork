/**
 * Al-Fath Berkarya — Bikin Karya  ·  issue #104
 *
 * The hero's primary CTA target (`/karya/new`). Now inside the
 * shared shell — same left rail as the surfaces it's launched from — so creating
 * a karya keeps the product frame. The form remains direct while the canonical
 * agent surface and its ramps stay shelved until P1.
 */

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainColumn, RailColumn, cn, Input, Textarea, Button, Toggle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@myapp/ui";
import { Shell } from "../components/Shell";
import { Eyebrow } from "@myapp/ui";
import { PreviewStates } from "../components/PreviewStates";
import { PillMultiSelect } from "../components/PillMultiSelect";

const TIPS = [
  "Cover & tangkapan layar bikin karyamu lebih hidup di feed.",
  "Pilih tahap yang jujur — orang paham kamu lagi di mana.",
  "Media itu opsional — karya tetap bisa terbit saat upload gagal.",
];

const STAGES = ["Ide", "Prototype", "MVP", "Beta", "Rilis"];
const SUGGESTED = ["Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"];
type PublishState = "ready" | "upload-error" | "publishing";

const draftSchema = z.object({
  title: z.string().min(1, "Judul karya tidak boleh kosong."),
  description: z.string().min(1, "Deskripsi karya tidak boleh kosong."),
  stages: z.array(z.string()).min(1, "Pilih minimal satu tahap."),
  tags: z.array(z.string()).min(1, "Pilih minimal satu minat/tag."),
});
type DraftValues = z.infer<typeof draftSchema>;

// ─── Small field wrapper ─────────────────────────────────────────────────────
function Labelled({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-[22px]">
      <div className="mb-2 flex items-baseline gap-2.5">
        <Eyebrow as="span">{label}</Eyebrow>
        {hint && <span className="font-body text-micro text-ink3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <Toggle
      pressed={on}
      onPressedChange={onClick}
      className={cn(
        "rounded-full border px-[13px] py-1.5 font-body text-ui h-auto",
        on
          ? "data-[state=on]:border-accent data-[state=on]:bg-accent-tint data-[state=on]:text-accent font-medium hover:bg-accent-tint hover:text-accent"
          : "border-line bg-transparent text-ink2 font-normal hover:bg-transparent hover:text-ink"
      )}
    >
      {label}
    </Toggle>
  );
}

// ─── Manual form ─────────────────────────────────────────────────────────────
function ManualForm({ publishState }: { publishState: PublishState }) {
  const form = useForm<DraftValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: {
      title: "Peta Kost",
      description: "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
      stages: ["Prototype"],
      tags: ["Web", "Komunitas"],
    },
  });

  function onSubmit(values: DraftValues) {
    console.log("draft", values);
  }

  const toggle = (arr: string[], v: string, onChange: (x: string[]) => void) =>
    onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {publishState === "upload-error" && (
          <div role="alert" className="mb-5 rounded-card border border-accent-line bg-accent-tint px-3.5 py-3 font-body text-ui leading-body text-accent">
            Cover belum terunggah. Kamu bisa coba lagi atau tetap terbitkan karya tanpa media.
          </div>
        )}
        {publishState === "publishing" && (
          <div role="status" className="mb-5 rounded-card border border-line bg-surface px-3.5 py-3 font-body text-ui leading-body text-ink2">
            Menyimpan data dan menyiapkan halaman karyamu…
          </div>
        )}
        <Labelled label="Cover" hint="opsional">
          <div className="flex h-[120px] cursor-pointer items-center justify-center gap-2 rounded-panel border-[1.5px] border-dashed border-line-dark bg-surface font-body text-ui text-ink3">
            <span aria-hidden="true" className="text-[18px]">⬆</span> Seret gambar atau pilih file
          </div>
        </Labelled>

        <Labelled label="Tangkapan layar" hint="landscape muncul di feed · potret di galeri detail">
          <div className="flex gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-[68px] w-[92px] rounded-[10px] border border-line bg-surface" />
            ))}
            <button type="button" className="h-[68px] w-[92px] cursor-pointer rounded-[10px] border-[1.5px] border-dashed border-line-dark bg-transparent font-body text-micro text-ink3">
              + tambah
            </button>
          </div>
        </Labelled>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="mb-[22px]">
              <div className="mb-2 flex items-baseline gap-2.5">
                <FormLabel asChild><Eyebrow as="span">Judul</Eyebrow></FormLabel>
              </div>
              <FormControl>
                <Input placeholder="Nama karya kamu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mb-[22px]">
              <div className="mb-2 flex items-baseline gap-2.5">
                <FormLabel asChild><Eyebrow as="span">Deskripsi</Eyebrow></FormLabel>
              </div>
              <FormControl>
                <Textarea
                  rows={3}
                  className="resize-y leading-body"
                  placeholder="Ceritain karyanya dalam satu-dua kalimat."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stages"
          render={({ field }) => (
            <FormItem className="mb-[22px]">
              <div className="mb-2 flex items-baseline gap-2.5">
                <FormLabel asChild><Eyebrow as="span">Tahap</Eyebrow></FormLabel>
                <span className="font-body text-micro text-ink3">boleh lebih dari satu</span>
              </div>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <Chip key={s} label={s} on={field.value.includes(s)} onClick={() => toggle(field.value, s, field.onChange)} />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="mb-[22px]">
              <div className="mb-2 flex items-baseline gap-2.5">
                <FormLabel asChild><Eyebrow as="span">Minat / tag</Eyebrow></FormLabel>
              </div>
              <FormControl>
                <PillMultiSelect
                  selected={field.value}
                  options={SUGGESTED}
                  onChange={field.onChange}
                  placeholder="Cari atau tambahkan minat"
                  ariaLabel="minat atau tag karya"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-2 flex justify-end border-t border-line pt-[22px]">
          <Button
            type="submit"
            disabled={publishState === "publishing"}
            className="bg-ink text-bg hover:bg-ink/90 font-semibold tracking-heading px-[22px]"
            size="lg"
          >
            {publishState === "publishing" ? "Menerbitkan…" : "Terbitkan karya"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function KaryaNewScreen() {
  const [publishState, setPublishState] = useState<PublishState>("ready");

  return (
    <Shell active="karya-new">
      {/* Form column */}
      <MainColumn>
        <h1 className="mb-[26px] mt-0 font-display text-display font-normal tracking-heading leading-heading text-ink">
          Bikin karya baru.
        </h1>

        <ManualForm publishState={publishState} />
      </MainColumn>

      {/* Tips rail */}
      <RailColumn>
        <PreviewStates
          label="State terbit"
          value={publishState}
          onChange={setPublishState}
          options={[
            { value: "ready", label: "Siap" },
            { value: "upload-error", label: "Upload gagal" },
            { value: "publishing", label: "Menerbitkan" },
          ]}
          className="mb-5"
        />
        <Eyebrow className="mb-3">Biar makin dilirik</Eyebrow>
        <div className="flex flex-col gap-3.5">
          {TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-[9px]">
              <span aria-hidden="true" className="leading-body text-accent">◆</span>
              <p className="m-0 font-body text-ui leading-body text-ink2">{tip}</p>
            </div>
          ))}
        </div>
      </RailColumn>
    </Shell>
  );
}
