import type { Page } from "@playwright/test";
import { authed, expect } from "./fixtures";

// Acceptance for Sprint 3 (S3.17): a karya member composes a post → it lands in
// the stream and the POST payload carries only body; a non-member sees the
// stream but no compose box; Scroll renders a feed mixing a post and a new-karya
// item that link out; the admin feature toggle
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
  "karya member: compose box posts body-only and renders it",
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

    // There is no type/title selector; type a body and post.
    await expect(
      composer.getByRole("button", { name: /progres|tantangan|capaian/ }),
    ).toHaveCount(0);
    await composer
      .locator(".composer-input")
      .fill("node sinkron stabil semalaman");
    await composer.getByRole("button", { name: "Posting" }).click();

    // The new post renders in the stream.
    await expect(
      page.locator(".post-card", { hasText: "node sinkron stabil semalaman" }),
    ).toBeVisible();

    // The POST payload carries body only.
    expect(savedPost).not.toBeNull();
    const p = savedPost as Record<string, unknown>;
    expect(p.body).toBe("node sinkron stabil semalaman");
    expect(p).not.toHaveProperty("kind");
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

authed("Scroll renders posts without new-karya events", async ({ page }) => {
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

  // The API can return both item types, but Scroll only shows posts.
  await page.route("**/api/feed", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          type: "post",
          id: "fp1",
          karyaId: "kf",
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

  await expect(page.getByRole("heading", { name: "Scroll" })).toBeVisible();

  // Feed: the post is led by its karya, with author as metadata.
  const postCard = page.locator(".post-card", {
    hasText: "rekomendasi pertama tembus",
  });
  await expect(postCard).toBeVisible();
  await expect(postCard.getByText("Rasa")).toBeVisible();
  await expect(postCard.getByText(/diposting Fatimah Zahra/)).toBeVisible();
  await expect(postCard.getByText(/progres|tantangan|capaian/)).toHaveCount(0);

  // New-karya events are not part of the Scroll feed.
  const karyaItem = page.locator(".feed .karya-card", { hasText: "Saku" });
  await expect(karyaItem).toHaveCount(0);

  // The whole post card opens its conversation page.
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
  await page.route("**/api/karya/kf/posts/fp1", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "fp1",
        karyaId: "kf",
        body: "rekomendasi pertama tembus",
        createdAt: new Date().toISOString(),
        author: {
          id: "m2",
          name: "Fatimah Zahra",
          handle: "fatimah",
          image: null,
        },
        commentCount: 0,
        latestComment: null,
      }),
    }),
  );
  await page.route("**/api/karya/kf/posts/fp1/comments", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await postCard.click();
  await expect(page).toHaveURL(/\/karya\/kf\/posts\/fp1/);
});

authed(
  "Scroll rail: builders to meet (self excluded) + karya CTA",
  async ({ page }) => {
    await mockMe(page);

    // Feed/featured empty — this test is about the right rail (issue #20).
    for (const path of ["**/api/featured", "**/api/feed"]) {
      await page.route(path, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        }),
      );
    }

    // Members: the viewer (test-user-id) plus two others — the viewer is never
    // surfaced to themselves in "kenalan dengan builder".
    await page.route("**/api/members", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "test-user-id",
            name: "Test User",
            handle: "test",
            bio: null,
            interests: [],
            year: "Tingkat 2",
            major: "Informatika",
            skills: [],
          },
          {
            id: "m2",
            name: "Fatimah Zahra",
            handle: "fatimah",
            bio: null,
            interests: [],
            year: "Tingkat 3",
            major: "Informatika",
            skills: ["Python", "FastAPI"],
          },
        ]),
      }),
    );

    await page.goto("/home");

    // The third column renders without inventing new discussion/feedback data.
    const rail = page.locator(".bn-rail");
    await expect(rail).toBeVisible();

    // A builder to meet shows; the viewer themselves does not.
    await expect(rail.getByText("Fatimah Zahra")).toBeVisible();
    await expect(
      rail.locator(".bn-builder-name", { hasText: "Test User" }),
    ).toHaveCount(0);

    // The accent CTA points at creating a karya.
    await rail.getByRole("button", { name: "Mulai karya baru" }).click();
    await expect(page).toHaveURL(/\/karya\/new/);
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

  await expect(page.getByRole("heading", { name: "Loom" })).toBeVisible();
  await expect(page.getByRole("button", { name: /unggulan/ })).toHaveCount(0);
});
