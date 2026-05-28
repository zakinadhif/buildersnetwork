export interface EmailAddress {
  email: string;
  name?: string;
}

export interface Attachment {
  content: string | ArrayBuffer;
  filename: string;
  type: string;
  disposition: "attachment" | "inline";
  contentId?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | EmailAddress;
  attachments?: Attachment[];
  headers?: Record<string, string>;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<void>;
}

/** No-op provider — logs to console. Use in local dev when email is not configured. */
export function createNoopEmail(): EmailProvider {
  return {
    async send(options) {
      console.log("[email:noop] send suppressed", {
        to: options.to,
        subject: options.subject,
      });
    },
  };
}

export type { ResendConfig } from "./resend";
export { createResendEmail } from "./resend";
export { createRestEmail } from "./rest-api";
export type { WorkersEmailBinding } from "./workers-binding";
export { createWorkersEmail } from "./workers-binding";
