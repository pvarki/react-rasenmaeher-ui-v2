import type { Page } from "@playwright/test";
import { expect, type AdminMeta } from "@fixtures/admin";
import { getMtlsUrl, gotoInteractive } from "@helpers/screenshots";

const MTLS_GUIDE_MAX_STEPS = 10;

const PHONETIC_ALPHABET = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliet",
] as const;

function hashString(value: string): number {
  let h = 0;
  for (const ch of value) {
    h = (h * 31 + ch.charCodeAt(0)) | 0;
  }
  return Math.abs(h);
}

export function exampleCallsign(seed: string): string {
  const h = hashString(seed);
  const name = PHONETIC_ALPHABET[h % PHONETIC_ALPHABET.length]!;
  const num = ((h * 7) % 900) + 100;
  return `${name}${num}`;
}

export function exampleApprovalCode(seed: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let curr = hashString(seed);
  let result = "";
  for (let i = 0; i < 8; i += 1) {
    curr = (curr * 48271 + 1) | 0;
    result += alphabet[Math.abs(curr) % alphabet.length]!;
  }
  return result;
}

export async function seedCallsign(
  page: Page,
  callsign: string = exampleCallsign("default"),
): Promise<void> {
  await page.addInitScript((value: string) => {
    window.localStorage.setItem("callsign", value);
  }, callsign);
}

type WaitingRoomSeed = { callsign: string; approveCode: string };

export async function seedWaitingRoomState(
  page: Page,
  seed: WaitingRoomSeed = {
    callsign: exampleCallsign("waiting-room"),
    approveCode: exampleApprovalCode("waiting-room"),
  },
): Promise<void> {
  await page.addInitScript((value: WaitingRoomSeed) => {
    window.localStorage.setItem("callsign", value.callsign);
    window.localStorage.setItem("approveCode", value.approveCode);
  }, seed);
}

export async function closeMtlsGuideIfOpen(page: Page): Promise<void> {
  const nextButton = page.getByTestId("dialog-step-forward").first();
  const guideDialog = page.getByTestId("mtls-guide-dialog").first();

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
  await gotoInteractive(page, getMtlsUrl(adminMeta.base_url, "/add-users"));
  await page.getByTestId("invite-code-filter").fill(code);
  await page.getByTestId("select-multiple-button").click();
  await page
    .locator(`[data-testid="invite-code-item"][data-invite-code="${code}"]`)
    .click();
  await page.getByTestId("bulk-delete-button").click();
}
