export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CompleteOptions {
  maxTokens?: number;
}

export interface AIProvider {
  complete(
    messages: Message[],
    opts?: CompleteOptions,
  ): Promise<{ text: string }>;
  stream(messages: Message[], opts?: CompleteOptions): AsyncGenerator<string>;
}

export { createAnthropicAI } from "./anthropic";
export type { WorkersAIBinding } from "./workers-ai";
export { createWorkersAI } from "./workers-ai";
