import { describe, expect, it } from "vitest";
import { karyaDetailState, orderedScreenshots } from "./karya-detail";

describe("karya detail mapping", () => {
  it("distinguishes loading, 404, generic error, and ready", () => {
    expect(
      karyaDetailState({ loading: true, failed: false, hasData: false }),
    ).toBe("loading");
    expect(
      karyaDetailState({
        loading: false,
        failed: true,
        errorStatus: 404,
        hasData: false,
      }),
    ).toBe("not-found");
    expect(
      karyaDetailState({ loading: false, failed: true, hasData: false }),
    ).toBe("error");
    expect(
      karyaDetailState({ loading: false, failed: false, hasData: true }),
    ).toBe("ready");
  });

  it("orders landscape before portrait and respects position", () => {
    const shots = orderedScreenshots([
      { id: "p", url: "/p", orientation: "portrait", position: 0 },
      { id: "l2", url: "/l2", orientation: "landscape", position: 2 },
      { id: "l1", url: "/l1", orientation: "landscape", position: 1 },
    ]);
    expect(shots.map((shot) => shot.id)).toEqual(["l1", "l2", "p"]);
  });
});
