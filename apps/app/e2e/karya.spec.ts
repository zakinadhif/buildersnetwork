import type { Page } from "@playwright/test";
import { authed, expect } from "./fixtures";

// Acceptance for Sprint 2 (S2.17): create a karya via the direct form (no AI)
// and via the AI pre-fill, both landing on the same editable draft; render a
// karya page with contributor faces and the join CTA; and, as owner, see a
// pending request with approve/decline. Mirrors interests.spec.ts mocking style.

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

const CATALOG = [
  { id: "i1", name: "Open Source", slug: "open-source", curated: true },
  {
    id: "i2",
    name: "Machine Learning",
    slug: "machine-learning",
    curated: true,
  },
];

// Common endpoints every karya screen touches: the viewer's profile (so the
// has-profile gate passes) and the interest catalog (InterestsEditor).
async function mockCommon(page: Page) {
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PROFILE),
    }),
  );
  await page.route("**/api/interests", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(CATALOG),
    }),
  );
}

authed(
  "Karya CTA → manual create → publish → created detail",
  async ({ page }) => {
    await mockCommon(page);

    let savedKarya: Record<string, unknown> | null = null;
    await page.route("**/api/karya", async (route) => {
      if (route.request().method() === "POST") {
        savedKarya = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "k-new" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
      }
    });
    // After publish the client redirects to /karya/k-new and loads its detail.
    await page.route("**/api/karya/k-new", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "k-new",
          title: "Sync Tool",
          description: "offline-first file sync",
          stages: ["idea", "building"],
          interests: ["Open Source"],
          createdBy: "test-user-id",
          roster: [
            {
              id: "test-user-id",
              name: "Test User",
              handle: "test",
              image: null,
            },
          ],
          viewerMembership: { role: "owner", status: "member" },
          pendingRequests: [],
        }),
      }),
    );

    await page.goto("/karya");
    await page
      .getByRole("main")
      .getByRole("button", { name: "Bikin karya" })
      .click();
    await expect(page).toHaveURL(/\/karya\/new$/);
    await expect(
      page.getByRole("button", { name: /Bantu susun pakai AI/ }),
    ).toBeVisible();

    await page.getByLabel("Judul").fill("Sync Tool");
    await page.getByLabel("Deskripsi").fill("offline-first file sync");

    // Stage multi-select: "ide" is on by default; add "bikin" (building).
    const stageField = page.locator(".pf", { hasText: "Tahap" });
    await stageField.getByRole("button", { name: "bikin" }).click();

    // Interest tag via free-text.
    const minat = page.locator(".pf", { hasText: "Minat" });
    await minat.locator(".chip-add").fill("Open Source");
    await minat.locator(".chip-add").press("Enter");
    await expect(
      minat.locator(".chip", { hasText: "Open Source" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Terbitkan karya" }).click();
    await expect(page).toHaveURL(/\/karya\/k-new/);

    expect(savedKarya).not.toBeNull();
    const k = savedKarya as Record<string, unknown>;
    expect(k.title).toBe("Sync Tool");
    expect(k.description).toBe("offline-first file sync");
    expect(k.stages).toEqual(["idea", "building"]);
    expect(k.interests).toEqual(["Open Source"]);
  },
);

authed(
  "AI pre-fill: extracted draft lands in the editable form before publish",
  async ({ page }) => {
    await mockCommon(page);

    // The chat stream replies with the end signal, which triggers extraction.
    await page.route("**/api/ai/stream", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: "oke, biar aku susun draft karyanya sekarang.",
      }),
    );
    // Extraction returns the structured draft.
    await page.route("**/api/ai/complete", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          text: JSON.stringify({
            title: "Rasa",
            description: "rekomendasi kuliner lokal berbasis ML",
            stages: ["validating"],
            interests: ["Machine Learning"],
          }),
        }),
      }),
    );

    await page.goto("/karya/new/ai");

    const textarea = page.locator(".chat-textarea");
    await textarea.fill("lagi bikin app rekomendasi kuliner");
    await textarea.press("Enter");

    // The agent hands the extracted draft to the editable form (DECISION-D).
    await expect(page).toHaveURL(/\/karya\/new$/);
    await expect(page.getByLabel("Judul")).toHaveValue("Rasa");
    await expect(page.getByLabel("Deskripsi")).toHaveValue(
      "rekomendasi kuliner lokal berbasis ML",
    );
    // The extracted stage is reflected in the multi-select.
    const stageField = page.locator(".pf", { hasText: "Tahap" });
    await expect(
      stageField.getByRole("button", { name: "validasi" }),
    ).toHaveAttribute("aria-pressed", "true");
  },
);

authed(
  "karya page: roster faces render and a non-member sees Minta gabung",
  async ({ page }) => {
    await mockCommon(page);

    await page.route("**/api/karya/k1", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "k1",
          title: "Loom",
          description: "peer-to-peer file sync",
          stages: ["building"],
          interests: ["Open Source"],
          createdBy: "owner-id",
          roster: [
            {
              id: "owner-id",
              name: "Hafiz Maulana",
              handle: "hafiz",
              image: null,
            },
            { id: "m3", name: "Rizal Anwar", handle: "rizal", image: null },
          ],
          viewerMembership: null,
          pendingRequests: [],
        }),
      }),
    );

    await page.goto("/karya/k1");

    await expect(page.getByText("Loom")).toBeVisible();
    // Contributor faces (monograms) render as labelled images.
    await expect(
      page.getByRole("img", { name: "Hafiz Maulana" }),
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "Rizal Anwar" })).toBeVisible();
    // A non-member viewer sees the join CTA.
    await expect(
      page.getByRole("button", { name: "Minta gabung" }),
    ).toBeVisible();
  },
);

authed(
  "karya page: owner sees a pending request with approve/decline",
  async ({ page }) => {
    await mockCommon(page);

    await page.route("**/api/karya/k2", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "k2",
          title: "Saku",
          description: "keuangan pribadi buat mahasiswa",
          stages: ["idea"],
          interests: [],
          createdBy: "test-user-id",
          roster: [
            {
              id: "test-user-id",
              name: "Test User",
              handle: "test",
              image: null,
            },
          ],
          viewerMembership: { role: "owner", status: "member" },
          pendingRequests: [
            { id: "req1", name: "Dinda Pratiwi", handle: "dinda", image: null },
          ],
        }),
      }),
    );

    await page.goto("/karya/k2");

    const pending = page.locator(".pending-row", { hasText: "Dinda Pratiwi" });
    await expect(pending).toBeVisible();
    await expect(pending.getByRole("button", { name: "Terima" })).toBeVisible();
    await expect(pending.getByRole("button", { name: "Tolak" })).toBeVisible();
  },
);
