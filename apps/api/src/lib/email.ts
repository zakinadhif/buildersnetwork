// Email provider selection for the Workers entrypoint (issue #42), mirroring
// the chain in src/index.ts: an explicit Resend key wins, then the Cloudflare
// Email Service binding, then nothing.
//
// The final fallback is what lets a Worker run with delivery disabled: preview
// environments omit both RESEND_API_KEY and the [[send_email]] binding, so the
// binding's absence *is* the flag — no runtime feature-flag mechanism required.
// Without it, createWorkersEmail(undefined) builds a provider that throws on the
// first send() rather than at boot, so the Worker looks healthy and then
// POST /otp/send answers 500. See plans/how-to/preview-environments.md.
//
// Lives here rather than in worker.ts because tsconfig excludes that file from
// the type-check program (it needs Cloudflare globals), which also puts it out
// of reach of the test suite.

import {
  createNoopEmail,
  createResendEmail,
  createWorkersEmail,
  type EmailProvider,
  type WorkersEmailBinding,
} from "@myapp/email";

/** The slice of the Worker `Env` that decides how mail is sent. */
export interface EmailEnv {
  RESEND_API_KEY?: string;
  EMAIL?: WorkersEmailBinding;
}

export function selectEmail(env: EmailEnv): EmailProvider {
  if (env.RESEND_API_KEY) {
    return createResendEmail({ apiKey: env.RESEND_API_KEY });
  }
  return env.EMAIL ? createWorkersEmail(env.EMAIL) : createNoopEmail();
}
