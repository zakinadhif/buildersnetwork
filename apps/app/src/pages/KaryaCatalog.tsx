import { type KaryaListItem, useListKarya } from "@myapp/api-client-react";
import { Button, Eyebrow, Input, KaryaCard } from "@myapp/ui";
import { useMemo } from "react";
import { useLocation } from "wouter";
import { STAGE_LABELS } from "@/components/ui-metadata";

const ALL_INTERESTS = "Semua";

function matchesCatalogQuery(karya: KaryaListItem, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase("id");
  if (!normalized) return true;
  return [karya.title, karya.description, ...karya.interests].some((value) =>
    value.toLocaleLowerCase("id").includes(normalized),
  );
}

export function KaryaCatalogRail({
  query,
  onQueryChange,
  interests,
  selectedInterest,
  onInterestChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  interests: string[];
  selectedInterest: string;
  onInterestChange: (interest: string) => void;
}) {
  const [, navigate] = useLocation();

  return (
    <>
      <section>
        <Eyebrow className="mb-2">Cari karya</Eyebrow>
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Nama, deskripsi, minat…"
          aria-label="Cari karya"
          className="w-full"
        />
      </section>

      <section>
        <Eyebrow className="mb-2.5">Filter minat</Eyebrow>
        <div className="flex flex-col gap-0.5">
          {[ALL_INTERESTS, ...interests].map((interest) => {
            const active = interest === selectedInterest;
            return (
              <button
                key={interest}
                type="button"
                aria-pressed={active}
                className={`w-full cursor-pointer rounded-card border-none px-2 py-1 text-left font-body text-ui ${
                  active
                    ? "bg-accent-tint font-medium text-accent"
                    : "bg-transparent font-normal text-ink2 hover:bg-bg-hover"
                }`}
                onClick={() => onInterestChange(interest)}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-panel bg-accent p-4">
        <p className="mb-3 text-body leading-compact text-accent-fg">
          Punya karya baru? Tambahkan ke katalog dan bagikan progresnya ke
          komunitas.
        </p>
        <Button
          type="button"
          className="w-full bg-accent-fg text-accent hover:bg-accent-fg/90"
          onClick={() => navigate("/karya/new")}
        >
          Bikin karya
        </Button>
      </section>
    </>
  );
}

export default function KaryaCatalog({
  query,
  selectedInterest,
}: {
  query: string;
  selectedInterest: string;
}) {
  const [, navigate] = useLocation();
  const { data: karya = [], isLoading, isError, refetch } = useListKarya();

  const filtered = useMemo(
    () =>
      karya.filter(
        (item) =>
          (selectedInterest === ALL_INTERESTS ||
            item.interests.includes(selectedInterest)) &&
          matchesCatalogQuery(item, query),
      ),
    [karya, query, selectedInterest],
  );

  return (
    <>
      <header className="mb-[18px]">
        <div className="flex items-baseline gap-2.5">
          <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">
            Karya
          </h1>
          <span className="font-body text-caption text-ink3">
            Katalog karya komunitas
          </span>
        </div>
      </header>

      {isLoading ? (
        <div
          className="flex min-h-48 items-center justify-center rounded-panel border border-line bg-surface"
          role="status"
        >
          <span className="font-mono text-ui text-ink3">
            Memuat katalog karya…
          </span>
        </div>
      ) : isError ? (
        <div
          className="rounded-panel border border-line bg-surface px-6 py-8 text-center"
          role="alert"
        >
          <h2 className="font-display text-title font-normal text-ink">
            Katalog belum bisa dimuat
          </h2>
          <p className="mt-2 text-body leading-body text-ink2">
            Ada gangguan saat mengambil karya. Coba muat ulang katalog.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
          >
            Coba lagi
          </Button>
        </div>
      ) : karya.length === 0 ? (
        <div className="rounded-panel border border-dashed border-line-dark px-6 py-10 text-center">
          <h2 className="font-display text-title font-normal text-ink">
            Belum ada karya di katalog
          </h2>
          <p className="mt-2 text-body leading-body text-ink2">
            Jadilah yang pertama membagikan karya ke komunitas.
          </p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => navigate("/karya/new")}
          >
            Bikin karya
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-body text-ink2">
            Tidak ada karya yang cocok dengan pencarian atau minat ini.
          </p>
          <p className="mt-1 text-ui text-ink3">
            Coba kata kunci atau filter lain.
          </p>
        </div>
      ) : (
        <section aria-labelledby="catalog-heading">
          <div className="flex items-baseline justify-between border-b border-line pb-2.5">
            <Eyebrow id="catalog-heading">Semua karya</Eyebrow>
            <span className="font-body text-micro tabular-nums text-ink3">
              {filtered.length} karya
            </span>
          </div>
          <div className="karya-catalog flex flex-col">
            {filtered.map((item) => (
              <KaryaCard
                key={item.id}
                cover={item.coverUrl}
                title={item.title}
                description={item.description}
                stages={item.stages.map((stage) => ({
                  label: STAGE_LABELS[stage],
                }))}
                interests={item.interests}
                roster={item.roster.map((member) => ({
                  key: member.id,
                  name: member.name,
                  image: member.image,
                }))}
                memberCount={item.memberCount}
                screenshots={item.screenshots
                  .filter((shot) => shot.orientation === "landscape")
                  .map((shot, index) => ({
                    key: shot.id,
                    src: shot.url,
                    alt: `${item.title} — layar ${index + 1}`,
                  }))}
                onOpen={() => navigate(`/karya/${item.id}`)}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-panel border-[1.5px] border-dashed border-line-dark px-5 py-4">
            <div>
              <p className="font-body text-body font-medium text-ink">
                Punya karya baru?
              </p>
              <p className="mt-0.5 font-body text-ui text-ink2">
                Tambahkan ke katalog dan mulai bagikan progresmu.
              </p>
            </div>
            <Button
              type="button"
              className="shrink-0"
              onClick={() => navigate("/karya/new")}
            >
              Bikin karya
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
