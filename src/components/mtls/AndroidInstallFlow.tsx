"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, Check, Copy, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import { cn } from "@/lib/utils";

const STEP_KEY = "mtls_android_step";
const STEPS = ["download", "password", "done"] as const;
// Android opens the installer within a second; past this it is not coming.
const DIALOG_WAIT_MS = 3500;

interface AndroidInstallFlowProps {
  callsign: string;
  fileName: string;
  mtlsUrl: string;
  onDownload: () => void;
  isDownloading: boolean;
  certDownloaded: boolean;
  onUseOtherPlatform: () => void;
}

export function AndroidInstallFlow({
  callsign,
  fileName,
  mtlsUrl,
  onDownload,
  isDownloading,
  certDownloaded,
  onUseOtherPlatform,
}: AndroidInstallFlowProps) {
  const { t } = useTranslation();
  const { isCopied, handleCopy } = useCopyToClipboard();

  // Stored against the callsign: progress survives the system installer taking
  // over, but the next person to enrol on this device starts from the top.
  const owner = callsign || localStorage.getItem("callsign") || "";
  const [step, setStep] = useState(() => {
    const [storedOwner, storedStep] = (
      localStorage.getItem(STEP_KEY) ?? ""
    ).split(":");
    const parsed = Number(storedStep);
    return storedOwner &&
      storedOwner === localStorage.getItem("callsign") &&
      Number.isInteger(parsed) &&
      parsed > 0 &&
      parsed < STEPS.length
      ? parsed
      : 0;
  });
  // The installer is a separate activity: it steals focus but leaves this page
  // visible behind it, so blur/focus is what tells us it opened, not
  // visibilitychange. No blur at all means the user has to open the file.
  const [dialogMissing, setDialogMissing] = useState(false);
  const sawDialog = useRef(false);

  const go = (next: number) => {
    localStorage.setItem(STEP_KEY, `${owner}:${next}`);
    setStep(next);
  };

  useEffect(() => {
    if (certDownloaded && step === 0) go(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certDownloaded, step]);

  useEffect(() => {
    if (step !== 1) return;
    const onBlur = () => {
      sawDialog.current = true;
      setDialogMissing(false);
    };
    const onFocus = () => {
      if (sawDialog.current) go(2);
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    const timer = setTimeout(() => {
      if (!sawDialog.current) setDialogMissing(true);
    }, DIALOG_WAIT_MS);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const current = STEPS[step];

  return (
    <div
      data-testid="android-install-flow"
      data-android-step={current}
      className="flex min-h-[70vh] flex-col gap-8"
    >
      <div className="flex items-center gap-2">
        {STEPS.map((id, idx) => (
          <div
            key={id}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              idx <= step ? "bg-primary-light" : "bg-primary-light/20",
            )}
          />
        ))}
      </div>

      {current === "download" && (
        <>
          <h2 className="text-4xl font-bold leading-tight text-balance">
            {t("mtlsInstall.android.download.title")}
          </h2>
          <Button
            data-testid="android-download-button"
            onClick={onDownload}
            variant="outline"
            disabled={isDownloading || !callsign}
            className="h-20 w-full rounded-2xl bg-primary-light hover:bg-primary-light/90 text-2xl font-bold"
          >
            {isDownloading ? (
              <Loader2 className="mr-3 h-7 w-7 animate-spin" />
            ) : (
              <Download className="mr-3 h-7 w-7" />
            )}
            {t("mtlsInstall.android.download.action")}
          </Button>
        </>
      )}

      {/* The installer dialog covers the middle of the screen, so the password
          lives at the top where it stays readable behind it. */}
      {current === "password" && (
        <>
          <p className="text-xl font-semibold uppercase tracking-wide text-muted-foreground">
            {t("mtlsInstall.android.password.label")}
          </p>
          <p
            data-testid="android-password"
            className="-mt-4 font-mono font-bold leading-none break-all text-[clamp(3rem,17vw,6rem)]"
          >
            {callsign}
          </p>

          {dialogMissing ? (
            <div
              data-testid="android-open-download"
              className="flex items-start gap-3 rounded-2xl border-2 border-primary-light p-4"
            >
              <ArrowUp className="h-8 w-8 shrink-0 animate-bounce text-primary-light" />
              <div>
                <p className="text-xl font-bold">
                  {t("mtlsInstall.android.password.openDownload")}
                </p>
                <p className="mt-1 font-mono text-sm break-all text-muted-foreground">
                  {fileName}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xl text-muted-foreground">
              {t("mtlsInstall.android.password.hint")}
            </p>
          )}

          <Button
            data-testid="android-copy-password"
            data-copied={isCopied ? "true" : "false"}
            onClick={() => handleCopy(callsign)}
            variant="outline"
            className="h-16 w-full rounded-2xl bg-primary-light hover:bg-primary-light/90 text-xl font-bold"
          >
            {isCopied ? (
              <Check className="mr-3 h-6 w-6" />
            ) : (
              <Copy className="mr-3 h-6 w-6" />
            )}
            {t("mtlsInstall.android.password.action")}
          </Button>

          <Button
            data-testid="android-next-button"
            onClick={() => go(2)}
            variant="ghost"
            className="mt-auto h-14 w-full rounded-2xl border-2 text-lg text-white"
          >
            {t("mtlsInstall.android.password.next")}
          </Button>
        </>
      )}

      {current === "done" && (
        <>
          <h2 className="text-4xl font-bold leading-tight text-balance">
            {t("mtlsInstall.android.done.title")}
          </h2>
          <a data-testid="android-navigate-link" href={mtlsUrl}>
            <Button
              variant="outline"
              className="h-20 w-full rounded-2xl bg-primary-light hover:bg-primary-light/90 text-2xl font-bold"
            >
              {t("mtlsInstall.android.done.action")}
            </Button>
          </a>
          <Button
            data-testid="android-back-button"
            onClick={() => go(1)}
            variant="ghost"
            className="text-muted-foreground"
          >
            {t("mtlsInstall.android.done.retry")}
          </Button>
        </>
      )}

      <Button
        data-testid="android-other-platform"
        variant="link"
        size="sm"
        className="mt-auto text-muted-foreground"
        onClick={onUseOtherPlatform}
      >
        {t("mtlsInstall.android.notAndroid")}
      </Button>
    </div>
  );
}
