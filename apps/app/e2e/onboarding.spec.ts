import { authed, expect } from "./fixtures";

// Acceptance for Sprint 0 (S0b.8): a member reviews the PRD-model profile
// (handle/bio/interests — no building/wants/vibe), the draft survives a reload
// on /review, and publishing sends only the new model to the API.

const DRAFT = {
  id: "user",
  name: "Budi Santoso",
  handle: "budi",
  bio: "lagi bikin app buat komunitas kampus",
  interests: ["Community", "Product"],
  year: "Tingkat 2",
  major: "Desain Komunikasi Visual",
  skills: ["Figma", "Writing"],
};

authed(
  "onboarding review → edit → publish → reload persists, new model only",
  async ({ page }) => {
    let savedProfile: Record<string, unknown> | null = null;
    let matchRequests = 0;
    page.on("request", (request) => {
      if (new URL(request.url()).pathname === "/api/matches")
        matchRequests += 1;
    });

    await page.route("**/api/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: savedProfile
          ? JSON.stringify({ id: "test-user-id", ...savedProfile })
          : "null",
      }),
    );
    await page.route("**/api/profile", async (route) => {
      savedProfile = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.route("**/api/feed", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.route("**/api/members", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );

    // Seed the in-progress draft the way OnboardingProvider persists it.
    await page.addInitScript((draft) => {
      sessionStorage.setItem("onboarding:draft", JSON.stringify(draft));
      sessionStorage.setItem(
        "onboarding:matches",
        JSON.stringify([{ id: "legacy" }]),
      );
    }, DRAFT);

    await page.goto("/review");

    // New-model labels are present; legacy labels are gone.
    await expect(page.getByText("Handle")).toBeVisible();
    await expect(page.getByText("Bio")).toBeVisible();
    await expect(page.getByText("Minat")).toBeVisible();
    // Exact match: the legacy field *labels* are gone. (Substring matching
    // would collide with the draft bio "lagi bikin app…".)
    await expect(page.getByText("Lagi bikin", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Gaya kerja", { exact: true })).toHaveCount(0);

    // Draft content rendered from sessionStorage.
    await expect(
      page.getByText("lagi bikin app buat komunitas kampus"),
    ).toBeVisible();

    // A reload on /review must NOT bounce back to /onboarding (NFR-7).
    await page.reload();
    await expect(page).toHaveURL(/\/review/);
    await expect(
      page.getByText("lagi bikin app buat komunitas kampus"),
    ).toBeVisible();

    // Edit the handle inline.
    const handleField = page.locator(".pf", { hasText: "Handle" });
    await handleField.locator(".field-val").click();
    const input = handleField.locator(".field-in");
    await input.fill("budisan");
    await input.blur();

    await page.getByRole("button", { name: /Publish profil/ }).click();

    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole("heading", { name: "Scroll" })).toBeVisible();
    expect(matchRequests).toBe(0);
    expect(
      await page.evaluate(() => sessionStorage.getItem("onboarding:matches")),
    ).toBeNull();

    // The old result URL is now just an unmatched route and falls back to P0.
    await page.goto("/matches");
    await expect(page).not.toHaveURL(/\/matches/);
    await expect(page.getByText(/Tiga orang yang/)).toHaveCount(0);

    // The published payload is the PRD model — no legacy fields.
    expect(savedProfile).not.toBeNull();
    const profile = savedProfile as Record<string, unknown>;
    expect(profile).toMatchObject({
      name: "Budi Santoso",
      handle: "budisan",
      bio: "lagi bikin app buat komunitas kampus",
      major: "Desain Komunikasi Visual",
    });
    expect(profile.interests).toEqual(["Community", "Product"]);
    expect(profile).not.toHaveProperty("building");
    expect(profile).not.toHaveProperty("wants");
    expect(profile).not.toHaveProperty("vibe");
  },
);
