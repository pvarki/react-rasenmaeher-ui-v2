import { test, expect, setLanguage } from "@fixtures/admin";
import {
  getMtlsUrl,
  gotoInteractive,
  waitForInteractivePage,
} from "@helpers/screenshots";
import type { Page } from "@playwright/test";
import { createInviteCode } from "./helpers";

async function fillApprovalCode(page: Page, code: string): Promise<void> {
  const mobileCodeInput = page.getByTestId("approval-code-mobile-input");

  if (await mobileCodeInput.isVisible().catch(() => false)) {
    await mobileCodeInput.fill(code);
    return;
  }

  const codeChars = page.locator("[data-testid^='approval-code-char-']");
  await expect(codeChars).toHaveCount(8);
  await expect(codeChars.first()).toBeVisible();
  await expect(codeChars.first()).toBeEditable();

  for (let i = 0; i < code.length && i < 8; i += 1) {
    await codeChars.nth(i).fill(code[i]!);
  }
}

test.describe("enrollment", () => {
  test.describe.configure({ mode: "serial" });

  test("first admin can enroll and approve a second user", async ({
    adminPage: page,
    adminMeta,
    context,
  }) => {
    test.setTimeout(60_000);

    await gotoInteractive(page, getMtlsUrl(adminMeta.base_url, "/add-users"));

    const inviteCode = await createInviteCode(page);

    const secondUserPage = await context.newPage();
    const secondUserCallsign = `PW${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 10_000,
    )
      .toString()
      .padStart(4, "0")}`;

    try {
      await setLanguage(secondUserPage, "en");
      await secondUserPage.goto(
        `${adminMeta.base_url}/login?code=${inviteCode}`,
      );
      await secondUserPage.waitForURL(/\/callsign-setup(\?|$)/);

      const callsignInput = secondUserPage.getByTestId("callsign-input");
      await expect(callsignInput).toBeVisible();
      await callsignInput.fill(secondUserCallsign);

      const continueButton = secondUserPage.getByTestId(
        "callsign-submit-button",
      );
      await expect(continueButton).toBeEnabled();
      await continueButton.click();

      await secondUserPage.waitForURL(/\/waiting-room(\?|$)/);

      const approvalCode = await secondUserPage.evaluate(
        () => window.localStorage.getItem("approveCode") ?? "",
      );
      expect(
        approvalCode,
        "Expected waiting-room flow to produce an approval code",
      ).toMatch(/^[A-Z0-9]{8}$/);

      // Navigate to /approve-users and find the waiting user in the UI
      const approveUsersUrl = getMtlsUrl(adminMeta.base_url, "/approve-users");
      const waitingUserSelector = `[data-testid="waiting-user-item"][data-callsign="${secondUserCallsign}"]`;
      let approved = false;
      await gotoInteractive(page, approveUsersUrl);

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        if (attempt > 1) {
          await page.waitForTimeout(3_000);
          await page.reload({ waitUntil: "domcontentloaded" });
          await waitForInteractivePage(page, approveUsersUrl);
        }

        const waitingUserRow = page.locator(waitingUserSelector);

        try {
          await expect(waitingUserRow).toBeVisible();
        } catch {
          if (attempt === 3) {
            throw new Error(
              `Waiting user '${secondUserCallsign}' never appeared in /approve-users after ${attempt} attempts`,
            );
          }
          continue;
        }

        await waitingUserRow.click();

        // Fill the approval code through the UI form
        await waitForInteractivePage(page);

        const approveDialog = page.getByTestId("approve-user-dialog");
        await expect(approveDialog).toBeVisible();

        await fillApprovalCode(page, approvalCode);

        const approveButton = page.getByTestId("approve-user-approve-button");
        await expect(approveButton).toBeEnabled();
        await approveButton.click();

        try {
          // Dialog closes if successful approval
          await expect(approveDialog).toBeHidden({ timeout: 7_500 });
          await expect(page.locator(waitingUserSelector)).toHaveCount(0, {
            timeout: 7_500,
          });
          approved = true;
          break;
        } catch {
          if (attempt === 3) {
            throw new Error(
              `Timed out approving enrolled user after ${attempt} attempts`,
            );
          }
          // Close dialog before attempting
          const backBtn = page.getByTestId("approve-user-back-button");
          if (await backBtn.isVisible().catch(() => false)) {
            await backBtn.click().catch(() => undefined);
          }
        }
      }

      expect(approved).toBeTruthy();

      await secondUserPage.waitForURL(/\/mtls-install(\?|$)/);
    } finally {
      await secondUserPage.close().catch(() => undefined);
    }
  });
});
