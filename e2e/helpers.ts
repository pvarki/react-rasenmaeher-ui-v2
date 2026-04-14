import type { Page } from "@playwright/test";
import { expect, type AdminMeta } from "@fixtures/admin";
import { getMtlsUrl, waitForInteractivePage } from "@helpers/screenshots";

export async function createInviteCode(page: Page): Promise<string> {
  await page.getByTestId("create-invite-button").click();
  await page.getByTestId("create-invite-confirm").click();
  await page.waitForURL(/\/invite-code\/[A-Z0-9]+$/);

  const code = page.url().match(/\/invite-code\/([A-Z0-9]+)$/)?.[1] ?? "";
  expect(
    code,
    "Invite code should be present in /invite-code/<CODE> URL",
  ).toMatch(/^[A-Z0-9]{8}$/);
  return code;
}

export async function cleanupInviteCode(
  page: Page,
  adminMeta: AdminMeta,
  code: string,
): Promise<void> {
  await page.goto(getMtlsUrl(adminMeta.base_url, "/add-users"));
  await waitForInteractivePage(page);
  await page.getByTestId("invite-code-filter").fill(code);
  await page.getByTestId("select-multiple-button").click();
  await page
    .locator(`[data-testid="invite-code-item"][data-invite-code="${code}"]`)
    .click();
  await page.getByTestId("bulk-delete-button").click();
}
