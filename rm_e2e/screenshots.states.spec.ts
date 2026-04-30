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
  getMtlsUrl,
  captureFullPage,
  gotoInteractive,
  waitForInteractivePage,
} from "@helpers/screenshots";
import { createInviteCode, cleanupInviteCode, seedCallsign } from "./helpers";

type StateSpec = {
  name: string;
  pre?: (page: Page) => Promise<void>;
  run: (page: Page, adminMeta: AdminMeta) => Promise<void>;
  cleanup?: (page: Page, adminMeta: AdminMeta) => Promise<void>;
};

async function openMtlsInstall(
  page: Page,
  adminMeta: AdminMeta,
): Promise<void> {
  await gotoInteractive(page, getMtlsUrl(adminMeta.base_url, "/mtls-install"));
  await expect(page.getByTestId("mtls-install-page")).toBeVisible();
}

const STATES: StateSpec[] = [
  {
    name: "add-users-create-invite-dialog",
    run: async (page, adminMeta) => {
      await gotoInteractive(page, getMtlsUrl(adminMeta.base_url, "/add-users"));
      await page.getByTestId("create-invite-button").click();
      await expect(page.getByTestId("create-invite-dialog")).toBeVisible();
      await expect(page.getByTestId("create-invite-confirm")).toBeVisible();
    },
  },
  {
    name: "invite-code-detail",
    run: async (page, adminMeta) => {
      await gotoInteractive(page, getMtlsUrl(adminMeta.base_url, "/add-users"));
      const code = await createInviteCode(page);
      await expect(page).toHaveURL(new RegExp(`/invite-code/${code}$`));
      await waitForInteractivePage(
        page,
        getMtlsUrl(adminMeta.base_url, `/invite-code/${code}`),
      );
    },
    cleanup: async (page, adminMeta) => {
      const match = page.url().match(/\/invite-code\/([A-Z0-9]+)$/);
      if (match?.[1]) {
        await cleanupInviteCode(page, adminMeta, match[1]).catch(
          () => undefined,
        );
      }
    },
  },
  {
    name: "mtls-install-guide",
    pre: seedCallsign,
    run: async (page, adminMeta) => {
      await openMtlsInstall(page, adminMeta);
      await expect(page.getByTestId("dialog-step-forward")).toBeVisible();
    },
  },
];

test.describe("screenshots: states", () => {
  test.skip(!SCREENSHOTS_ENABLED, "set SCREENSHOTS=1 to capture screenshots");

  for (const lang of SCREENSHOT_LANGUAGES) {
    test.describe(`language: ${lang}`, () => {
      for (const spec of STATES) {
        test(`state: ${spec.name}`, async ({ page, adminMeta }, testInfo) => {
          await setLanguage(page, lang);
          await suppressWalkthroughDialogs(page);
          if (spec.pre) {
            await spec.pre(page);
          }

          await spec.run(page, adminMeta);

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

          if (spec.cleanup) {
            await spec.cleanup(page, adminMeta).catch(() => undefined);
          }
        });
      }
    });
  }
});
