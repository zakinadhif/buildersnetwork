import { describe, expect, it } from "vitest";
import { KARYA_STAGES, normalizeStages } from "./karya";

describe("normalizeStages", () => {
  it("keeps valid stage strings", () => {
    expect(normalizeStages(["idea", "building"])).toEqual(["idea", "building"]);
  });

  it("drops invalid / non-string entries", () => {
    expect(normalizeStages(["building", "nonsense", 42, null])).toEqual([
      "building",
    ]);
  });

  it("collapses duplicates", () => {
    expect(normalizeStages(["building", "building", "idea"])).toEqual([
      "idea",
      "building",
    ]);
  });

  it("orders output by KARYA_STAGES regardless of input order", () => {
    expect(
      normalizeStages(["paused", "idea", "shipped", "validating"]),
    ).toEqual(["idea", "validating", "shipped", "paused"]);
  });

  it("defaults to ['idea'] for empty / garbage input", () => {
    expect(normalizeStages([])).toEqual(["idea"]);
    expect(normalizeStages(["nope", "nada"])).toEqual(["idea"]);
    expect(normalizeStages(null)).toEqual(["idea"]);
    expect(normalizeStages("idea")).toEqual(["idea"]);
    expect(normalizeStages(undefined)).toEqual(["idea"]);
  });

  it("accepts every canonical stage", () => {
    expect(normalizeStages([...KARYA_STAGES])).toEqual([...KARYA_STAGES]);
  });
});
