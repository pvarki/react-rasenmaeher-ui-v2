"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ChevronLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideShot } from "./GuideShot";
import { cn } from "@/lib/utils";
import { useWizardStep } from "@/hooks/mtls/useWizardStep";
import { useReturnedFromSystem } from "@/hooks/mtls/useReturnedFromSystem";
import { StepProgress } from "./StepProgress";

const STEP_KEY = "mtls_android_step";
const STEPS = ["download", "install", "done"] as const;
// Both copies of the instruction render identically; only their position
// differs, so whichever end the dialog leaves uncovered reads the same. Only
// one thing on the screen is ever lit: the instruction until the user comes
// back, the continue button afterwards.
const INSTRUCTION =
  "text-center font-bold leading-none text-[clamp(2.5rem,13vw,4.5rem)]";

interface AndroidInstallFlowProps {
  callsign: string;
  fileName: string;
  mtlsUrl: string;
  onDownload: () => void;
  isDownloading: boolean;
  downloadCount: number;
  platformPicker: ReactNode;
}

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
    STEPS.length,
  );
  const returned = useReturnedFromSystem(step === 1);

  // Every completed download moves the flow on, including repeats. Keying off
  // the stored cert_downloaded flag instead would pin the user forward, since
  // it never clears once set.
  const seenDownloads = useRef(downloadCount);
  useEffect(() => {
    if (downloadCount === seenDownloads.current) return;
    seenDownloads.current = downloadCount;
    go(1);
  }, [downloadCount, go]);

  const current = STEPS[step];

  return (
    <div
      data-testid="android-install-flow"
      data-android-step={current}
      className="flex flex-1 flex-col gap-6"
    >
      <StepProgress
        count={STEPS.length}
        step={step}
        furthest={furthest}
        onSelect={go}
        label={(idx) => t(`mtlsInstall.android.${STEPS[idx]}.title`)}
        testId={(idx) => `android-step-${STEPS[idx]}`}
      />

      {current === "download" && (
        <>
          <h2 className="text-4xl font-bold leading-tight text-balance">
            {t("mtlsInstall.android.download.title")}
          </h2>

          <GuideShot
            src="/guide/androidstep1.webp"
            caption={t("mtlsInstall.android.download.caption")}
          />
        </>
      )}

      {/* The installer dialogs cover the middle of the screen, so the one
          instruction lives at the top where it stays readable behind them. */}
      {current === "install" && (
        <>
          <p
            data-testid="android-press-ok"
            className={cn(
              INSTRUCTION,
              returned ? "text-muted-foreground" : "animate-attention",
            )}
          >
            {t("mtlsInstall.android.install.title")}
          </p>

          <p className="text-2xl text-muted-foreground">
            {t("mtlsInstall.android.install.hint")}
          </p>

          {/* Always shown, not after a delay: Samsung does not auto-open the
              download, and its installer appears over the file manager rather
              than over us, so this has to be read before the user leaves. */}
          {/* Emphasis hands over: this is the live instruction until the user
              has been away and come back, at which point the dialog has already
              happened and the next action is the button below, not this. */}
          <div
            data-testid="android-open-download"
            data-muted={returned ? "true" : "false"}
            className={cn(
              "flex items-start gap-3 rounded-2xl border-2 p-4",
              returned ? "border-border" : "border-primary-light",
            )}
          >
            <ArrowUp
              className={cn(
                "h-8 w-8 shrink-0",
                returned
                  ? "text-muted-foreground"
                  : "animate-bounce text-primary-light",
              )}
            />
            <div>
              <p
                className={cn(
                  "text-xl font-bold",
                  returned && "text-muted-foreground",
                )}
              >
                {t("mtlsInstall.android.install.openDownload")}
              </p>
              <p className="mt-1 font-mono text-sm break-all text-muted-foreground">
                {fileName}
              </p>
            </div>
          </div>
        </>
      )}

      {current === "done" && (
        <>
          <h2 className="text-4xl font-bold leading-tight text-balance">
            {t("mtlsInstall.android.done.title")}
          </h2>

          <GuideShot
            src="/guide/androidstep3.webp"
            caption={t("mtlsInstall.android.done.caption")}
          />
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
        {platformPicker}
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

      {/* Repeated at the other end: OEMs anchor the dialog top, centre or
          bottom and the page cannot tell which, so one is always readable. */}
      {current === "install" && (
        <p
          data-testid="android-press-ok-bottom"
          aria-hidden="true"
          className={cn(
            INSTRUCTION,
            returned ? "text-muted-foreground" : "animate-attention",
          )}
        >
          {t("mtlsInstall.android.install.title")}
        </p>
      )}

      {current === "install" && (
        <Button
          data-testid="android-next-button"
          data-returned={returned ? "true" : "false"}
          onClick={() => go(2)}
          variant="ghost"
          className={cn(
            "h-16 w-full rounded-2xl border-2 text-lg text-white",
            returned && "animate-attention border-primary-light",
          )}
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
