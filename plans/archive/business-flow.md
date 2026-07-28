# Business Flow: Al-Fath Berkarya (Builder Network)

> **Obsolete — archived, not maintained.** This describes the original matches-and-onboarding app (`/matches`, `/review`, a 5-member seed directory, AI-suggested matches at publish time) — the product *before* the karya became the spine. The karya model, the explicit "looking for…" intent model, and the current surfaces all supersede it; the AI-`matches` feature it documents is itself flagged **Divergent** in the [roadmap](../roadmap.md). Kept for the auth/OTP flow and the API-surface snapshot. **Trust the code over anything here.**

An AI-powered community platform for builder students at Telkom University. Students discover collaborators through conversational onboarding and AI-driven matching — no forms, just a chat that builds your profile.

Access is exclusive to Telkom University students (`@student.telkomuniversity.ac.id`).

---

## Summary Flow

```
Sign up with university email
  → Verify email with a 6-digit OTP
  → Chat with AI to build your profile
  → Review and edit your profile
  → Publish → AI instantly finds your 3 best matches
  → Explore the community and discover more people
```

---

## Entities

| Entity | Key Fields |
|---|---|
| **User** | id, name, email (must be @student.telkomuniversity.ac.id), emailVerified |
| **Profile** | userId, name, year, major, skills[], building, wants, vibe |
| **Match** | id, userId, matchedUserId, reason (AI-generated, in Indonesian) |
| **VerificationToken** | identifier (email), value (6-digit OTP), expiresAt (10 min TTL) |

---

## User Journey

### 1. Sign-Up & Email Verification

```
/welcome
  → Sign up with email + password
  → Backend validates @student.telkomuniversity.ac.id domain
  → Redirect to /verify-email
  → Backend sends 6-digit OTP via email (10 min TTL)
  → User enters OTP → emailVerified = true
  → All non-auth routes are gated until verified
```

### 2. AI-Powered Onboarding

```
/onboarding
  → AI asks 8–10 conversational questions (casual Indonesian, one per turn):
      - Name
      - Year & major
      - Technical skills (probing: "what have you built?")
      - Current project (what are you building?)
      - What they want to learn or build next
      - Collaboration style (vibe)
  → On completion signal, AI extracts structured profile JSON
  → Redirect to /review
```

### 3. Profile Review & Publishing

```
/review
  → User sees extracted profile with editable fields:
      name, year·major, skills (chip editor), building, wants, vibe
  → User edits anything inline
  → Click "Publish profil →"
  → Backend: upsert profile (POST /api/profile)
  → AI picks 3 best-matched members from full directory with reasoning
  → Backend: save matches (POST /api/matches)
  → Redirect to /matches
```

### 4. AI-Generated Matches

```
/matches
  → Display 3 AI-suggested collaborators with:
      - Name, year, major
      - Why they match (2–3 sentences, Indonesian)
      - "Lihat profil →" link
  → Each card links to /member/:id
```

### 5. Community Discovery

```
/home
  → Chat prompt: "hei {name} — lagi nyari siapa?"
  → User asks in natural language:
      e.g. "siapa yang jago backend?" / "ada yang kerja di ML?"
  → AI searches full member directory and suggests up to 3 relevant members
  → Full member directory listed below, each card links to /member/:id
```

### 6. Member Profile

```
/member/:id
  → Full profile card:
      name, year, major, skills, building, wants, vibe
  → "← balik" to return to previous page
```

---

## API Surface

### Auth (Better Auth)
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/sign-up/email | Register (email domain enforced) |
| POST | /api/auth/sign-in/email | Login |

### OTP
| Method | Route | Description |
|---|---|---|
| POST | /api/otp/send | Send 6-digit OTP to email |
| POST | /api/otp/verify | Verify OTP, set emailVerified |

### Profiles & Members
| Method | Route | Description |
|---|---|---|
| GET | /api/me | Current user's profile (or null) |
| POST | /api/profile | Create / update profile (upsert) |
| GET | /api/members | All member profiles |
| GET | /api/members/:id | Single member profile |

### Matches
| Method | Route | Description |
|---|---|---|
| GET | /api/matches | User's saved AI matches |
| POST | /api/matches | Save match results |

### AI
| Method | Route | Description |
|---|---|---|
| POST | /api/ai/stream | Streaming completion (onboarding chat) |
| POST | /api/ai/complete | One-shot completion (profile extraction, matching, discovery) |

---

## Frontend Routes

| Route | Purpose | Gate |
|---|---|---|
| `/welcome` | Sign-up / sign-in | Public |
| `/login` | Email+password sign-in | Public |
| `/verify-email` | OTP verification | Auth only |
| `/onboarding` | AI chat intake | Verified, no profile |
| `/review` | Profile editing & publish | Verified, has draft |
| `/matches` | View AI-generated matches | Verified, has profile |
| `/home` | Community directory + AI search | Verified, has profile |
| `/member/:id` | Individual member profile | Verified, has profile |

---

## AI Usage Map

| Step | Model Call | Input | Output |
|---|---|---|---|
| Onboarding chat | Streaming | Conversation history + system prompt | Next question (text) |
| Profile extraction | Complete | Full conversation transcript | Structured profile JSON |
| Match generation | Complete | New profile + full member directory | 3 matches with reasons |
| Community discovery | Complete | User query + full member directory | Up to 3 relevant members |

---

## Key Business Rules

- **Email gate**: Only `@student.telkomuniversity.ac.id` addresses can register.
- **Verification gate**: All app routes (except `/welcome`, `/login`, `/verify-email`) require `emailVerified = true`.
- **Conversational intake**: No sign-up form — profile is built through AI conversation.
- **AI matching at publish time**: Matches are generated once when the user publishes their profile, stored, and displayed on `/matches`.
- **Match count**: Each user gets exactly 3 AI-suggested matches.
- **Seed community**: Platform ships with 5 diverse seed members so new users have a community to browse on day one.

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | Hono v4 (Node.js 24) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better Auth (Drizzle adapter) |
| AI | Pluggable — Anthropic API or Cloudflare Workers AI |
| Frontend | React 19 + Vite + TailwindCSS v4 |
| Routing | Wouter |
| Data fetching | TanStack Query v5 + generated hooks (Orval) |
| Monorepo | pnpm workspaces |
