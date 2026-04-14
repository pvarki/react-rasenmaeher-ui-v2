import { test, expect, setLanguage } from "@fixtures/admin";
import { waitForInteractivePage } from "@helpers/screenshots";
import { pickInViewportByTestId } from "@helpers/dom";
import type { Page } from "@playwright/test";
const DEFAULT_CALLSIGN = "PLAYWRIGHT_USER";
const AVAILABLE_PLATFORMS = [
  "windows",
  "macos",
  "linux",
  "android",
  "ios",
] as const;
const MTLS_GUIDE_MAX_STEPS = 10;

async function closeMtlsGuideIfOpen(page: Page): Promise<void> {
  const guideDialog = page.getByTestId("mtls-guide-dialog").first();
  const nextButton = page.getByTestId("dialog-step-forward").first();

  try {
    await nextButton.waitFor({ state: "visible", timeout: 2_000 });
  } catch {
    return;
  }

  const currentStepIndex = Number(
    await nextButton.getAttribute("data-guide-current-step-index"),
  );
  const stepCount = Number(
    await nextButton.getAttribute("data-guide-step-count"),
  );

  const hasValidStepMeta =
    Number.isInteger(currentStepIndex) &&
    Number.isInteger(stepCount) &&
    currentStepIndex >= 0 &&
    stepCount > 0 &&
    currentStepIndex < stepCount;

  const remainingClicks = hasValidStepMeta
    ? stepCount - currentStepIndex
    : MTLS_GUIDE_MAX_STEPS;

  for (let i = 0; i < remainingClicks; i += 1) {
    if (!(await nextButton.isVisible().catch(() => false))) {
      return;
    }

    await nextButton.click();
  }

  await expect(guideDialog).not.toBeVisible();
}

function toDisplayPlatformValue(platform: string) {
  switch (platform) {
    case "macos":
      return "MacOS";
    case "ios":
      return "iOS";
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
}

test.describe("mtls-install page", () => {
  test.beforeEach(async ({ adminPage: page }) => {
    await page.addInitScript((callsign: string) => {
      window.localStorage.setItem("callsign", callsign);
    }, DEFAULT_CALLSIGN);

    await page.goto("/mtls-install");
    await waitForInteractivePage(page);
    await closeMtlsGuideIfOpen(page);
  });

  test("renders the install page with platform selector and download button", async ({
    adminPage: page,
  }) => {
    const installPage = page.getByTestId("mtls-install-page");
    await expect(installPage).toBeVisible();

    await expect
      .poll(async () => installPage.getAttribute("data-mtls-os"))
      .not.toBe("");

    const callsignDisplay = page.getByTestId("mtls-callsign-display");
    await expect(callsignDisplay).toBeVisible();
    await expect(callsignDisplay).toHaveAttribute(
      "data-callsign",
      DEFAULT_CALLSIGN,
    );

    const actions = page.getByTestId("mtls-action-buttons");
    await expect(actions).toBeVisible();

    const downloadButton = page.getByTestId("mtls-download-button");
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
    await expect(downloadButton).toHaveAttribute(
      "data-mtls-downloading",
      "false",
    );

    const navLink = page.getByTestId("mtls-navigate-link");
    await expect(navLink).toHaveAttribute("href", /\/\/mtls\./);
  });

  test("selecting a different platform updates the page data attribute", async ({
    adminPage: page,
  }) => {
    const installPage = page.getByTestId("mtls-install-page");
    await expect(installPage).toBeVisible();

    const platformTrigger = await pickInViewportByTestId(
      page,
      "platform-selector-trigger",
    );
    const initialValue =
      (await platformTrigger.getAttribute("data-platform-value")) ||
      (await installPage.getAttribute("data-mtls-os")) ||
      "";

    const targetPlatform =
      AVAILABLE_PLATFORMS.find((p) => p !== initialValue.toLowerCase()) ||
      "linux";

    await platformTrigger.click();
    const option = page.getByTestId(`platform-option-${targetPlatform}`);
    await option.click();

    const expectedValue = toDisplayPlatformValue(targetPlatform);

    await expect(installPage).toHaveAttribute("data-mtls-os", expectedValue);
    await expect(page.getByTestId("platform-selector-trigger")).toHaveAttribute(
      "data-platform-value",
      expectedValue,
    );

    await expect(page.getByTestId("mtls-instructions")).toBeVisible();
  });

  test("help button reopens the mtls install guide dialog", async ({
    adminPage: page,
  }) => {
    await page.getByTestId("mtls-help-button").click();
    await expect(page.getByTestId("dialog-step-forward")).toBeVisible();
  });

  test("download button is disabled when no callsign is stored", async ({
    browser,
  }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    try {
      const cleanPage = await context.newPage();
      await setLanguage(cleanPage, "en");

      await cleanPage.goto("/mtls-install");
      await waitForInteractivePage(cleanPage);
      await closeMtlsGuideIfOpen(cleanPage);

      const downloadButton = cleanPage.getByTestId("mtls-download-button");
      await expect(downloadButton).toBeVisible();
      await expect(downloadButton).toBeDisabled();
    } finally {
      await context.close();
    }
  });
});
