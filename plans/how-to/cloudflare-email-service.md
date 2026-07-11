# Cloudflare Email Service

Beta transactional email service built into Cloudflare Workers. No third-party SDK needed.

> **Heads up:** the provider chain prefers [Resend](https://resend.com)
> (`RESEND_API_KEY`) first, then this `[[send_email]]` binding, then a no-op
> provider when neither is configured (see `selectEmail` in
> `apps/api/src/lib/email.ts`). **On the current account this binding is dormant:**
> it needs the Workers Paid plan and Al-Fath is on the free tier, so live email
> actually goes through Resend. This doc covers the Cloudflare-native path for when
> the account moves to Paid; for the Resend path see `libs/email/src/resend.ts` and
> `DEPLOY_CLOUDFLARE.md`.

## Two integration methods

### 1. Workers Binding (Cloudflare-native; requires Workers Paid)

Configure in `wrangler.toml`:

```toml
[[send_email]]
name = "EMAIL"

# Optional: lock to specific sender addresses
[[send_email]]
name = "RESTRICTED_EMAIL"
allowed_sender_addresses = ["noreply@yourdomain.com"]
```

Access in the Worker via `env.EMAIL.send(...)`:

```ts
interface Env {
  EMAIL: SendEmail;
}

await env.EMAIL.send({
  to: "user@example.com",
  from: "noreply@yourdomain.com",
  subject: "Welcome",
  html: "<h1>Welcome!</h1>",
  text: "Welcome!",
});
```

**Response:** `{ messageId: string }`

### 2. REST API (works anywhere, including Node.js local dev)

```
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/email/sending/send
Authorization: Bearer <API_TOKEN>
Content-Type: application/json
```

Request body:

```json
{
  "to": "user@example.com",
  "from": { "address": "noreply@yourdomain.com", "name": "Al-Fath Berkarya" },
  "subject": "Welcome",
  "html": "<h1>Welcome!</h1>",
  "text": "Welcome!",
  "cc": ["manager@example.com"],
  "bcc": ["archive@example.com"],
  "reply_to": "support@yourdomain.com",
  "headers": { "List-Unsubscribe": "<https://yourdomain.com/unsubscribe>" },
  "attachments": [
    {
      "content": "<base64>",
      "filename": "invoice.pdf",
      "type": "application/pdf",
      "disposition": "attachment"
    }
  ]
}
```

**Success response (HTTP 200):**

```json
{
  "success": true,
  "result": {
    "delivered": ["user@example.com"],
    "permanent_bounces": [],
    "queued": []
  }
}
```

**Error response:**

```json
{
  "success": false,
  "errors": [{ "code": 10203, "message": "sending_disabled" }]
}
```

## Full `SendEmailOptions` shape (Workers binding)

| Field | Type | Required |
|---|---|---|
| `to` | `string \| string[]` (max 50) | Yes |
| `from` | `string \| { email: string; name: string }` | Yes |
| `subject` | `string` | Yes |
| `html` | `string` | At least one of html/text |
| `text` | `string` | At least one of html/text |
| `cc` | `string \| string[]` | No |
| `bcc` | `string \| string[]` | No |
| `replyTo` | `string \| { email: string; name: string }` | No |
| `attachments` | `Attachment[]` | No |
| `headers` | `Record<string, string>` | No |

Note: REST API uses `reply_to` (snake_case) vs binding's `replyTo` (camelCase).

## Error codes (Workers binding)

| Code | Meaning |
|---|---|
| `E_SENDER_NOT_VERIFIED` | Sender domain not verified in Email Routing |
| `E_RATE_LIMIT_EXCEEDED` | Rate limit hit |
| `E_DAILY_LIMIT_EXCEEDED` | Daily quota exhausted |
| `E_TOO_MANY_RECIPIENTS` | Over 50 recipients |
| `E_CONTENT_TOO_LARGE` | Message exceeds 5 MiB |
| `E_DELIVERY_FAILED` | SMTP delivery failure |

## Constraints

- Requires **Workers Paid plan** (beta feature)
- Max message size: **5 MiB** including attachments
- Max recipients per send: **50**
- Sender domain must be verified via Cloudflare Email Routing

## Required secrets

```bash
wrangler secret put CF_ACCOUNT_ID      # for REST API adapter (local dev)
wrangler secret put CF_EMAIL_API_TOKEN # for REST API adapter (local dev)
```

Workers binding (`[[send_email]]`) needs no secrets — it's authenticated via the Worker itself.
