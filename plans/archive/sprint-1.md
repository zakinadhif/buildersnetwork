# Sprint 1 — Interests anchor + profile completion

*Part of the [Roadmap](../roadmap.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

Goal: the interest vocabulary that everything else tags against. Turn the throwaway `profiles.interests` jsonb (added in Sprint 0a) into a real, browsable, shared anchor — a curated catalog plus a `user_interests` join — so people (this sprint) and karya ([Sprint 2](sprint-2.md)) tag against the *same* vocabulary instead of fragmenting.

- [x] **FR-14** Interest/theme tags — `interests` table + `user_interests` join; attachable, browsable.
- [x] **FR-15** Curated starter interest list (seed data) + free-text additions. Mitigates tag fragmentation (Risk §15).
- [x] **FR-3/FR-4** Finish profile: interests shown + editable on profile and Review, AI-synthesized and field-level editable, drawn from the curated list.

> **Decisions resolved** (2026-06-21):
> - **(A) Normalize.** Go to the PRD data-model: an `interests` catalog table + a `user_interests` join. Migrate the existing jsonb values into rows and **drop `profiles.interests`**. Chosen over a catalog-only/keep-jsonb hybrid because the PRD models `Interest` / `UserInterest` / `KaryaInterest` as first-class join entities, and [Sprint 2](sprint-2.md) introduces a parallel `karya_interests` join — both anchors must share one vocabulary table.
> - **(B) Reconcile on save.** The onboarding AI keeps emitting free-text `interests: string[]`. The **save path** is what reconciles each name to the catalog (find-or-create by slug). Keeps extraction natural/grounded and centralizes dedupe server-side. *Not* constraining the AI to pick from the list (rejected: prompt bloat + risk the model drops genuine interests to force a match).
> - **(C) Contract unchanged on reads.** The wire shape stays `interests: string[]` everywhere it already is (`Member`, `ProfileInput`). The join is resolved to display-name strings in the serializers. This keeps the migration's frontend blast radius near-zero — `MemberProfile`, `Matches`, `CommunityHome` keep rendering `member.interests` untouched. The **only** new wire surface is a read-only catalog endpoint.
> - **(D) Slug is the dedupe key.** `"Machine Learning"`, `"machine learning"`, and `" machine  learning "` collapse to one catalog row via a normalized `slug` (unique). This *is* the FR-15 fragmentation mitigation.
> - **(E) Single cutover, no expand-contract.** `profiles.interests` was added last sprint and holds **no production data** (migrations 0002/0003 are generated, not yet applied — see [Sprint 0](sprint-0.md)). So one migration can add the new tables and drop the column. No two-phase dance needed this time.

> **Executed** (2026-06-21): S1.1–S1.12 landed. Schema normalized — `interests` (id/name/slug-unique/curated) + `user_interests` join added, `profiles.interests` jsonb dropped — via migration `0004_cheerful_zaladane.sql` (generated, **not yet applied** to a live DB, like 0002/0003). Pure `slugifyInterest`/`dedupeBySlug` helpers in `libs/db/src/interests.ts`; vitest wired into `@myapp/db` (`pnpm test:db`, 7 passing). Curated starter seeder (28 interests) registered before the member seeder; member seeder rewritten to find-or-create + link. Save path reconciles in a transaction (`apps/api/src/lib/interests.ts`); reads serialize `interests: string[]` via batched joins (no N+1). `GET /api/interests` mounted + in OpenAPI; codegen regenerated (`useListInterests`/`Interest`). `InterestsEditor` (catalog suggestions + free-text) swapped into Review's Minat field. New e2e `interests.spec.ts` passes. **Deviation:** also fixed a latent Sprint-0 bug in `onboarding.spec.ts` (substring `getByText("Lagi bikin")` collided with the draft bio — now `{ exact: true }`); it was never executed in Sprint 0 (Chromium absent). Chromium is now installed; both e2e specs pass. App + API + db typecheck clean; lint clean.

## Data model

```
interests
  id         text pk            -- crypto.randomUUID()
  name       text not null      -- display form, e.g. "Machine Learning"
  slug       text not null uniq -- dedupe key, e.g. "machine-learning"
  curated    boolean not null default false   -- true = from the starter list
  created_at timestamp not null default now()

user_interests
  user_id     text  -> users.id      on delete cascade
  interest_id text  -> interests.id  on delete cascade
  primary key (user_id, interest_id)
  index on (interest_id)             -- reverse lookup: who/what tags this interest
```

`curated` distinguishes the starter vocabulary (FR-15) from free-text additions, so the editor can surface curated suggestions first and a future moderation pass can promote/merge user-created rows. `slug` normalization rule (shared helper, **DECISION-D**): lowercase → trim → collapse internal whitespace → replace non-alphanumeric runs with `-` → strip leading/trailing `-`.

## Tasks

### Schema + migration

- [x] **S1.1 — Schema definitions.** Add `interests` and `userInterests` tables to `libs/db/src/schema/app.ts` (mirror the existing `pgTable`/`index`/`relations` style). Add relations: `interests` ↔ `userInterests` (one-to-many) and `userInterests` → `users` + `interests`. Re-export flows automatically via `schema/index.ts`. Drop the `interests` jsonb column from `profiles`.
- [x] **S1.2 — Slug helper.** Add `slugifyInterest(name: string): string` (DECISION-D rule) plus `dedupeBySlug(names: string[]): {name, slug}[]` as **pure, import-light** functions in `libs/db/src/interests.ts`, exported from `@myapp/db`. Both the API save path (S1.5) and the seeder (S1.4) import these so normalization is defined once. *Pure so they're unit-testable without a DB (S1.10), matching the `matching.ts` pattern.*
- [x] **S1.3 — Migration.** `pnpm db:generate`. One migration that **creates** `interests` + `user_interests` and **drops** `profiles.interests` (DECISION-E). Verify the generated SQL + `meta/_journal.json` + snapshot land under `libs/db/migrations/`. (Like 0002/0003, generated not applied — note it in the sprint close.)

### Seed (FR-15)

- [x] **S1.4 — Curated starter list seeder.** New seeder `libs/db/src/seed/seeders/interests.ts` (`name: "interests"`, `tables: [interests]`), registered in `seed/index.ts` **before `memberSeeder`** (FK order: members now link to interest rows). Insert the curated set below with `curated: true`, `slug` via `slugifyInterest`, `onConflictDoNothing` on `slug` (idempotent + `--reset`-safe). Campus-wide / all-faculties per Sprint 0 DECISION-B — spans building disciplines, not just CS:

  > **Tech & engineering:** Web Development · Mobile Development · Backend Development · Systems Programming · Distributed Systems · DevOps & Cloud · Machine Learning · Data Science · Cybersecurity · Game Development · Embedded & IoT
  > **Design & product:** UI/UX Design · Product Design · Graphic Design · Product Management
  > **Words & knowledge:** Technical Writing · Content Writing · Research
  > **Build & ship:** Open Source · Building in Public · Entrepreneurship · Startups
  > **People & domains:** Community Building · Education · Social Impact · Fintech · Health Tech · Creative Tech
  >
  > *(Provisional vocabulary, like Sprint 0 copy — refine in a later content pass; the schema + dedupe are what's load-bearing.)*

- [x] **S1.5 — Rewrite the member seeder.** `seed/seeders/members.ts` currently inserts `interests` as a jsonb array on each profile. Drop that column from `SEED_PROFILES`; after inserting profiles, resolve each member's interest names → catalog rows (find-or-create by slug, reusing curated rows where the name matches) and insert `user_interests` links. Add `userInterests` (and `interests`, if it also creates) to the seeder's `tables` so `--reset` truncates correctly.

### API

- [x] **S1.6 — Save path reconcile (POST /profile).** In `apps/api/src/routes/profile.ts`, wrap the profile write in a `db.transaction`. Body still carries `interests?: string[]`. Steps: (1) upsert profile (minus `interests`); (2) `dedupeBySlug` the names; (3) `insert(interests).onConflictDoNothing({target: slug})` then `select` ids by those slugs — free-text names become `curated:false` rows; (4) `delete user_interests where userId` then re-insert the resolved links. *Full replace, not merge — matches how the Review screen sends the complete set.*
- [x] **S1.7 — Read serializers join interests.** `GET /me` (`profile.ts`), `GET /members` + `GET /members/:id` (`members.ts`), and `GET /matches` (`profile.ts`) currently read `profile.interests` off the row. Repoint each to join `user_interests → interests` and emit `interests: string[]` of **display names** (DECISION-C — shape unchanged). For `GET /members` (all profiles) batch-fetch links for the listed userIds and group in memory; don't N+1. Sort names for stable output.
- [x] **S1.8 — Catalog endpoint (FR-14 browsable).** New `GET /api/interests` → `[{id, name, slug, curated}]`, curated-first then alphabetical. Mount in `apps/api/src/app.ts` (`app.route("/api/interests", interestsRouter)`). Read-only this sprint (creation happens implicitly via S1.6). Add the `Interest` schema + path to `libs/api-spec/openapi.yaml`; `pnpm codegen` to regenerate the client/hooks.

### Frontend (FR-3/FR-4)

- [x] **S1.9 — Interests editor drawing from the catalog.** Review (`apps/app/src/pages/Review.tsx`) currently edits interests with the plain `SkillsEditor` (free-text only). Add an `InterestsEditor` (in `components/ui-atoms.tsx`, reusing the chip styling) that: fetches the catalog via the generated `useListInterests` hook, shows curated suggestions as tappable chips / typeahead, and still accepts free-text on Enter (FR-15). Swap it in for the `Minat` field on Review. The `membersCtx`/match prompt already reads `m.interests` as strings — no change. `MemberProfile`, `Matches`, `CommunityHome` render `member.interests` strings — **no change** (DECISION-C). *Frontend `Member` type in `members.ts` keeps `interests: string[]` — only the editor and the new hook are new.*

### Tests + docs

- [x] **S1.10 — Unit tests for normalization.** vitest over `slugifyInterest` / `dedupeBySlug` (new `libs/db/src/interests.test.ts`, or colocate in `apps/app` if that's where vitest is wired — mirror `matching.test.ts`): case/whitespace/punctuation collapse to one slug; `"Machine Learning"` + `"machine learning"` dedupe; empties dropped. *Pure-function coverage; DB writes are covered by the e2e, avoiding a Postgres-backed API harness this sprint (NFR-6).*
- [x] **S1.11 — Acceptance e2e.** Extend `apps/app/e2e/` (new spec or fold into `onboarding.spec.ts`): mock `GET /api/interests` with a few curated rows; onboard → on Review, add one interest from a curated suggestion **and** one free-text → publish → assert the `POST /api/profile` payload contains both names → reload persists. Assert the editor renders curated suggestions.
- [x] **S1.12 — README.** Per repo convention ([feedback-readme-updates]), touch `README.md` if it documents the data model, seeders, or API surface — note the new `interests`/`user_interests` tables, the `interests` seeder, and `GET /api/interests`.

## Exit

A member has a profile whose interests are drawn from a curated, shared catalog: editable field-level on Review, rendered on their profile, persisted as `user_interests` rows. Free-text additions are accepted and deduped by slug. `profiles.interests` jsonb is gone; reads still serialize `interests: string[]`. `GET /api/interests` lists the browsable vocabulary. Unit tests cover slug dedupe; an e2e covers curated + free-text → publish → reload. Migration generated (not yet applied), seeders idempotent and `--reset`-safe, README touched.

**New tables:** `interests`, `user_interests`. **Dropped:** `profiles.interests` (jsonb).

## Risks / notes

- **Tag fragmentation (PRD §15).** Slug dedupe (DECISION-D) is the primary guard; curated-first suggestions in the editor (S1.9) are the secondary nudge. No admin merge/moderation UI this sprint — user-created rows accumulate as `curated:false` and can be promoted/merged later.
- **`GET /members` join cost.** Batch + group in memory (S1.7); fine at community scale (NFR-6). Revisit only if the directory grows large.
- **Shared vocabulary forward-looks to Sprint 2.** `karya_interests` will reuse this `interests` table and `slugifyInterest`. Keep the helper and catalog table karya-agnostic.
- **`handle` still unique-but-nullable** (carried over from Sprint 0a S0a.6); a NOT NULL tightening remains out of scope here.
