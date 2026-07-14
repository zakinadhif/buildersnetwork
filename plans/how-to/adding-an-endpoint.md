# Adding an endpoint

*The API contract and how to extend it. Three kinds of endpoint live in this codebase, and only one of them is generated — knowing which kind you're adding is the whole decision.*

| Kind | Contract | Client |
|---|---|---|
| **JSON / CRUD** — the default | `libs/api-spec/openapi.yaml` → codegen | generated hooks from `@myapp/api-client-react` |
| **AI streaming** — `POST /api/ai/stream` | hand-written; chunked `text/plain` | `useStream` from `@myapp/ai/react` |
| **Binary upload / serve** — karya cover + screenshots | hand-written; `multipart/form-data` or raw bytes | `apps/app/src/lib/upload.ts` |

If you're adding a normal JSON route, use the OpenAPI-first workflow below. The other two are deliberate exceptions, and the reason is the same in both cases: **the orval-generated client only speaks JSON.** It cannot consume a chunked body incrementally, and it cannot carry a file. Don't try to force either through the spec.

---

## OpenAPI-first (JSON / CRUD)

`libs/api-spec/openapi.yaml` is the single source of truth for standard JSON endpoints. Both the frontend client and the backend validators are generated from it — so the spec is not documentation *of* the API, it *is* the API.

### 1. Update the spec

Add your path and schemas to `libs/api-spec/openapi.yaml`.

### 2. Run codegen

```bash
pnpm codegen
```

Two outputs, both generated — never hand-edit them:

- **`libs/api-client-react/src/generated/`** — typed TanStack Query hooks (e.g. `useListMembers`, `listMembers`) backed by `customFetch`
- **`libs/api-zod/src/generated/`** — Zod validators for every request/response schema (e.g. `ProfileInput`)

### 3. Implement the Hono route

Parse the request with the generated Zod validator, so the route can't drift from the spec it was generated against:

```ts
import { ProfileInput } from "@myapp/api-zod";

app.post("/profile", async (c) => {
  const parsed = ProfileInput.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  // ...
});
```

Register the route in `apps/api/src/app.ts`.

### 4. Call it from the frontend

Use the generated imperative function or the generated hook:

```ts
// Imperative (in async handlers)
import { saveProfile } from "@myapp/api-client-react";
await saveProfile(profileData);

// Hook (in React components)
import { useSaveProfile } from "@myapp/api-client-react";
const { mutateAsync } = useSaveProfile();
```

---

## Streaming AI (`POST /api/ai/stream`)

The AI stream endpoint returns a **plain-text chunked body**, not JSON. It is consumed by reading `Response.body` directly, which the generated client cannot do — orval would wait for the whole body and hand you the text at the end, which is exactly the live typing effect you were trying to get.

So the frontend uses `useStream` from `@myapp/ai/react` (`libs/ai/src/react.ts`):

```ts
import { useStream } from "@myapp/ai/react";

function OnboardingChat() {
  const { streamingText, stream } = useStream();
  // streamingText is null when idle, "" at start, accumulates chunks while streaming

  async function sendMessage(messages: Message[]) {
    const fullText = await stream(messages);
    // fullText is the complete response once done
  }
}
```

> [!IMPORTANT]
> An `aiStream` function *does* exist in the generated client, because the endpoint appears in the spec. **Do not use it** — it does not consume the chunked body incrementally. `useStream` is the only correct client for this endpoint.

The sibling endpoint `POST /api/ai/complete` *is* a normal JSON endpoint (`{ text: string }`) and uses the generated `aiComplete` / `useAiComplete` like anything else.

Which AI provider serves these is decided by the **runtime entrypoint, not an env var** — `createGeminiAI` in `apps/api/src/index.ts` (Node/Docker, needs `GEMINI_API_KEY`), `createWorkersAI` in `apps/api/src/worker.ts` (Cloudflare, uses the `AI` binding, no key). All three adapters implement the one `AIProvider` interface (`complete`, `stream`, `agentComplete`) in `libs/ai`.

---

## Binary routes (upload / serve)

The karya cover routes (`POST` / `DELETE` / `GET /api/karya/:id/cover`) and the screenshot routes (`POST /api/karya/:id/screenshots`, `DELETE` / `GET /api/karya/:id/screenshots/:screenshotId`, `POST /api/karya/:id/screenshots/reorder`) carry `multipart/form-data` or raw image bytes. They are hand-written in `apps/api/src/routes/karya.ts` and called from `apps/app/src/lib/upload.ts`, outside the generated client.

Only their **read-side effect** lives in the spec: a nullable `coverUrl` and a `screenshots[]` array on `Karya`. That's the rule for any binary route — the bytes stay out of the contract, the resulting URL goes in, so the rest of the app still reads it through generated types.

Storage is pluggable (`libs/storage`): S3-compatible on the Node/Docker path, the native R2 binding `UPLOADS` on Workers. **With no storage configured these routes return 503** rather than failing at boot — object storage is optional as a group.
