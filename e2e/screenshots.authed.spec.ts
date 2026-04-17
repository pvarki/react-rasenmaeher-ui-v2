import path from "node:path";
import {
  test,
  expect,
  setLanguage,
  suppressWalkthroughDialogs,
} from "@fixtures/admin";
import type { Page } from "@playwright/test";
import {
  SCREENSHOTS_ENABLED,
  THEME,
  SCREENSHOT_LANGUAGES,
  SCREENSHOT_DIR,
  getMtlsUrl,
  captureFullPage,
  waitForInteractivePage,
} from "@helpers/screenshots";
import { closeMtlsGuideIfOpen, seedCallsign } from "./helpers";

type AuthedPage = {
  name: string;
  path: string;
  waitFor?: string;
  setup?: (page: Page) => Promise<void>;
  ready?: (page: Page) => Promise<void>;
};

const AUTHED_PAGES: AuthedPage[] = [
  {
    name: "admin-tools-all",
    path: "/admin-tools",
    waitFor:
      "[data-testid='admin-tools-page'], [data-testid='admin-tools-type-selector']",
  },
  {
    name: "admin-tools-services",
    path: "/admin-tools?type=services",
    waitFor: "[data-testid='admin-tools-page']",
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
  {
    name: "mtls-install",
    path: "/mtls-install",
    waitFor: "[data-testid='mtls-install-page']",
    setup: seedCallsign,
    ready: closeMtlsGuideIfOpen,
  },
  { name: "homeview", path: "/", waitFor: "[data-testid='home-page']" },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.describe("screenshots: authed", () => {
  test.describe.configure({ mode: "parallel" });
  test.skip(!SCREENSHOTS_ENABLED, "set SCREENSHOTS=1 to capture screenshots");

  for (const lang of SCREENSHOT_LANGUAGES) {
    test.describe(`language: ${lang}`, () => {
      for (const spec of AUTHED_PAGES) {
        test(`authed: ${spec.name}`, async ({ page, adminMeta }, testInfo) => {
          await setLanguage(page, lang);
          await suppressWalkthroughDialogs(page);
          if (spec.setup) {
            await spec.setup(page);
          }

          const targetUrl = getMtlsUrl(adminMeta.base_url, spec.path);
          await page.goto(targetUrl);
          await page.waitForLoadState("networkidle").catch(() => undefined);
          await waitForInteractivePage(page, targetUrl);
          await expect(page).toHaveURL(
            new RegExp(`${escapeRegExp(spec.path.split("?")[0]!)}(\\?|$)`),
          );

          if (spec.waitFor) {
            await expect(page.locator(spec.waitFor).first()).toBeVisible();
          }

          if (spec.ready) {
            await spec.ready(page);
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
