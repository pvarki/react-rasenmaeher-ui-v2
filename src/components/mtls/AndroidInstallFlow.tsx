"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowBigRightDash,
  Check,
  ChevronDown,
  Copy,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import { cn } from "@/lib/utils";

const STEP_KEY = "mtls_android_step";
const STEPS = ["download", "password", "install", "done"] as const;

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
  // ponytail: persisted because installing the cert means leaving Chrome,
  // which often reloads this tab on return.
  const [step, setStep] = useState(() => {
    const stored = Number(localStorage.getItem(STEP_KEY));
    return Number.isInteger(stored) && stored >= 0 && stored < STEPS.length
      ? stored
      : 0;
  });

  const go = (next: number) => {
    localStorage.setItem(STEP_KEY, String(next));
    setStep(next);
  };

  // The download is the whole of step one, so finishing it advances the flow.
  useEffect(() => {
    if (certDownloaded && step === 0) {
      go(1);
    }
  }, [certDownloaded, step]);

  const current = STEPS[step];

  return (
    <div
      data-testid="android-install-flow"
      data-android-step={current}
      className="flex flex-col gap-6"
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

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {t("common.step")} {step + 1} {t("common.of")} {STEPS.length}
        </p>
        <h2 className="text-2xl font-semibold text-balance">
          {t(`mtlsInstall.android.${current}.title`)}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(`mtlsInstall.android.${current}.body`)}
        </p>
      </div>

      {current === "download" && (
        <Button
          data-testid="android-download-button"
          onClick={onDownload}
          variant="outline"
          disabled={isDownloading || !callsign}
          className="h-14 w-full rounded-xl bg-primary-light hover:bg-primary-light/90 text-base font-semibold"
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Download className="w-5 h-5 mr-2" />
          )}
          {isDownloading
            ? t("mtlsInstall.downloading")
            : t("mtlsInstall.android.download.action")}
        </Button>
      )}

      {current === "password" && (
        <>
          <div
            data-testid="android-password"
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("mtlsInstall.android.password.label")}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold break-all">
              {callsign}
            </p>
          </div>
          <Button
            data-testid="android-copy-password"
            data-copied={isCopied ? "true" : "false"}
            onClick={() => handleCopy(callsign)}
            variant="outline"
            className="h-14 w-full rounded-xl bg-primary-light hover:bg-primary-light/90 text-base font-semibold"
          >
            {isCopied ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <Copy className="w-5 h-5 mr-2" />
            )}
            {isCopied
              ? t("mtlsInstall.android.password.copied")
              : t("mtlsInstall.android.password.action")}
          </Button>
        </>
      )}

      {current === "install" && (
        <>
          <p
            data-testid="android-filename"
            className="rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm break-all"
          >
            {fileName}
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {["1", "2", "3"].map((n) => (
              <li key={n}>{t(`mtlsInstall.android.install.steps.${n}`)}</li>
            ))}
          </ol>
          <Collapsible>
            <CollapsibleTrigger
              data-testid="android-install-trouble"
              className="flex w-full items-center justify-between gap-2 text-sm font-semibold hover:opacity-70"
            >
              {t("mtlsInstall.android.install.troubleTitle")}
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 text-sm text-muted-foreground leading-relaxed">
              {t("mtlsInstall.android.install.trouble")}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {current === "done" && (
        <a data-testid="android-navigate-link" href={mtlsUrl}>
          <Button
            variant="outline"
            className="h-14 w-full rounded-xl bg-primary-light hover:bg-primary-light/90 text-base font-semibold"
          >
            {t("mtlsInstall.android.done.action")}
            <ArrowBigRightDash className="w-5 h-5 ml-2" />
          </Button>
        </a>
      )}

      {(current === "password" || current === "install") && (
        <Button
          data-testid="android-next-button"
          onClick={() => go(step + 1)}
          variant="ghost"
          className="h-12 w-full rounded-xl border-2 text-white"
        >
          {t(`mtlsInstall.android.${current}.next`)}
        </Button>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button
          data-testid="android-back-button"
          variant="link"
          size="sm"
          className="px-0 text-muted-foreground"
          disabled={step === 0}
          onClick={() => go(step - 1)}
        >
          {t("common.back")}
        </Button>
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
    </div>
  );
}
