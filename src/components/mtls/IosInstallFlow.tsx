"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Download, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadProfile } from "@/lib/downloadProfile";
import { isIosSafari } from "./platformUtils";

const STEP_KEY = "mtls_ios_step";
// Storage throws outright when site data is blocked. Losing resume is
// survivable; a render-time throw taking the flow down is not.
const readStore = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStore = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // No resume across reloads, but the flow still works in this session.
  }
};
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
  const owner = callsign || readStore("callsign") || "";
  // "<callsign>:<step>:<furthest>". Keeping the furthest step reached means no
  // sequence of taps strands anyone: every screen they have seen stays one tap
  // away, including the one that fetches a fresh profile.
  const [progress, setProgress] = useState(() => {
    const [storedOwner, storedStep, storedMax] = (
      readStore(STEP_KEY) ?? ""
    ).split(":");
    const cur = Number(storedStep);
    const max = Number(storedMax);
    const mine =
      storedOwner &&
      storedOwner === readStore("callsign") &&
      Number.isInteger(cur) &&
      cur >= 0 &&
      cur < STEPS.length;
    const step = mine ? cur : 0;
    const furthest =
      mine && Number.isInteger(max)
        ? Math.min(Math.max(max, step), STEPS.length - 1)
        : step;
    return { step, furthest };
  });
  const { step, furthest } = progress;
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  // The install happens in Settings, so the user always leaves. Returning does
  // not prove they installed - it only means they are back - so this draws the
  // eye to the next action and never moves the step.
  const [returned, setReturned] = useState(false);
  const wasHidden = useRef(false);
  useEffect(() => {
    if (step !== 1) {
      setReturned(false);
      wasHidden.current = false;
      return;
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        wasHidden.current = true;
      } else if (wasHidden.current) {
        setReturned(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [step]);

  const go = (next: number) => {
    const reached = Math.max(furthest, next);
    writeStore(STEP_KEY, `${owner}:${next}:${reached}`);
    setProgress({ step: next, furthest: reached });
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
      {/* Also the navigation: any step already reached stays reachable. */}
      <div className="flex items-center gap-2">
        {STEPS.map((id, idx) => (
          <button
            key={id}
            type="button"
            data-testid={`ios-step-${id}`}
            disabled={idx > furthest}
            aria-current={idx === step ? "step" : undefined}
            aria-label={t(`mtlsInstall.ios.${id}.title`)}
            onClick={() => go(idx)}
            className={cn(
              "h-6 flex-1 rounded-full disabled:cursor-default",
              "before:block before:h-1.5 before:rounded-full before:content-['']",
              idx <= step
                ? "before:bg-primary-light"
                : "before:bg-primary-light/20",
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

      {/* The Settings path is longer than the viewport, so mt-auto alone leaves the
          action below the fold. A sticky bar keeps it under the thumb whatever the
          content height, and the list scrolls behind it. */}
      <div className="sticky bottom-0 mt-auto flex flex-col gap-4 bg-background pb-1 pt-4">
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
