"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ChevronLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEP_KEY = "mtls_android_step";
// Storage throws outright when site data is blocked. Losing the ability to
// resume is survivable; taking the whole flow down with a render-time throw is
// not, so every access is guarded.
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
// Both copies of the instruction render identically; only their position
// differs, so whichever end the dialog leaves uncovered reads the same.
const INSTRUCTION =
  "text-center font-bold leading-none text-[clamp(2.5rem,13vw,4.5rem)]";

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
  const owner = callsign || readStore("callsign") || "";
  // Stored as "<callsign>:<step>:<furthest>". Keeping the furthest step means
  // going Back is never a one-way trip: someone who has already installed can
  // return to the end without downloading the key a second time.
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
  // Deliberately no focus/blur inference. It read "something took focus", not
  // "the install happened", so any stray interruption advanced the user and a
  // tab reload stranded them. The step now only ever moves on a fact: the
  // download completing, or the user saying so.

  // Leaving the browser is distinguishable from a dialog covering us: only a
  // real app switch fires visibilitychange -> hidden. Coming back still does
  // not prove they installed, so this only draws the eye to the next action.
  // It must never move the step; that is what desynced the flow before.
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

  const current = STEPS[step];

  return (
    <div
      data-testid="android-install-flow"
      data-android-step={current}
      className="flex flex-1 flex-col gap-8"
    >
      {/* Also the navigation: any step already reached stays reachable, so no
          sequence of taps can strand someone on the wrong screen. */}
      <div className="flex items-center gap-2">
        {STEPS.map((id, idx) => (
          <button
            key={id}
            type="button"
            data-testid={`android-step-${id}`}
            disabled={idx > furthest}
            aria-current={idx === step ? "step" : undefined}
            aria-label={t(`mtlsInstall.android.${id}.title`)}
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
            className={cn(INSTRUCTION, "animate-attention")}
          >
            {t("mtlsInstall.android.install.title")}
          </p>

          <p className="text-2xl text-muted-foreground">
            {t("mtlsInstall.android.install.hint")}
          </p>

          {/* Always shown, not after a delay: Samsung does not auto-open the
              download, and its installer appears over the file manager rather
              than over us, so this has to be read before the user leaves. */}
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

      {/* Repeated at the other end: OEMs anchor the dialog top, centre or
          bottom and the page cannot tell which, so one is always readable. */}
      {current === "install" && (
        <p
          data-testid="android-press-ok-bottom"
          aria-hidden="true"
          className={cn(INSTRUCTION, "animate-attention")}
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
