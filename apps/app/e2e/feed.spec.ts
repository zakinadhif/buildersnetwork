import type { Page } from "@playwright/test";
import { authed, expect } from "./fixtures";

// Acceptance for Sprint 3 (S3.17): a karya member composes a post → it lands in
// the stream and the POST payload carries kind/body; a non-member sees the
// stream but no compose box; the homepage renders curated "Top picked" + a feed
// mixing a post and a new-karya item that link out; the admin feature toggle
// shows only for admins and fires POST .../feature. Mirrors karya.spec mocking.

const PROFILE = {
  id: "test-user-id",
  name: "Test User",
  handle: "test",
  bio: null,
  interests: [],
  year: "Tingkat 2",
  major: "Informatika",
  skills: [],
};

async function mockMe(page: Page) {
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PROFILE),
    }),
  );
}

// A karya detail with sensible defaults; override per test.
function karyaDetail(over: Record<string, unknown> = {}) {
  return {
    id: "km",
    title: "Loom",
    description: "peer-to-peer file sync",
    stages: ["building"],
    interests: [],
    createdBy: "owner-id",
    roster: [
      { id: "test-user-id", name: "Test User", handle: "test", image: null },
    ],
    viewerMembership: { role: "member", status: "member" },
    pendingRequests: [],
    featured: false,
    viewerIsAdmin: false,
    ...over,
  };
}

function post(over: Record<string, unknown> = {}) {
  return {
    id: "p1",
    karyaId: "km",
    kind: "progress",
    body: "node sinkron stabil semalaman",
    createdAt: new Date().toISOString(),
    author: {
      id: "test-user-id",
      name: "Test User",
      handle: "test",
      image: null,
    },
    ...over,
  };
}

authed(
  "karya member: compose box shows; posting sends kind/body and renders it",
  async ({ page }) => {
    await mockMe(page);

    await page.route("**/api/karya/km", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(karyaDetail()),
      }),
    );

    // Stateful stream: empty until the POST appends a post.
    const stream: Record<string, unknown>[] = [];
    let savedPost: Record<string, unknown> | null = null;
    await page.route("**/api/karya/km/posts", async (route) => {
      if (route.request().method() === "POST") {
        savedPost = route.request().postDataJSON();
        const created = post({
          id: "p-new",
          kind: (savedPost as { kind: string }).kind,
          body: (savedPost as { body: string }).body,
        });
        stream.unshift(created);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(created),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(stream),
        });
      }
    });

    await page.goto("/karya/km");

    // Member sees the compose box.
    const composer = page.locator(".composer");
    await expect(composer).toBeVisible();

    // Default kind is "progres"; type a body and post.
    await composer
      .locator(".composer-input")
      .fill("node sinkron stabil semalaman");
    await composer.getByRole("button", { name: "Posting" }).click();

    // The new post renders in the stream.
    await expect(
      page.locator(".post-card", { hasText: "node sinkron stabil semalaman" }),
    ).toBeVisible();

    // The POST payload carried kind + body.
    expect(savedPost).not.toBeNull();
    const p = savedPost as Record<string, unknown>;
    expect(p.kind).toBe("progress");
    expect(p.body).toBe("node sinkron stabil semalaman");
  },
);

authed("non-member: sees the stream but no compose box", async ({ page }) => {
  await mockMe(page);

  await page.route("**/api/karya/km", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(karyaDetail({ viewerMembership: null })),
    }),
  );
  await page.route("**/api/karya/km/posts", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([post({ body: "update dari owner" })]),
    }),
  );

  await page.goto("/karya/km");

  // The read-only stream renders…
  await expect(
    page.locator(".post-card", { hasText: "update dari owner" }),
  ).toBeVisible();
  // …but there's no compose box.
  await expect(page.locator(".composer")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Posting" })).toHaveCount(0);
});

authed(
  "homepage: renders Top picked + a feed mixing a post and a new karya, linking out",
  async ({ page }) => {
    await mockMe(page);

    await page.route("**/api/featured", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "kf",
            title: "Rasa",
            description: "rekomendasi kuliner lokal",
            stages: ["validating"],
            interests: [],
            roster: [],
            memberCount: 0,
          },
        ]),
      }),
    );

    // A feed with both item types, already reverse-chron (post newest).
    await page.route("**/api/feed", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            type: "post",
            id: "fp1",
            karyaId: "kf",
            kind: "achievement",
            body: "rekomendasi pertama tembus",
            createdAt: new Date().toISOString(),
            author: {
              id: "m2",
              name: "Fatimah Zahra",
              handle: "fatimah",
              image: null,
            },
            karya: { id: "kf", title: "Rasa" },
          },
          {
            type: "karya",
            id: "kn",
            title: "Saku",
            description: "keuangan pribadi buat mahasiswa",
            stages: ["idea"],
            interests: [],
            roster: [],
            memberCount: 0,
            createdAt: new Date(Date.now() - 86_400_000).toISOString(),
          },
        ]),
      }),
    );

    await page.goto("/home");

    // Top picked (featured) renders.
    await expect(page.getByText("Pilihan inspiratif")).toBeVisible();
    await expect(
      page.locator(".featured .karya-card", { hasText: "Rasa" }),
    ).toBeVisible();

    // Feed: the post item renders (author + body + kind).
    const postCard = page.locator(".post-card", {
      hasText: "rekomendasi pertama tembus",
    });
    await expect(postCard).toBeVisible();
    await expect(postCard.getByText("Fatimah Zahra")).toBeVisible();
    await expect(postCard.getByText("capaian")).toBeVisible();

    // Feed: the new-karya item renders with its tag.
    const karyaItem = page.locator(".feed .karya-card", { hasText: "Saku" });
    await expect(karyaItem).toBeVisible();
    await expect(karyaItem.getByText("karya baru")).toBeVisible();

    // The post's parent-karya title links out to the karya page.
    await page.route("**/api/karya/kf", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(karyaDetail({ id: "kf", title: "Rasa" })),
      }),
    );
    await page.route("**/api/karya/kf/posts", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await postCard.locator(".post-karya-link").click();
    await expect(page).toHaveURL(/\/karya\/kf/);
  },
);

authed(
  "admin: feature toggle shows and fires POST .../feature",
  async ({ page }) => {
    await mockMe(page);

    await page.route("**/api/karya/km", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          karyaDetail({ viewerIsAdmin: true, featured: false }),
        ),
      }),
    );
    await page.route("**/api/karya/km/posts", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );

    let featured = false;
    await page.route("**/api/karya/km/feature", async (route) => {
      if (route.request().method() === "POST") featured = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/karya/km");

    const toggle = page.getByRole("button", { name: /Tandai unggulan/ });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect.poll(() => featured).toBe(true);
  },
);

authed("non-admin: feature toggle is absent", async ({ page }) => {
  await mockMe(page);

  await page.route("**/api/karya/km", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(karyaDetail({ viewerIsAdmin: false })),
    }),
  );
  await page.route("**/api/karya/km/posts", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );

  await page.goto("/karya/km");

  await expect(page.getByText("Loom")).toBeVisible();
  await expect(page.getByRole("button", { name: /unggulan/ })).toHaveCount(0);
});
