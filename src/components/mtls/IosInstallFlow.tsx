"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Download, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  onUseOtherPlatform: () => void;
}

export function IosInstallFlow({
  callsign,
  profileUrl,
  mtlsUrl,
  onDownloaded,
  onUseOtherPlatform,
}: IosInstallFlowProps) {
  const { t } = useTranslation();

  // Same scoping as the Android flow: progress survives leaving for Settings,
  // but the next person to enrol on this device starts from the top.
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
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  const go = (next: number) => {
    localStorage.setItem(STEP_KEY, `${owner}:${next}`);
    setStep(next);
  };

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
            {t("mtlsInstall.ios.download.title")}
          </h2>

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
            <p data-testid="ios-download-failed" className="text-xl font-bold">
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

          <ol className="flex flex-col gap-4">
            {INSTALL_STEPS.map((n, idx) => (
              <li key={n} className="flex items-start gap-3 text-2xl">
                <span className="font-bold text-primary-light">{idx + 1}.</span>
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
        <h2 className="text-4xl font-bold leading-tight text-balance">
          {t("mtlsInstall.ios.done.title")}
        </h2>
      )}

      <div className="mt-auto flex items-center justify-between">
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
        <Button
          data-testid="ios-other-platform"
          variant="link"
          size="sm"
          className="px-0 text-muted-foreground"
          onClick={onUseOtherPlatform}
        >
          {t("mtlsInstall.ios.notIos")}
        </Button>
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
          onClick={() => go(2)}
          variant="ghost"
          className="h-16 w-full rounded-2xl border-2 text-lg text-white"
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
  );
}
