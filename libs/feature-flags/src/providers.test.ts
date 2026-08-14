import { readFile } from "node:fs/promises";
import type { Db } from "@myapp/db";
import { createDatabaseFeatureFlagProvider } from "@myapp/feature-flags/database";
import { describe, expect, it } from "vitest";
import {
  createEnvFeatureFlagProvider,
  createFixedFeatureFlagProvider,
  defaultFeatureSnapshot,
} from "./index";

describe("feature flag providers", () => {
  it("uses safe code defaults when no environment override is present", async () => {
    const provider = createEnvFeatureFlagProvider({});

    expect(await provider.snapshot()).toEqual(defaultFeatureSnapshot());
    expect(await provider.isEnabled("aiAssistant")).toBe(false);
  });

  it("applies explicit environment and test overrides", async () => {
    const provider = createFixedFeatureFlagProvider({ aiAssistant: true });

    expect(await provider.isEnabled("aiAssistant")).toBe(true);
    expect(await provider.snapshot()).toEqual({ aiAssistant: true });
  });

  it("returns snapshot copies that callers cannot mutate", async () => {
    const provider = createEnvFeatureFlagProvider({ aiAssistant: true });
    const first = await provider.snapshot();
    first.aiAssistant = false;

    expect(await provider.snapshot()).toEqual({ aiAssistant: true });
  });

  it("merges database rows over defaults and ignores stale keys", async () => {
    const rows = [
      { key: "aiAssistant", enabled: true },
      { key: "removedFlag", enabled: true },
    ];
    const builder = {
      from: () => builder,
      where: () => builder,
      limit: () => builder,
      // biome-ignore lint/suspicious/noThenProperty: intentional Drizzle test double
      then: <T>(resolve: (value: typeof rows) => T) =>
        Promise.resolve(rows).then(resolve),
    };
    const db = { select: () => builder } as unknown as Db;
    const provider = createDatabaseFeatureFlagProvider(db);

    expect(await provider.snapshot()).toEqual({ aiAssistant: true });
    expect(await provider.isEnabled("aiAssistant")).toBe(true);
  });

  it("keeps every preview flag explicit in the tracked Wrangler template", async () => {
    const template = await readFile(
      new URL("../../../wrangler.preview.template.toml", import.meta.url),
      "utf8",
    );

    expect(template).toContain('FEATURE_FLAG_PROVIDER = "env"');
    expect(template).toContain('FEATURE_AI_ASSISTANT = "true"');
  });
});
