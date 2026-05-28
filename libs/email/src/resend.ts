import type { Attachment, EmailAddress, EmailProvider, SendEmailOptions } from "./index";

export interface ResendConfig {
  apiKey: string;
  /** Default sender address, e.g. "Al-Fath Berkarya <noreply@resend.dev>" */
  defaultFrom?: string;
}

// Resend expects "Name <email>" or plain "email" strings for addresses.
function formatAddress(addr: string | EmailAddress): string {
  if (typeof addr === "string") return addr;
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
}

function normalizeToArray(val: string | string[] | undefined): string[] | undefined {
  if (val === undefined) return undefined;
  return Array.isArray(val) ? val : [val];
}

// Resend attachments use `filename` + `content` (base64 string or Buffer-like).
function normalizeAttachments(
  attachments: Attachment[] | undefined,
): Array<{ filename: string; content: string | ArrayBuffer; content_type?: string }> | undefined {
  if (!attachments) return undefined;
  return attachments.map(({ filename, content, type }) => ({
    filename,
    content,
    ...(type && { content_type: type }),
  }));
}

export function createResendEmail(config: ResendConfig): EmailProvider {
  return {
    async send(options: SendEmailOptions): Promise<void> {
      const body: Record<string, unknown> = {
        from: formatAddress(options.from),
        to: normalizeToArray(
          Array.isArray(options.to) ? options.to : options.to,
        ),
        subject: options.subject,
        ...(options.html !== undefined && { html: options.html }),
        ...(options.text !== undefined && { text: options.text }),
        ...(options.cc !== undefined && { cc: normalizeToArray(options.cc) }),
        ...(options.bcc !== undefined && { bcc: normalizeToArray(options.bcc) }),
        ...(options.replyTo !== undefined && { reply_to: formatAddress(options.replyTo) }),
        ...(options.headers !== undefined && { headers: options.headers }),
        ...(options.attachments !== undefined && {
          attachments: normalizeAttachments(options.attachments),
        }),
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string;
          name?: string;
        };
        throw new Error(`[resend] ${err.name ?? res.status}: ${err.message ?? res.statusText}`);
      }
    },
  };
}
