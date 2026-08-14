import type { FeedItem, KaryaListItem } from "@myapp/api-client-react";
import { describe, expect, it } from "vitest";
import {
  memberProfileState,
  memberProjects,
  memberUpdates,
} from "./member-profile";

describe("member profile mapping", () => {
  it("distinguishes loading, 404, error, and ready", () => {
    expect(
      memberProfileState({ loading: true, failed: false, hasData: false }),
    ).toBe("loading");
    expect(
      memberProfileState({
        loading: false,
        failed: true,
        errorStatus: 404,
        hasData: false,
      }),
    ).toBe("not-found");
    expect(
      memberProfileState({ loading: false, failed: true, hasData: false }),
    ).toBe("error");
    expect(
      memberProfileState({ loading: false, failed: false, hasData: true }),
    ).toBe("ready");
  });

  it("keeps only projects and posts belonging to the member", () => {
    const project = {
      id: "k1",
      title: "Loom",
      description: "sync",
      stages: ["building"],
      interests: [],
      coverUrl: null,
      screenshots: [],
      roster: [{ id: "m1", name: "Dinda", handle: "dinda", image: null }],
      memberCount: 1,
    } satisfies KaryaListItem;
    expect(memberProjects([project], "m1")).toHaveLength(1);
    expect(memberProjects([project], "m2")).toHaveLength(0);

    const post = {
      type: "post",
      id: "p1",
      karyaId: "k1",
      body: "ship",
      createdAt: new Date().toISOString(),
      author: { id: "m1", name: "Dinda", handle: "dinda", image: null },
      commentCount: 0,
      latestComment: null,
      karya: { id: "k1", title: "Loom" },
    } satisfies FeedItem;
    expect(memberUpdates([post], "m1")).toHaveLength(1);
    expect(memberUpdates([post], "m2")).toHaveLength(0);
  });
});
