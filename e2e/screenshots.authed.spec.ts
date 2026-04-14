import path from "node:path";
import {
  test,
  expect,
  setLanguage,
  suppressWalkthroughDialogs,
} from "@fixtures/admin";
import {
  SCREENSHOTS_ENABLED,
  THEME,
  LANGUAGES,
  SCREENSHOT_DIR,
  getMtlsUrl,
  captureFullPage,
  waitForInteractivePage,
} from "@helpers/screenshots";

type AuthedPage = {
  name: string;
  path: string;
  waitFor?: string;
};

const AUTHED_PAGES: AuthedPage[] = [
  {
    name: "admin-tools-all",
    path: "/admin-tools",
    waitFor:
      "[data-testid='admin-tools-page'], [data-testid='admin-tools-type-selector']",
  },
  {
    name: "manage-users",
    path: "/manage-users",
    waitFor: "[data-testid='manage-users-page']",
  },
  {
    name: "add-users",
    path: "/add-users",
    waitFor: "[data-testid='add-users-page']",
  },
  {
    name: "approve-users",
    path: "/approve-users",
    waitFor: "[data-testid='how-it-works-section']",
  },
  { name: "homeview", path: "/", waitFor: "[data-testid='home-page']" },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.describe("screenshots: authed", () => {
  test.describe.configure({ mode: "parallel" });
  test.skip(!SCREENSHOTS_ENABLED, "set SCREENSHOTS=1 to capture screenshots");

  for (const lang of LANGUAGES) {
    test.describe(`language: ${lang}`, () => {
      for (const spec of AUTHED_PAGES) {
        test(`authed: ${spec.name}`, async ({ page, adminMeta }, testInfo) => {
          await setLanguage(page, lang);
          await suppressWalkthroughDialogs(page);

          const targetUrl = getMtlsUrl(adminMeta.base_url, spec.path);
          await page.goto(targetUrl);
          await page.waitForLoadState("networkidle").catch(() => undefined);
          await waitForInteractivePage(page);
          await expect(page).toHaveURL(
            new RegExp(`${escapeRegExp(spec.path)}(\\?|$)`),
          );

          if (spec.waitFor) {
            await expect(page.locator(spec.waitFor).first()).toBeVisible();
          }

          await captureFullPage(
            page,
            path.join(
              SCREENSHOT_DIR,
              THEME,
              testInfo.project.name,
              lang,
              `${spec.name}.png`,
            ),
          );
        });
      }
    });
  }
});
