"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ChevronLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEP_KEY = "mtls_android_step";
const STEPS = ["download", "install", "done"] as const;
// Android opens the installer within a second; past this it is not coming.
const DIALOG_WAIT_MS = 3500;

interface AndroidInstallFlowProps {
  callsign: string;
  fileName: string;
  mtlsUrl: string;
  onDownload: () => void;
  isDownloading: boolean;
  downloadCount: number;
  onUseOtherPlatform: () => void;
}

export function AndroidInstallFlow({
  callsign,
  fileName,
  mtlsUrl,
  onDownload,
  isDownloading,
  downloadCount,
  onUseOtherPlatform,
}: AndroidInstallFlowProps) {
  const { t } = useTranslation();

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
  // We cannot see where the system dialog sits, how big it is, or that it
  // dims us: innerHeight, visualViewport and elementFromPoint are all
  // unchanged while it is up. Losing focus is the only signal, so it drives
  // both the emphasis and the second copy of the instruction.
  const [dialogOpen, setDialogOpen] = useState(false);
  const sawDialog = useRef(false);

  const go = (next: number) => {
    localStorage.setItem(STEP_KEY, `${owner}:${next}`);
    setStep(next);
  };

  // Every completed download moves the flow on, including repeats. Keying off
  // the stored cert_downloaded flag instead would pin the user forward, since
  // it never clears once set.
  const seenDownloads = useRef(downloadCount);
  useEffect(() => {
    if (downloadCount === seenDownloads.current) return;
    seenDownloads.current = downloadCount;
    go(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloadCount]);

  useEffect(() => {
    if (step !== 1) return;
    const onBlur = () => {
      sawDialog.current = true;
      setDialogMissing(false);
      setDialogOpen(true);
    };
    const onFocus = () => {
      setDialogOpen(false);
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
      className="flex flex-1 flex-col gap-8"
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
        </>
      )}

      {/* The installer dialogs cover the middle of the screen, so the one
          instruction lives at the top where it stays readable behind them. */}
      {current === "install" && (
        <>
          <p
            data-testid="android-press-ok"
            className={cn(
              "font-bold leading-none text-[clamp(2.5rem,13vw,4.5rem)]",
              dialogOpen && "animate-attention",
            )}
          >
            {t("mtlsInstall.android.install.title")}
          </p>

          {dialogMissing ? (
            <div
              data-testid="android-open-download"
              className="flex items-start gap-3 rounded-2xl border-2 border-primary-light p-4"
            >
              <ArrowUp className="h-8 w-8 shrink-0 animate-bounce text-primary-light" />
              <div>
                <p className="text-xl font-bold">
                  {t("mtlsInstall.android.install.openDownload")}
                </p>
                <p className="mt-1 font-mono text-sm break-all text-muted-foreground">
                  {fileName}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-2xl text-muted-foreground">
              {t("mtlsInstall.android.install.hint")}
            </p>
          )}
        </>
      )}

      {current === "done" && (
        <>
          <h2 className="text-4xl font-bold leading-tight text-balance">
            {t("mtlsInstall.android.done.title")}
          </h2>
        </>
      )}

      <div className="mt-auto flex items-center justify-between">
        {step > 0 ? (
          <Button
            data-testid="android-back-button"
            variant="link"
            size="sm"
            className="px-0 text-base text-muted-foreground"
            onClick={() => go(step - 1)}
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            {t("common.back")}
          </Button>
        ) : (
          <span />
        )}
        <Button
          data-testid="android-other-platform"
          variant="link"
          size="sm"
          className="px-0 text-muted-foreground"
          onClick={onUseOtherPlatform}
        >
          {t("mtlsInstall.android.notAndroid")}
        </Button>
      </div>

      {current === "download" && (
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
      )}

      {current === "install" && dialogOpen && (
        <p
          data-testid="android-press-ok-bottom"
          aria-hidden="true"
          className="animate-attention text-center text-3xl font-bold"
        >
          {t("mtlsInstall.android.install.title")}
        </p>
      )}

      {current === "install" && (
        <Button
          data-testid="android-next-button"
          onClick={() => go(2)}
          variant="ghost"
          className="h-16 w-full rounded-2xl border-2 text-lg text-white"
        >
          {t("mtlsInstall.android.install.next")}
        </Button>
      )}

      {current === "done" && (
        <a data-testid="android-navigate-link" href={mtlsUrl}>
          <Button
            variant="outline"
            className="h-20 w-full rounded-2xl bg-primary-light hover:bg-primary-light/90 text-2xl font-bold"
          >
            {t("mtlsInstall.android.done.action")}
          </Button>
        </a>
      )}
    </div>
  );
}
