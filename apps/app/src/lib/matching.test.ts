import type { Member } from "@myapp/api-client-react";
import { describe, expect, it } from "vitest";
import { groundMatches } from "./matching";

const member = (id: string, name: string): Member => ({
  id,
  name,
  handle: name.toLowerCase(),
  bio: null,
  interests: [],
  year: "Tingkat 2",
  major: "Informatika",
  skills: [],
});

const members = [member("seed_m1", "Hafiz"), member("seed_m2", "Fatimah")];

describe("groundMatches", () => {
  it("keeps matches whose memberId resolves to a real member", () => {
    const result = groundMatches(
      [
        { memberId: "seed_m1", reason: "cocok di systems" },
        { memberId: "seed_m2", reason: "sama-sama ML" },
      ],
      members,
    );
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.id)).toEqual(["seed_m1", "seed_m2"]);
    expect(result[0]).toMatchObject({
      name: "Hafiz",
      reason: "cocok di systems",
    });
  });

  it("drops hallucinated memberIds not present in the directory", () => {
    const result = groundMatches(
      [
        { memberId: "seed_m1", reason: "real one" },
        { memberId: "seed_ghost", reason: "ngarang" },
      ],
      members,
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("seed_m1");
  });

  it("returns an empty array when every memberId is hallucinated", () => {
    const result = groundMatches([{ memberId: "nope", reason: "x" }], members);
    expect(result).toEqual([]);
  });
});
