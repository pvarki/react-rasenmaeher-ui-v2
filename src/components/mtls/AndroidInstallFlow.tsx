"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, FolderDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizardStep } from "@/hooks/mtls/useWizardStep";
import { usePageFocus } from "@/hooks/mtls/usePageFocus";
import { CertProgress } from "./CertProgress";
import { CERT_STEPS } from "./certSteps";
import { DialogPreview } from "./DialogPreview";
import { GuideShot } from "./GuideShot";
import { PasswordCallout } from "./PasswordCallout";
import { WizardAction, WizardConfirm, WizardNav } from "./WizardParts";
import { useStickyCopy } from "@/hooks/mtls/useStickyCopy";

const STEP_KEY = "mtls_android_step";
// Both copies of PRESS OK render identically; only their position differs, so
// whichever end the dialog leaves uncovered reads the same.
const INSTRUCTION =
  "text-center font-bold leading-none text-[clamp(2.5rem,13vw,4.5rem)]";
// Chrome hands the file to the installer a moment after the download lands.
// Until then an unanswered "no dialog?" would flash up and vanish again.
const DIALOG_GRACE_MS = 2000;

/**
 * What the install screen should point at, from the one thing the page can
 * observe: whether it has the focus.
 *  - dialog    : something is over the page, so the instructions are live
 *  - waiting   : just downloaded, the dialog may still be on its way
 *  - no-dialog : nothing came, so the way in is the downloads folder
 *  - returned  : the dialog was here and has closed, so move on
 */
type DialogState = "dialog" | "waiting" | "no-dialog" | "returned";

interface AndroidInstallFlowProps {
  callsign: string;
  fileName: string;
  mtlsUrl: string;
  onDownload: () => void;
  isDownloading: boolean;
  downloadCount: number;
  platformPicker: ReactNode;
}

/**
 * Android installs the .pfx in two or three system dialogs we cannot see:
 * the password, the certificate type, and on older versions a name. The page
 * only ever has to say two things while they are open: the password, and OK.
 */
export function AndroidInstallFlow({
  callsign,
  fileName,
  mtlsUrl,
  onDownload,
  isDownloading,
  downloadCount,
  platformPicker,
}: AndroidInstallFlowProps) {
  const { t } = useTranslation();
  const { step, furthest, go } = useWizardStep(
    STEP_KEY,
    callsign,
    CERT_STEPS.length,
  );
  const focus = usePageFocus(step === 1);
  const { copied, copy } = useStickyCopy(callsign);

  // Restarted by every download, since each one can bring its own dialog.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    setSettled(false);
    if (step !== 1) return;
    const timer = window.setTimeout(() => setSettled(true), DIALOG_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [step, downloadCount]);

  const dialogState: DialogState = !focus.focused
    ? "dialog"
    : focus.wasAway
      ? "returned"
      : settled
        ? "no-dialog"
        : "waiting";
  // Only while something is over the page: shown on a focused page, PRESS OK
  // is an instruction with nothing to press.
  const pressOkLive = dialogState === "dialog";
  const hintShown = dialogState === "no-dialog" || dialogState === "returned";
  const returned = dialogState === "returned";

  // Every completed download moves the flow on, including repeats. Keying off
  // the stored cert_downloaded flag instead would pin the user forward, since
  // it never clears once set.
  const seenDownloads = useRef(downloadCount);
  useEffect(() => {
    if (downloadCount === seenDownloads.current) return;
    seenDownloads.current = downloadCount;
    go(1);
  }, [downloadCount, go]);

  const startDownload = () => {
    // Copied inside the tap, while the browser still counts it as a user
    // gesture, so the password dialog only needs a paste.
    copy();
    onDownload();
  };

  const current = CERT_STEPS[step];
  const nav = (
    <WizardNav
      step={step}
      onBack={() => go(step - 1)}
      platformPicker={platformPicker}
    />
  );

  return (
    <div
      data-testid="android-install-flow"
      data-android-step={current}
      data-dialog-state={dialogState}
      className="flex min-h-0 flex-1 flex-col gap-5"
    >
      <CertProgress step={step} furthest={furthest} onSelect={go} />

      {current === "download" && (
        <>
          <h1 className="text-4xl font-bold leading-tight text-balance">
            {t("mtlsInstall.android.download.title")}
          </h1>

          <div className="flex flex-1 flex-col justify-center">
            <DialogPreview
              callsign={callsign}
              caption={t("mtlsInstall.android.download.caption")}
            />
          </div>

          {nav}
          <WizardAction
            data-testid="mtls-download-button"
            data-mtls-downloading={isDownloading ? "true" : "false"}
            onClick={startDownload}
            disabled={isDownloading || !callsign}
          >
            {isDownloading ? (
              <Loader2 className="size-7 animate-spin" />
            ) : (
              <Download className="size-7" />
            )}
            {t("mtlsInstall.android.download.action")}
          </WizardAction>
        </>
      )}

      {current === "install" && (
        <>
          {/* Top of the screen: the one band that stays clear while the
              keyboard is up for the password. */}
          <PasswordCallout
            callsign={callsign}
            isCopied={copied}
            onCopy={copy}
          />
          <PressOk
            live={pressOkLive}
            testId="android-press-ok"
            label={t("mtlsInstall.android.install.title")}
          />

          {/* The middle is where the dialog lands. The hint only shows while
              the page has the focus: Samsung does not auto-open the download,
              and its installer then appears over the file manager, not over
              us. Hidden rather than removed, so nothing jumps when it comes. */}
          <div className="relative flex flex-1 flex-col justify-center">
            {dialogState === "waiting" && (
              <Loader2
                data-testid="android-waiting"
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
              />
            )}
            <div
              data-testid="android-open-download"
              data-shown={hintShown ? "true" : "false"}
              aria-hidden={!hintShown}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 transition-opacity duration-300",
                !hintShown && "invisible opacity-0",
                dialogState === "no-dialog"
                  ? "border-primary-light"
                  : "border-border",
              )}
            >
              <FolderDown
                className={cn(
                  "h-7 w-7 shrink-0",
                  dialogState === "no-dialog"
                    ? "animate-attention text-primary-light"
                    : "text-muted-foreground",
                )}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-lg font-bold leading-snug",
                    returned && "text-muted-foreground",
                  )}
                >
                  {returned
                    ? t("mtlsInstall.android.install.retry")
                    : t("mtlsInstall.android.install.openDownload")}
                </p>
                <p className="mt-1 break-all font-mono text-sm text-muted-foreground">
                  {fileName}
                </p>
              </div>
            </div>
          </div>

          {/* Repeated at the other end: OEMs anchor the type dialog top, centre
              or bottom, and the page cannot tell which. */}
          <PressOk
            live={pressOkLive}
            testId="android-press-ok-bottom"
            label={t("mtlsInstall.android.install.title")}
            decorative
          />
          {nav}
          {/* Coming back only lights this up. Moving the step on its own is
              what desynced the flow in field testing. */}
          <WizardConfirm
            data-testid="cert-installed-button"
            lit={returned}
            onClick={() => go(2)}
          >
            {t("mtlsInstall.install.next")}
          </WizardConfirm>
        </>
      )}

      {current === "done" && (
        <>
          <h1 className="flex items-center gap-3 text-4xl font-bold leading-tight">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-success">
              <Check className="h-6 w-6 text-white" strokeWidth={3} />
            </span>
            {t("mtlsInstall.done.title")}
          </h1>

          <GuideShot
            src="/guide/androidstep3.webp"
            caption={t("mtlsInstall.android.done.caption")}
          />

          {nav}
          <WizardAction asChild>
            <a
              data-testid="mtls-navigate-link"
              data-mtls-url={mtlsUrl}
              href={mtlsUrl}
            >
              {t("mtlsInstall.done.action")}
            </a>
          </WizardAction>
        </>
      )}
    </div>
  );
}

/**
 * PRESS OK, popping in when the page loses the focus to the dialog and gone
 * again when it comes back. The slot is kept either way, so the password card
 * above never moves. Pop and pulse live on separate elements, since both are
 * transforms and would otherwise cancel each other out.
 */
function PressOk({
  live,
  testId,
  label,
  decorative = false,
}: {
  live: boolean;
  testId: string;
  label: string;
  /** The second copy only repeats the first for whichever end is uncovered. */
  decorative?: boolean;
}) {
  return (
    <div
      data-testid={testId}
      data-live={live ? "true" : "false"}
      aria-hidden={decorative || !live}
      className={cn(
        "transition-[opacity,transform] duration-200 ease-out",
        live ? "scale-100 opacity-100" : "invisible scale-75 opacity-0",
      )}
    >
      <p className={cn(INSTRUCTION, live && "animate-attention")}>{label}</p>
    </div>
  );
}
