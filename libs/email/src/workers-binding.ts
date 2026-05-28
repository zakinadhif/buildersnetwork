import type { EmailProvider, SendEmailOptions } from "./index";

// Minimal type for the CF Workers send_email binding.
// Matches the shape exposed by [[send_email]] in wrangler.toml.
export interface WorkersEmailBinding {
  send(message: SendEmailOptions): Promise<{ messageId: string }>;
}

export function createWorkersEmail(binding: WorkersEmailBinding): EmailProvider {
  return {
    async send(options: SendEmailOptions): Promise<void> {
      await binding.send(options);
    },
  };
}
