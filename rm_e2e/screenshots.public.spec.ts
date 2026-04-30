import path from "node:path";
import {
  test,
  expect,
  setLanguage,
  suppressWalkthroughDialogs,
  type AdminMeta,
} from "@fixtures/admin";
import type { Page } from "@playwright/test";
import {
  SCREENSHOTS_ENABLED,
  THEME,
  SCREENSHOT_LANGUAGES,
  SCREENSHOT_DIR,
  captureFullPage,
} from "@helpers/screenshots";
import {
  exampleApprovalCode,
  exampleCallsign,
  seedWaitingRoomState,
} from "./helpers";

type PublicPage = {
  name: string;
  url: string | ((adminMeta: AdminMeta) => string);
  waitFor?: string;
  setup?: (page: Page) => Promise<void>;
  ready?: (page: Page) => Promise<void>;
};

const APPROVE_USER_CALLSIGN = exampleCallsign("approve-user");
const APPROVE_USER_CODE = exampleApprovalCode("approve-user");
const CALLSIGN_SETUP_VALUE = exampleCallsign("callsign-setup");

const PUBLIC_PAGES: PublicPage[] = [
  { name: "login", url: "/login" },
  {
    name: "callsign-setup",
    url: (adminMeta) =>
      `/login?code=${encodeURIComponent(adminMeta.ui_login_code)}`,
    waitFor: "[data-testid='callsign-input']",
  },
  {
    name: "callsign-setup-filled",
    url: (adminMeta) =>
      `/login?code=${encodeURIComponent(adminMeta.ui_login_code)}`,
    waitFor: "[data-testid='callsign-input']",
    ready: async (page) => {
      await page.getByTestId("callsign-input").fill(CALLSIGN_SETUP_VALUE);
    },
  },
  { name: "waiting-room", url: "/waiting-room", setup: seedWaitingRoomState },
  {
    name: "approve-user-prefilled",
    url: `/approve-user?callsign=${APPROVE_USER_CALLSIGN}&approvalcode=${APPROVE_USER_CODE}`,
  },
  { name: "error-mtls-fail", url: "/error?code=mtls_fail" },
];

test.describe("screenshots: public", () => {
  test.skip(!SCREENSHOTS_ENABLED, "set SCREENSHOTS=1 to capture screenshots");

  for (const lang of SCREENSHOT_LANGUAGES) {
    test.describe(`language: ${lang}`, () => {
      for (const spec of PUBLIC_PAGES) {
        test(`public: ${spec.name}`, async ({ page, adminMeta }, testInfo) => {
          await setLanguage(page, lang);
          await suppressWalkthroughDialogs(page);
          if (spec.setup) {
            await spec.setup(page);
          }

          const targetUrl =
            typeof spec.url === "function" ? spec.url(adminMeta) : spec.url;
          await page.goto(targetUrl);
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
