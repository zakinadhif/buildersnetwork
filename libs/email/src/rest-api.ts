import type { EmailAddress, EmailProvider, SendEmailOptions } from "./index";

export interface RestEmailConfig {
  accountId: string;
  apiToken: string;
}

// REST API uses snake_case for reply_to; normalize from our camelCase interface.
function toRestBody(options: SendEmailOptions) {
  const { replyTo, ...rest } = options;
  return {
    ...rest,
    from:
      typeof options.from === "string"
        ? options.from
        : { address: (options.from as EmailAddress).email, name: (options.from as EmailAddress).name },
    ...(replyTo !== undefined && {
      reply_to: typeof replyTo === "string" ? replyTo : (replyTo as EmailAddress).email,
    }),
  };
}

export function createRestEmail(config: RestEmailConfig): EmailProvider {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/email/sending/send`;

  return {
    async send(options: SendEmailOptions): Promise<void> {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toRestBody(options)),
      });

      const data = (await res.json()) as {
        success: boolean;
        errors?: Array<{ code: number; message: string }>;
      };

      if (!data.success) {
        const msg = data.errors?.[0]?.message ?? "email send failed";
        throw new Error(`[cloudflare-email] ${msg}`);
      }
    },
  };
}
