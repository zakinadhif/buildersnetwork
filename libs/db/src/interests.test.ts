import { describe, expect, it } from "vitest";
import { dedupeBySlug, slugifyInterest } from "./interests";

describe("slugifyInterest", () => {
  it("lowercases and hyphenates whitespace", () => {
    expect(slugifyInterest("Machine Learning")).toBe("machine-learning");
  });

  it("collapses case / surrounding / internal whitespace to one slug", () => {
    expect(slugifyInterest("machine learning")).toBe("machine-learning");
    expect(slugifyInterest("  machine  learning  ")).toBe("machine-learning");
    expect(slugifyInterest("MACHINE\tLEARNING")).toBe("machine-learning");
  });

  it("replaces punctuation runs with a single hyphen and trims edges", () => {
    expect(slugifyInterest("UI/UX Design")).toBe("ui-ux-design");
    expect(slugifyInterest("DevOps & Cloud")).toBe("devops-cloud");
    expect(slugifyInterest("!!Startups!!")).toBe("startups");
  });

  it("returns empty for slug-less input", () => {
    expect(slugifyInterest("   ")).toBe("");
    expect(slugifyInterest("!!!")).toBe("");
  });
});

describe("dedupeBySlug", () => {
  it("collapses case/whitespace variants to one entry, first name wins", () => {
    expect(
      dedupeBySlug([
        "Machine Learning",
        "machine learning",
        "  MACHINE LEARNING ",
      ]),
    ).toEqual([{ name: "Machine Learning", slug: "machine-learning" }]);
  });

  it("drops empty and slug-less entries", () => {
    expect(dedupeBySlug(["", "   ", "!!!", "Rust"])).toEqual([
      { name: "Rust", slug: "rust" },
    ]);
  });

  it("preserves input order across distinct slugs", () => {
    expect(dedupeBySlug(["Rust", "Go", "Rust", "Web Development"])).toEqual([
      { name: "Rust", slug: "rust" },
      { name: "Go", slug: "go" },
      { name: "Web Development", slug: "web-development" },
    ]);
  });
});
