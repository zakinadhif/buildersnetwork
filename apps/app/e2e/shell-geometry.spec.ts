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
//     nav 200  +  main 620  +  rail 232  =  1052
//
// What this locks is the MEASURE — the width the type actually sets to. That is
// the thing #91 got wrong, and it is deliberately not the same as a column's
// rendered box: the columns are divided by a hairline now and each carries a
// gutter on both sides, so every box is its measure plus two gutters plus its
// rule. Assert the measure, not the box, or this passes while the type reflows.
// The gutter has since moved (24 -> 32) without the measure moving an inch,
// which is exactly the split this test exists to keep honest.
//
// If one of these fails, the shell's box model has moved. Fix the cause; don't
// retune the number to whatever it now renders — that is how the drift got in.
const SHELL = { nav: 200, main: 620, rail: 232 };
const GUTTER = 32; // per column edge — six of them across the frame
const RULE = 1; // the two hairlines between the three columns

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

/** The MEASURE of a column: its content width, with the gutters it carries on
 *  either side and its rule taken back off. `clientWidth` already excludes the
 *  border, so only the padding has to come out. */
async function measureOf(page: Page, selector: string): Promise<number> {
  const width = await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return (
        el.clientWidth -
        Number.parseFloat(cs.paddingLeft) -
        Number.parseFloat(cs.paddingRight)
      );
    });
  return Math.round(width);
}

authed(
  "the three-column shell holds the mockup's geometry",
  async ({ page }) => {
    await mockHome(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator(".bn-shell-inner")).toBeVisible();

    expect(await measureOf(page, ".bn-nav")).toBe(SHELL.nav);
    expect(await measureOf(page, ".bn-main")).toBe(SHELL.main);
    expect(await measureOf(page, ".bn-rail")).toBe(SHELL.rail);

    // The three measures, their six gutters and their two rules are exactly
    // --container-shell-outer (1246px). This is the assertion that would have
    // caught the original bug: the centre column absorbs any error in the
    // shell's width, so it silently went 48 short.
    const outer = SHELL.nav + SHELL.main + SHELL.rail + 6 * GUTTER + 2 * RULE;
    expect(await widthOf(page, ".bn-shell-inner")).toBe(outer);
  },
);

authed(
  "the mobile shell uses app chrome and stable gutters",
  async ({ page }) => {
    await mockHome(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/home");

    await expect(page.locator(".bn-mobile-header")).toBeVisible();
    await expect(page.locator(".bn-mobile-nav")).toBeVisible();
    await expect(page.locator(".bn-mobile-create")).toBeVisible();
    await expect(page.locator(".bn-nav")).toBeHidden();
    await expect(page.locator(".bn-rail")).toBeHidden();

    const main = await page.locator(".bn-main").boundingBox();
    if (!main) throw new Error("mobile main column did not render");
    expect(Math.round(main.x)).toBe(16);
    expect(Math.round(main.y)).toBe(64);
    expect(Math.round(main.width)).toBe(358); // viewport minus both 16px gutters
    await expect(page.locator(".bn-main")).toHaveCSS("padding-top", "16px");

    await expect(page.getByRole("heading", { name: "Scroll" })).toBeHidden();

    const mobileNav = page.getByRole("navigation", {
      name: "Navigasi utama",
    });
    await expect(
      mobileNav.getByRole("button", { name: "Scroll", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  },
);
