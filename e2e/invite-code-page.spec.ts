import { test, expect } from "@fixtures/admin";
import {
  getMtlsUrl,
  gotoInteractive,
  waitForInteractivePage,
} from "@helpers/screenshots";
import { createInviteCode, cleanupInviteCode } from "./helpers";

test.describe("invite code detail page", () => {
  let inviteCode: string;

  test.beforeEach(async ({ adminPage: page, adminMeta }) => {
    await gotoInteractive(page, getMtlsUrl(adminMeta.base_url, "/add-users"));
    await expect(page).toHaveURL(/\/add-users(\?|$)/);

    inviteCode = await createInviteCode(page);
  });

  test.afterEach(async ({ adminPage: page, adminMeta }) => {
    if (inviteCode) {
      await cleanupInviteCode(page, adminMeta, inviteCode);
    }
  });

  test("creating an invite lands on /invite-code/<CODE>", async ({
    adminPage: page,
  }) => {
    const invitePage = page.getByTestId("invite-code-page");
    await expect(invitePage).toBeVisible();

    await expect(page.getByTestId("invite-code-value")).toHaveText(inviteCode);

    await expect(page.getByTestId("invite-qr-card")).toBeVisible();
    await expect(page.getByTestId("invite-copy-button")).toBeVisible();
    await expect(page.getByTestId("invite-export-pdf-button")).toBeVisible();
    await expect(page.getByTestId("invite-code-back-button")).toBeVisible();

    const qrCard = page.getByTestId("invite-qr-card");
    const inviteUrl = (await qrCard.getAttribute("data-invite-url")) ?? "";
    expect(inviteUrl).toContain(`/login?code=${inviteCode}`);
  });

  test("back button from the invite-code page returns to /add-users", async ({
    adminPage: page,
    adminMeta,
  }) => {
    const backButton = page.getByTestId("invite-code-back-button");
    await expect(backButton).toBeVisible();
    await expect(backButton).toBeEnabled();

    await backButton.click();
    await page.waitForURL(/\/add-users(\?|$)/);

    await waitForInteractivePage(
      page,
      getMtlsUrl(adminMeta.base_url, "/add-users"),
    );
    await expect(page.getByTestId("add-users-page")).toBeVisible();
  });

  test("copy button copies the code", async ({ adminPage: page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const copyButton = page.getByTestId("invite-copy-button");
    await expect(copyButton).toHaveAttribute("data-invite-copied", "false");
    await expect(copyButton).toBeEnabled();
    await copyButton.click();
    await expect(copyButton).toHaveAttribute("data-invite-copied", "true", {
      timeout: 10_000,
    });
  });
});
