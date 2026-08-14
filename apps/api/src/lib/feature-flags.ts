import type { Db } from "@myapp/db";
import {
  createEnvFeatureFlagProvider,
  type FeatureFlagProvider,
} from "@myapp/feature-flags";
import { createDatabaseFeatureFlagProvider } from "@myapp/feature-flags/database";

export type FeatureFlagProviderKind = "env" | "database";

export function parseFeatureFlagProviderKind(
  value: string | undefined,
): FeatureFlagProviderKind {
  const kind = value ?? "env";
  if (kind === "env" || kind === "database") return kind;
  throw new Error(`Unsupported feature flag provider: ${kind}`);
}

export function parseFeatureFlagBoolean(
  value: string | undefined,
  defaultValue = false,
): boolean {
  if (value === undefined || value === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function createAppFeatureFlagProvider(options: {
  kind: FeatureFlagProviderKind;
  db: Db;
  aiAssistant: boolean;
}): FeatureFlagProvider {
  if (options.kind === "database") {
    return createDatabaseFeatureFlagProvider(options.db);
  }

  return createEnvFeatureFlagProvider({
    aiAssistant: options.aiAssistant,
  });
}
