import type { Page } from "@playwright/test";
import { authed, expect } from "./fixtures";

// Regression lock for issue #91. The app and the mockups drifted apart because
// they did not share a box model: `max-width: var(--container-shell)` (1100px)
// meant the *content* width in the reference (no preflight, so content-box) and
// the *outer* width in the app (border-box), so the app's 24px gutters ate into
// the columns and the centre column rendered 572px against the mockup's 620px.
//
// Nothing caught that — the shell has no test, and 48px is easy to miss by eye.
// So the numbers are pinned here, measured off apps/mockups at 1440px:
//
//     nav 200  +  gap 24  +  main 620  +  gap 24  +  rail 232  =  1100
//
// If one of these fails, the shell's box model has moved. Fix the cause; don't
// retune the number to whatever it now renders — that is how the drift got in.
const SHELL = { nav: 200, main: 620, rail: 232 };

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

async function mockHome(page: Page) {
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PROFILE),
    }),
  );
  for (const path of ["**/api/featured", "**/api/feed", "**/api/members"]) {
    await page.route(path, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
  }
  await page.route("**/api/stats", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ karya: 0, builders: 0, updatesThisWeek: 0 }),
    }),
  );
}

/** Rendered border-box width of the first element matching `selector`. */
async function widthOf(page: Page, selector: string): Promise<number> {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`${selector} did not render`);
  return Math.round(box.width);
}

authed(
  "the three-column shell holds the mockup's geometry",
  async ({ page }) => {
    await mockHome(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator(".bn-shell-inner")).toBeVisible();

    expect(await widthOf(page, ".bn-nav")).toBe(SHELL.nav);
    expect(await widthOf(page, ".bn-main")).toBe(SHELL.main);
    expect(await widthOf(page, ".bn-rail")).toBe(SHELL.rail);

    // The columns and their two 24px gaps are exactly --container-shell (1100px).
    // This is the assertion that would have caught the original bug: the centre
    // column absorbs any error in the shell's width, so it silently went 48 short.
    expect(await widthOf(page, ".bn-shell-inner")).toBe(1100 + 2 * 24);
  },
);
