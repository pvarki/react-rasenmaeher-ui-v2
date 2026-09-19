"use client";

import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Download, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideShot } from "./GuideShot";
import { cn } from "@/lib/utils";
import { useWizardStep } from "@/hooks/mtls/useWizardStep";
import { useReturnedFromSystem } from "@/hooks/mtls/useReturnedFromSystem";
import { StepProgress } from "./StepProgress";
import { downloadProfile } from "@/lib/downloadProfile";
import { isIosSafari } from "./platformUtils";

const STEP_KEY = "mtls_ios_step";
const STEPS = ["download", "install", "done"] as const;
const INSTALL_STEPS = [1, 2, 3, 4] as const;

interface IosInstallFlowProps {
  callsign: string;
  profileUrl: string;
  mtlsUrl: string;
  onDownloaded: () => void;
  platformPicker: ReactNode;
}

export function IosInstallFlow({
  callsign,
  profileUrl,
  mtlsUrl,
  onDownloaded,
  platformPicker,
}: IosInstallFlowProps) {
  const { t } = useTranslation();

  // Same scoping as the Android flow: progress survives leaving for Settings,
  // but the next person to enrol on this device starts from the top.
  const { step, furthest, go } = useWizardStep(
    STEP_KEY,
    callsign,
    STEPS.length,
  );
  const returned = useReturnedFromSystem(step === 1);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  // Step forward before navigating: the write is synchronous, so the flow is already on the
  // install step whether or not Safari keeps this page around.
  const startDownload = async () => {
    setStarting(true);
    setFailed(false);
    try {
      onDownloaded();
      go(1);
      await downloadProfile(profileUrl);
    } catch {
      // No profile means no install, so go back and let them try again.
      go(0);
      setFailed(true);
      setStarting(false);
    }
  };

  const current = STEPS[step];

  return (
    <div
      data-testid="ios-install-flow"
      data-ios-step={current}
      className="flex flex-1 flex-col gap-6"
    >
      <StepProgress
        count={STEPS.length}
        step={step}
        furthest={furthest}
        onSelect={go}
        label={(idx) => t(`mtlsInstall.ios.${STEPS[idx]}.title`)}
        testId={(idx) => `ios-step-${STEPS[idx]}`}
      />

      {/* The body scrolls, the footer does not. A sticky footer inside the
          scroll area let long content slide underneath it, which hid the
          caption - the one element carrying the meaning of the picture. */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        {current === "download" && (
          <>
            <h2 className="text-4xl font-bold leading-tight text-balance">
              {t("mtlsInstall.ios.download.title")}
            </h2>

            <GuideShot
              src="/guide/iosstep1.webp"
              caption={t("mtlsInstall.ios.download.caption")}
            />

            {/* Chrome and Firefox on iPhone cannot hand a profile to the installer at all. */}
            {!isIosSafari() && (
              <div
                data-testid="ios-not-safari"
                className="flex items-start gap-3 rounded-2xl border-2 border-primary-light p-4"
              >
                <TriangleAlert className="h-8 w-8 shrink-0 text-primary-light" />
                <p className="text-xl font-bold">
                  {t("mtlsInstall.ios.download.notSafari")}
                </p>
              </div>
            )}

            {failed && (
              <p
                data-testid="ios-download-failed"
                className="text-xl font-bold"
              >
                {t("mtlsInstall.ios.download.failed")}
              </p>
            )}
          </>
        )}

        {/* The whole list is on screen at once: the install happens in the Settings app,
          where none of this is visible, so it has to be readable before they leave. */}
        {current === "install" && (
          <>
            <h2 className="text-4xl font-bold leading-tight text-balance">
              {t("mtlsInstall.ios.install.title")}
            </h2>

            <ol className="flex flex-col gap-3">
              {INSTALL_STEPS.map((n, idx) => (
                <li key={n} className="flex items-start gap-3 text-xl">
                  <span className="font-bold text-primary-light">
                    {idx + 1}.
                  </span>
                  <span>{t(`mtlsInstall.ios.install.steps.${n}`)}</span>
                </li>
              ))}
            </ol>

            <div
              data-testid="ios-hurry"
              className="flex items-start gap-3 rounded-2xl border-2 border-primary-light p-4"
            >
              <TriangleAlert className="h-8 w-8 shrink-0 text-primary-light" />
              <p className="text-xl font-bold">
                {t("mtlsInstall.ios.install.hurry")}
              </p>
            </div>
          </>
        )}

        {current === "done" && (
          <>
            <h2 className="text-4xl font-bold leading-tight text-balance">
              {t("mtlsInstall.ios.done.title")}
            </h2>

            <GuideShot
              src="/guide/iosstep3.webp"
              caption={t("mtlsInstall.ios.done.caption")}
            />
          </>
        )}

        {/* The Settings path is longer than the viewport, so mt-auto alone leaves the
          action below the fold. A sticky bar keeps it under the thumb whatever the
          content height, and the list scrolls behind it. */}
      </div>

      <div className="flex shrink-0 flex-col gap-4 pt-2">
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <Button
              data-testid="ios-back-button"
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
          {/* The profile self-deletes after 8 minutes, so a fresh one has to be one
              tap away. An icon, because the flow is not getting more words. */}
          {current === "install" && (
            <Button
              data-testid="ios-redownload"
              variant="ghost"
              size="icon"
              aria-label={t("mtlsInstall.ios.download.action")}
              disabled={starting}
              onClick={startDownload}
            >
              <Download className="h-6 w-6" />
            </Button>
          )}
          {platformPicker}
        </div>

        {current === "download" && (
          <Button
            data-testid="ios-download-button"
            onClick={startDownload}
            variant="outline"
            disabled={starting || !callsign}
            className="h-20 w-full rounded-2xl bg-primary-light hover:bg-primary-light/90 text-2xl font-bold"
          >
            {starting ? (
              <Loader2 className="mr-3 h-7 w-7 animate-spin" />
            ) : (
              <Download className="mr-3 h-7 w-7" />
            )}
            {t("mtlsInstall.ios.download.action")}
          </Button>
        )}

        {/* Nothing observable tells us the install worked: the user is in another app for all
          of it. So this advances on their say-so, and "done" claims nothing more than that. */}
        {current === "install" && (
          <Button
            data-testid="ios-next-button"
            data-returned={returned ? "true" : "false"}
            onClick={() => go(2)}
            variant="ghost"
            className={cn(
              "h-16 w-full rounded-2xl border-2 text-lg text-white",
              returned && "animate-attention border-primary-light",
            )}
          >
            {t("mtlsInstall.ios.install.next")}
          </Button>
        )}

        {current === "done" && (
          <a data-testid="ios-navigate-link" href={mtlsUrl}>
            <Button
              variant="outline"
              className="h-20 w-full rounded-2xl bg-primary-light hover:bg-primary-light/90 text-2xl font-bold"
            >
              {t("mtlsInstall.ios.done.action")}
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
