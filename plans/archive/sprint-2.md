# Sprint 2 — Karya core *(the spine — biggest sprint)*

*Part of the [Roadmap](../roadmap.md). Requirements: [requirements.md](../reference/requirements.md) · Vision: [vision.md](../vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

Goal: a karya exists, can be created, joined, and viewed as a living page.

- [x] **FR-10** Create a karya via the agent: `title, description, status, interest tags`. Creatable at any maturity (before anything is built).
- [x] **FR-10a** Lifecycle `stages[]` — multi-select `idea / validating / building / shipped / paused`, owner-set, default `[idea]`. Signal, not a gate.
- [x] **FR-11** Karya page: description, status, tags, anchors, **contributor roster as faces (profile pics)**, post stream placeholder.
- [x] **FR-12** Request to join → owner approves/declines (`karya_members` with `status: member/pending`).

New tables: `karya`, `karya_members`, `karya_interests`.

**Exit:** a member creates a karya from chat, others see it with contributor faces and can request to join.

> **Decisions resolved** (2026-06-21):
> - **(A) "status" in FR-10/FR-11 *is* `stages[]`.** The PRD's `Karya` data-model row (PRD §10) carries no scalar status — only `stages[]` (multi-select) + `open_to_contributors`. So there is no separate `status` column; the FR-10/11 word "status" denotes the lifecycle stages. `open_to_contributors` (FR-34) is P1 — **out of scope** this sprint.
> - **(B) Stages are an array column, not a join.** `stages[]` is a *fixed* 5-value enum (`idea/validating/building/shipped/paused`), multi-select, owner-set — not a growing shared vocabulary. So store it the way `profiles.skills` is stored: `jsonb().$type<KaryaStage[]>()`, default `["idea"]`. A pure `normalizeStages()` validator (testable, no DB) guards writes. *Contrast with interests, which were normalized into a catalog precisely because they're a shared, deduped, browsable vocabulary (Sprint 1 DECISION-A).*
> - **(C) Karya interests reuse the Sprint-1 catalog.** `karya_interests` mirrors `user_interests`: a join into the *same* `interests` table, reconciled on save via the *same* `slugifyInterest`/`dedupeBySlug` + find-or-create (Sprint 1 explicitly forward-looked to this — "keep the helper and catalog table karya-agnostic"). Free-text karya tags become `curated:false` rows, same as profile interests. No second vocabulary.
> - **(D) Two entry surfaces into one editable karya draft, both separate from onboarding.** The load-bearing piece is an **editable draft review** (`title`/`description`/`stages`/`interests`) that publishes via `POST /api/karya` — the *same* screen and the *same* request regardless of how the draft was seeded. Two ways in: (1) a **direct form** — the member fills the draft fields themselves; (2) an **optional AI pre-fill** — a chat that interviews them and extracts the same draft, reusing the onboarding scaffolding (`useStream`, `callClaude`/`cleanJSON`). The agent only *populates* the form; it never posts directly. Both satisfy FR-10 under AI-2 ("AI output is always an editable draft"), and the direct form also serves the member who'd rather not chat. Kept **separate from the onboarding agent** because onboarding is a one-time, profile-gated intake (`/onboarding`, only reachable with no profile) while karya creation recurs post-onboarding from `/home` — folding them would entangle two lifecycles and re-gate a recurring action behind a one-time one. *(The single `POST /api/karya` CRUD endpoint is the convergence point — adding the direct surface is frontend-only; the API layer is unchanged.)*
> - **(E) Faces are deterministic monograms this sprint.** No real profile pictures exist: `users.image` is nullable and never populated, and the `Member` wire type has no avatar field. Photo upload is not in P0. So the "contributor roster as faces" (FR-11) renders as a new `Avatar` atom — initials + a name-derived color — falling back from `image` when null. The wire carries an optional `image` so a future upload feature lights up the same component with zero page changes.
> - **(F) Post stream is an empty-state placeholder.** Posts are [Sprint 3](sprint-3.md) (FR-18/19, `posts` table). The karya page renders the post-stream *section* with an empty state ("belum ada update") only — no `posts` table, no compose box.
> - **(G) Creator is `owner` + `member` in one row.** On create, insert one `karya_members` row with `role:"owner", status:"member"` (not two rows, not a separate `created_by`-only path). `karya.createdBy` still records ownership denormalized for cheap "is this mine" checks and FK integrity; the roster query drives the faces.

## Data model

```
karya
  id          text pk            -- crypto.randomUUID()
  title       text not null
  description text not null
  stages      jsonb not null default ["idea"]   -- KaryaStage[] (DECISION-B)
  created_by  text -> users.id  on delete cascade
  created_at  timestamp not null default now()
  updated_at  timestamp not null default now()  -- $onUpdate, mirrors profiles
  index on (created_by)
  index on (created_at)          -- reverse-chron list (FR-22 forward-look)

karya_members
  karya_id  text -> karya.id  on delete cascade
  user_id   text -> users.id  on delete cascade
  role      text not null default "member"   -- "owner" | "member"
  status    text not null default "pending"  -- "member" | "pending"  (FR-12)
  created_at timestamp not null default now()
  primary key (karya_id, user_id)
  index on (user_id)             -- "my karya" reverse lookup

karya_interests
  karya_id    text -> karya.id      on delete cascade
  interest_id text -> interests.id  on delete cascade
  primary key (karya_id, interest_id)
  index on (interest_id)         -- reverse lookup: karya tagged with an interest
```

`role`/`status` are kept as plain `text` (not a pg enum) to match the repo's existing string-literal style (`skills`, `stages`) and keep migrations cheap at community scale (NFR-6). `KaryaStage` / `KaryaRole` / `KaryaMemberStatus` are TS string-literal unions, validated by pure helpers, not DB-level enums.

## Tasks

### Schema + migration

- [x] **S2.1 — Schema definitions.** Add `karya`, `karyaMembers`, `karyaInterests` to `libs/db/src/schema/app.ts` (mirror the existing `pgTable`/`index`/`primaryKey`/`relations` style; `stages` as `jsonb("stages").$type<KaryaStage[]>().notNull().default(["idea"])` like `profiles.skills`; `updatedAt` with the `$onUpdate(() => new Date())` pattern from `profiles`). Relations: `karya` ↔ `karyaMembers` (one-to-many), `karya` ↔ `karyaInterests` (one-to-many), `karyaMembers`/`karyaInterests` → `users`/`karya`/`interests`. Extend `interestsRelations` with `karyaInterests: many(...)`. Re-export is automatic via `schema/index.ts`.
- [x] **S2.2 — Stage helpers.** New `libs/db/src/karya.ts`: `KARYA_STAGES` (ordered const tuple), `KaryaStage` type, and `normalizeStages(input: unknown): KaryaStage[]` — keep only valid stage strings, dedupe, preserve `KARYA_STAGES` order, and **default to `["idea"]` when empty** (DECISION-B). Pure, import-light, exported from `@myapp/db` (mirror `interests.ts`). *Slug normalization is reused from `interests.ts` — do not duplicate it.*
- [x] **S2.3 — Migration.** `pnpm db:generate`. One migration creating `karya` + `karya_members` + `karya_interests` (no drops). Verify the SQL + `meta/_journal.json` + snapshot land under `libs/db/migrations/`. Like 0002–0004, generated **not applied** to a live DB — note it in the sprint close.

### Seed (content density — PRD Phase 0)

- [x] **S2.4 — Karya seeder.** New `seed/seeders/karya.ts` (`name: "karya"`, `tables: [karya, karyaMembers, karyaInterests]`), registered in `seed/index.ts` **after `memberSeeder`** (FK: rosters + interests reference seeded users/interests). Seed 2–3 example karya owned by existing seed members, each with: a couple `stages`, 2–3 interest tags (resolved find-or-create by slug, reusing the catalog like the member seeder does), an owner row, ≥1 `status:"member"` contributor (so faces render), and ≥1 `status:"pending"` request (so the approve/decline UI has something to show). Idempotent (`onConflictDoNothing`), `--reset`-safe.

### API

- [x] **S2.5 — Generalize interest reconcile + add karya read join.** In `apps/api/src/lib/interests.ts`, extract the find-or-create core (dedupe → `insert…onConflictDoNothing(slug)` → select ids by slug → `Map<slug,id>`) shared by `reconcileUserInterests`; add `reconcileKaryaInterests(tx, karyaId, names)` over `karya_interests` (full-replace, same as the user path). Add `interestsByKaryaIds(db, karyaIds): Map<karyaId, string[]>` mirroring `interestsByUserIds` (batched, sorted display names — no N+1). *Keep the helper karya-agnostic per Sprint 1's note.*
- [x] **S2.6 — Create karya (`POST /api/karya`).** New `apps/api/src/routes/karya.ts`. Authenticated; body `{ title, description, stages?: string[], interests?: string[] }`. In a `db.transaction`: (1) insert `karya` (`id: crypto.randomUUID()`, `createdBy: session.user.id`, `stages: normalizeStages(body.stages)`); (2) insert the creator's `karya_members` row (`role:"owner", status:"member"` — DECISION-G); (3) `reconcileKaryaInterests`. Return `{ id }` so the client can redirect to the new page.
- [x] **S2.7 — List karya (`GET /api/karya`).** Reverse-chron by `created_at` (FR-22 forward-look). Each item: `{ id, title, description, stages, interests: string[], roster: RosterMember[] (status:"member" only, owner first), memberCount }`. Batch interests via `interestsByKaryaIds` and rosters via one grouped `karya_members ⋈ users ⋈ profiles` query keyed by the listed karya ids — **don't N+1**.
- [x] **S2.8 — Karya detail (`GET /api/karya/:id`).** `{ id, title, description, stages, interests: string[], createdBy, roster: RosterMember[] (members), viewerMembership: {role, status} | null, pendingRequests: RosterMember[] }`. `RosterMember = { id, name, handle, image }` (DECISION-E — `image` nullable, drives the monogram fallback). `pendingRequests` is **only populated when the viewer is the owner** (`[]` otherwise) — don't leak the pending list to non-owners. `viewerMembership` lets the client pick the CTA (join / pending / owner / member). 404 if the karya is missing.
- [x] **S2.9 — Request to join (`POST /api/karya/:id/join`).** Insert `karya_members` `{ role:"member", status:"pending" }` for the session user, `onConflictDoNothing` on the `(karya_id, user_id)` PK (idempotent; re-requesting or already-member is a no-op). Reject the owner/existing member gracefully (return current membership). 404 if karya missing.
- [x] **S2.10 — Approve / decline (`POST /api/karya/:id/members/:userId/approve` · `…/decline`).** **Owner-only** (verify the session user owns the karya — 403 otherwise). Approve → set that member's `status:"member"`. Decline → delete the pending row. Operate only on `status:"pending"` rows.
- [x] **S2.11 — Mount + contract + codegen.** `app.route("/api/karya", karyaRouter)` in `apps/api/src/app.ts`. Add `Karya`, `KaryaInput`, `KaryaListItem`, `KaryaDetail`, `RosterMember`, `KaryaStage` schemas + the five paths to `libs/api-spec/openapi.yaml`; `pnpm codegen` to regenerate the client/hooks (`useListKarya`/`useGetKarya`/`createKarya`/`joinKarya`/…). Confirm the gating middleware in `app.ts` already covers `/api/karya/*` (it gates all non-auth `/api/*` for unverified users — no change needed, just verify).

### Frontend (FR-10/10a/11/12)

- [x] **S2.12 — Avatar atom (faces).** Add `Avatar` to `components/ui-atoms.tsx`: renders `image` when present, else a deterministic monogram (initials from `name`, background color hashed from `name`/`handle`) — DECISION-E. Add a `.roster` / `.avatar` style pair to `apps/app/src/index.css` (reuse the existing chip/member-row visual language). Used by the karya page roster and list cards.
- [x] **S2.13 — Karya draft form + review + publish (`/karya/new`).** The **direct (non-AI) input surface**, and the publish path both entries share (DECISION-D). A form over the draft fields — `EditField` for title/description, a new **stage multi-select**, the existing `InterestsEditor` for tags — with a "Publish karya" action calling `createKarya` → redirect to `/karya/:id`. This screen is the single source of the `POST /api/karya` request regardless of how the draft was seeded, so a member can create a karya here **without ever touching the agent**. Persist the in-progress draft to `sessionStorage` (reuse the `onboarding-ctx` pattern, or a parallel `karya-draft` ctx) so a reload doesn't lose edits (NFR-7).
- [x] **S2.13a — Optional AI pre-fill (the create-karya agent).** An *alternate entry* that **pre-populates the S2.13 draft** rather than replacing it. A chat mirroring `Onboarding.tsx` — new system prompt in the established Indonesian voice (lowercase, santai, one question per message; see `SYS_ONBOARD`) that interviews about title / what it is / stage(s) / interest tags — extracting a JSON draft `{ title, description, stages, interests }` via `callClaude`/`cleanJSON` and handing it to the S2.13 review form for editing before publish. The agent **never calls `POST /api/karya` directly** (AI-2). Reachable from `/karya/new` (e.g. an "isi pakai AI" affordance) and/or a sub-route that lands back on the same editable draft.
- [x] **S2.14 — Karya page (`/karya/:id`).** New `pages/Karya.tsx` via `useGetKarya`. Renders: title, description, `stages` as chips, interest tags as chips, the **contributor roster as `Avatar` faces** (FR-11), and a **post-stream placeholder** section (DECISION-F). CTA driven by `viewerMembership`: none → "Minta gabung" (`joinKarya`); pending → disabled "Menunggu persetujuan"; member/owner → none. **Owner** additionally sees `pendingRequests` with approve/decline buttons wired to S2.10. Back-nav + not-found states like `MemberProfile.tsx`.
- [x] **S2.15 — Home wiring + routes.** Register `/karya/new` and `/karya/:id` in `App.tsx` (logged-in + has-profile gate, matching the `/member/:id` pattern). On `CommunityHome`, add a "Karya" section listing `useListKarya` cards (title, stages, roster faces) linking to `/karya/:id`, plus a "+ buat karya" entry → `/karya/new` (the draft form, with the AI pre-fill offered there). Keep the existing members section.

### Tests + docs

- [x] **S2.16 — Unit tests for stage normalization.** vitest over `normalizeStages` in `libs/db/src/karya.test.ts` (mirror `interests.test.ts`): invalid strings dropped; dupes collapsed; output ordered by `KARYA_STAGES`; empty/garbage input → `["idea"]`. *Pure-function coverage; DB writes covered by the e2e (NFR-6 — no Postgres-backed API harness this sprint).*
- [x] **S2.17 — Acceptance e2e.** New `apps/app/e2e/karya.spec.ts` (mirror `interests.spec.ts` mocking style): mock `/api/interests`, `/api/ai/*`, `/api/karya*`. (1) Via the **direct form** at `/karya/new` (no AI), fill title/description, pick stages, add interest tags → publish → assert the `POST /api/karya` payload carries `title`/`description`/`stages`/`interests`. (1a) Drive the **AI pre-fill** path and assert the extracted draft lands in the same editable form before publish. (2) Render the karya page from a mocked `GET /api/karya/:id` with a roster → assert contributor faces render and a non-member sees "Minta gabung". (3) As owner, assert a `pendingRequests` entry shows approve/decline.
- [x] **S2.18 — README.** Per repo convention ([feedback-readme-updates]), update `README.md` where it documents the data model / seeders / API surface — the new `karya`/`karya_members`/`karya_interests` tables, the karya seeder, the `/api/karya` endpoints, and the `/karya/new` + `/karya/:id` routes.

## Exit

A member opens `/karya/new` and fills the karya draft directly — or optionally lets the AI pre-fill it from a chat — then edits the draft (title, description, stages, interest tags drawn from the shared catalog) and publishes, landing on a live karya page showing description, stage chips, interest tags, and the contributor roster as faces, with a post-stream placeholder. Another member viewing it sees "Minta gabung" and can request to join (`status:"pending"`); the owner sees the pending request and can approve (→ `member`, face appears in the roster) or decline. Karya are listed reverse-chron on `/home`. `stages` defaults to `["idea"]` and is owner-editable; karya interest tags reconcile to the same catalog as profile interests. Unit tests cover stage normalization; an e2e covers create → publish → join → approve. Migration generated (not yet applied), seeders idempotent and `--reset`-safe, README touched.

**New tables:** `karya`, `karya_members`, `karya_interests`.

## Risks / notes

- **Reused interest vocabulary (Sprint 1 forward-look).** `karya_interests` and `reconcileKaryaInterests` reuse the `interests` catalog + `slugifyInterest` (DECISION-C). Keep the extracted find-or-create core karya-agnostic so a third tagger (problems, FR-16) can reuse it later.
- **No real profile pics (DECISION-E).** Faces are monograms; the wire carries a nullable `image` so a later upload feature is drop-in. Don't build photo upload here.
- **Posts are Sprint 3 (DECISION-F).** The post-stream section is an empty-state placeholder only — no `posts` table, no compose. Resist scope-creeping posts in.
- **Owner-only authorization.** Approve/decline (S2.10) and the `pendingRequests` field (S2.8) must verify ownership server-side, not trust the client. The single-owner model (one `role:"owner"` row) is the only authority this sprint; co-owners/transfers are out of scope.
- **`GET /api/karya` roster cost.** Batch + group in memory like `GET /members` (Sprint 1); fine at community scale (NFR-6). Revisit only if listings grow large.
- **Stage as array vs. enum.** Stored as `jsonb` string array, validated by `normalizeStages`, not a DB-level pg enum — matches `skills`/repo style and keeps adding/reordering stages a code change, not a migration. Accepted trade-off for small scale.

## Sprint close (2026-06-21)

All tasks S2.1–S2.18 complete. Verification gate green:
- **Unit tests:** `pnpm test:db` — 13 passed (6 `karya.test.ts` stage-normalization + 7 `interests.test.ts`).
- **e2e:** `karya.spec.ts` (4), `interests.spec.ts`, `onboarding.spec.ts` — 6 passed.
- **Typecheck:** db / api / app all clean (`tsc --noEmit`).
- **Lint:** `biome check` clean on all Sprint-2 files.

Notes / carried forward:
- **Migration generated** (`0005_jittery_jane_foster.sql` — creates `karya` + `karya_members` + `karya_interests`, no drops) for the production deploy migrate step (`node dist/scripts/migrate.js`, per README §Database). **Schema also applied to the local dev DB via `pnpm db:push`** (additive only — the dev DB was already in sync through sprints 0/1), and verified: all three tables present with `stages` defaulting to `["idea"]`, composite `karya_members` PK, and the expected indexes/cascade FKs. (Deviates from the S2.3 "generated not applied" note, which only covered the production DB; dev was pushed on request.)
- **Pre-existing failing e2e:** `auth.spec.ts` and `routes.spec.ts` are stale Comfort-Stack template tests (assert a "My App"/"Items" home + `/api/items`) that Sprint 0 already obsoleted by replacing the home route with `CommunityHome`. They fail independent of Sprint 2 — left for a template-cleanup pass, not a Sprint-2 regression.
- **Faces are monograms** (DECISION-E) — wire carries nullable `image`; real photo upload is out of P0.
- **Post stream** is an empty-state placeholder only — posts land in Sprint 3.
