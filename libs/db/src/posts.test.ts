import { describe, expect, it } from "vitest";
import { normalizePostKind, POST_KINDS } from "./posts";

describe("normalizePostKind", () => {
  it("round-trips every valid kind", () => {
    for (const kind of POST_KINDS) {
      expect(normalizePostKind(kind)).toBe(kind);
    }
  });

  it("returns null for unknown strings", () => {
    expect(normalizePostKind("update")).toBeNull();
    expect(normalizePostKind("Progress")).toBeNull();
    expect(normalizePostKind("")).toBeNull();
  });

  it("returns null for non-strings", () => {
    expect(normalizePostKind(42)).toBeNull();
    expect(normalizePostKind(null)).toBeNull();
    expect(normalizePostKind(undefined)).toBeNull();
    expect(normalizePostKind(["progress"])).toBeNull();
    expect(normalizePostKind({ kind: "progress" })).toBeNull();
  });
});
