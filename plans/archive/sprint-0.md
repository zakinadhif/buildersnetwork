# Sprint 0 — Foundation *(split into 0a + 0b; close the gaps)*

*Part of the [Roadmap](../roadmap.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

Goal: bring what exists up to PRD shape before building the karya spine on top of it.

> **Decisions resolved** (2026-06-20): **(A)** `building/wants/vibe` → **dropped**; go strict PRD model. **(B)** Community scope → **campus-wide, all faculties** (vision stands; fix agent copy). **(C)** Agent copy wording is **provisional** — write it inline against the vision; finalize in a later copy pass.

> **Executed** (2026-06-20): 0a + 0b landed. Migrations `0002_regular_adam_warlock.sql` (expand + handle/bio backfill) and `0003_faithful_hannibal_king.sql` (drop `building/wants/vibe`). App + API + db typecheck clean; `apps/app` unit test (`matching.test.ts`, 3 passing) covers match grounding; acceptance e2e added at `apps/app/e2e/onboarding.spec.ts` (compiles + Vite server boots; not executed locally — Chromium binary not installed). **Deviation:** `handle` left **unique-but-nullable** (a NOT NULL tightening was not in S0b.7 scope, deferred). Migrations are generated, **not yet applied** to a live DB.

**Why two sprints.** DECISION-A is a *destructive* schema change, and the onboarding **extraction prompt** + Review **match prompt** are both built around the three fields being dropped — so a hard cutover would break the app mid-sprint and bundle mechanical plumbing with a redesign of what the agent is *for*. The right-size is **expand → contract**: **0a** adds the new fields and keeps the app working on the old columns (purely mechanical, low-risk, shippable); **0b** re-points the agent to the new model and only then drops the old columns (the judgement-heavy work, isolated). Each sprint ships green.

## Sprint 0a — Profile model *expand* + draft fixes *(mechanical, non-breaking)*

Add the PRD fields **without** removing the old ones yet. The live app keeps working throughout.

- [x] **S0a.1 — Schema decision (DECISION-A).** Resolved: target the strict PRD model; execute via expand-then-contract.
- [x] **S0a.2 — Additive migration.** Add `handle` (text, unique), `bio` (text), `interests` (jsonb `string[]` default `[]`). Backfill `handle` for existing rows *before* the unique constraint; seed `bio` from the old fields so rows aren't blank. **Relax `building/wants/vibe` to nullable/defaulted** so new inserts can omit them — but do **not** drop yet. `pnpm db:generate`.
- [x] **S0a.3 — Schema + types.** Update `profiles` def in `app.ts` (new cols added, old cols now nullable); confirm Drizzle types flow through `@myapp/db`.
- [x] **S0a.4 — Endpoints.** Extend `GET /me` + `POST /profile` (`apps/api/src/routes/profile.ts`) and members serializers (`apps/api/src/routes/members.ts`) to read/write `handle, bio, interests` (old fields still accepted).
- [x] **S0a.5 — Codegen + frontend type.** `pnpm codegen`; add the new fields to the frontend `Member` type in `apps/app/src/lib/members.ts`.
- [x] **S0a.6 — Handle policy (assumption unless told otherwise).** Auto-generate `handle` from the email local-part, user-editable on Review, uniqueness enforced server-side. *Flag if you want a different rule.*
- [x] **S0a.7 — Fix the year/major field bug** *(independent quick win)*. The "Angkatan · Jurusan" `EditField` binds `` `${p.year} · ${p.major}` `` but only calls `set("year", v)` — editing overwrites `year` and **`major` is never editable**. Split into two fields. *(Live FR-4 violation; not blocked by the migration.)*
- [x] **S0a.8 — Draft persistence (NFR-7)** *(independent quick win)*. Draft lives only in in-memory context (`onboarding-ctx.tsx`); a refresh on `/review` wipes it and bounces to `/onboarding`. Persist (e.g. `sessionStorage`) so reload preserves edits.

**Exit (0a):** new columns live and populating; app fully functional on the old onboarding flow; year/major editable; draft survives reload.

## Sprint 0b — Agent realignment + *contract* *(judgement-heavy, isolated)*

Re-point the onboarding agent from "capture building/wants/vibe" to "capture bio + interests," then remove the old columns.

- [x] **S0b.1 — Rewrite the extraction prompt.** `genProfile` (`Onboarding.tsx`) emits the 7-field JSON `{name,year,major,skills,building,wants,vibe}`. Change it to the new model `{name,handle,bio,skills,interests}` (+ year/major).
- [x] **S0b.2 — Re-point the intake questions.** In `SYS_ONBOARD`, the prompts fishing for "lagi bikin / pengen / gaya kerja" become questions that yield `bio` + `interests`. This is the substantive change in what onboarding is *for*.
- [x] **S0b.3 — Swap the Review editors.** Remove the `building/wants/vibe` editors; add `handle`, `bio`, `interests` editors. Interests editor can reuse the `SkillsEditor` pattern until the Sprint 1 anchor lands.
- [x] **S0b.4 — Re-point the match prompt.** Review's `publish()` builds `membersCtx` + the new-member block from `building/wants/vibe`; repoint at `bio` + `interests` + `skills`. *(The AI-matches feature is itself keep-or-replace in Sprint 5 — this only keeps it valid.)*
- [x] **S0b.5 — Fix community-scope copy (DECISION-B).** In `SYS_ONBOARD`, drop *"eksklusif mahasiswa teknik informatika"*, reframe campus-wide/all-faculties (any `@student.telkomuniversity.ac.id`), and soften informatics-centric "skill teknis" probing so non-technical builders fit. *Wording provisional (DECISION-C) — write it inline against the vision; finalize in a later copy pass.*
- [x] **S0b.6 — Grounding guards + tests (FR-8, AI-3).** Add a guard/test that extraction invents nothing when the user is vague ("Jujur, jangan ngarang"); add an API/unit test that the match step drops hallucinated `memberId`s (already filtered via `filter((x) => x.id != null)`) so grounding can't regress.
- [x] **S0b.7 — Contract migration.** Now that nothing references them, **drop `building`, `wants`, `vibe`**; rewrite the seeder (`libs/db/src/seed/seeders/members.ts`) to the new shape; remove dead old-field usages from the frontend `Member` type.
- [x] **S0b.8 — Acceptance e2e.** Playwright: onboard → edit every field → publish → reload → values persist; assert no `building/wants/vibe` remain in payloads. Add to `apps/app/e2e/`.

**Exit (0b):** onboarding captures the PRD model; old columns dropped; Review edits every field and survives reload; extraction + matching grounded with tests; agent copy campus-wide (wording provisional, pending a later copy pass).
