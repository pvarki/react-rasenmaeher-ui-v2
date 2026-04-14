import path from "node:path";
import { test, expect, setLanguage, type AdminMeta } from "@fixtures/admin";
import type { Page } from "@playwright/test";
import {
  SCREENSHOTS_ENABLED,
  THEME,
  LANGUAGES,
  SCREENSHOT_DIR,
  seedWaitingRoomState,
  captureFullPage,
} from "@helpers/screenshots";

type PublicPage = {
  name: string;
  url: string | ((adminMeta: AdminMeta) => string);
  waitFor?: string;
  setup?: (page: Page) => Promise<void>;
};

const PUBLIC_PAGES: PublicPage[] = [
  { name: "login", url: "/login" },
  {
    name: "callsign-setup",
    url: (adminMeta) =>
      `/login?code=${encodeURIComponent(adminMeta.ui_login_code)}`,
    waitFor: "[data-testid='callsign-input']",
  },
  { name: "waiting-room", url: "/waiting-room", setup: seedWaitingRoomState },
  {
    name: "approve-user-prefilled",
    url: "/approve-user?callsign=playwright&approvalcode=ABCD1234",
  },
  { name: "error-mtls-fail", url: "/error?code=mtls_fail" },
];

test.describe("screenshots: public", () => {
  test.skip(!SCREENSHOTS_ENABLED, "set SCREENSHOTS=1 to capture screenshots");

  for (const lang of LANGUAGES) {
    test.describe(`language: ${lang}`, () => {
      for (const spec of PUBLIC_PAGES) {
        test(`public: ${spec.name}`, async ({ page, adminMeta }, testInfo) => {
          await setLanguage(page, lang);
          if (spec.setup) {
            await spec.setup(page);
          }

          const targetUrl =
            typeof spec.url === "function" ? spec.url(adminMeta) : spec.url;
          await page.goto(targetUrl);
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
