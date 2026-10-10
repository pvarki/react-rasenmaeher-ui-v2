"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy, Download, Loader2, RotateCw } from "lucide-react";
import { useWizardStep } from "@/hooks/mtls/useWizardStep";
import { usePageFocus } from "@/hooks/mtls/usePageFocus";
import { useStickyCopy } from "@/hooks/mtls/useStickyCopy";
import { cn } from "@/lib/utils";
import { CertProgress } from "./CertProgress";
import { CERT_STEPS } from "./certSteps";
import { PasswordCallout } from "./PasswordCallout";
import { WizardAction, WizardConfirm, WizardNav } from "./WizardParts";
import {
  ChromeCertImport,
  ChromeLinuxCertPicker,
  ChromePassword,
  FirefoxCertManager,
  FirefoxCertPicker,
  FirefoxPassword,
} from "./LinuxDialogs";

const STEP_KEY = "mtls_linux_step";
// Pasted into the address bar; pages can't link to browser-internal URLs.
const MANAGER_URL = {
  firefox: "chrome://pippki/content/certManager.xhtml",
  chrome: "chrome://certificate-manager/clientcerts/platformclientcerts",
};

interface LinuxInstallFlowProps {
  callsign: string;
  deployment: string;
  fileName: string;
  mtlsUrl: string;
  onDownload: () => void;
  isDownloading: boolean;
  downloadCount: number;
  platformPicker: ReactNode;
}

export function LinuxInstallFlow({
  callsign,
  deployment,
  fileName,
  mtlsUrl,
  onDownload,
  isDownloading,
  downloadCount,
  platformPicker,
}: LinuxInstallFlowProps) {
  const { t } = useTranslation();
  const browser = /Firefox\//.test(navigator.userAgent) ? "firefox" : "chrome";
  const { step, furthest, go } = useWizardStep(
    STEP_KEY,
    callsign,
    CERT_STEPS.length,
  );
  const { returned } = usePageFocus(step === 1);
  const { copied: pwCopied, copy: copyPw } = useStickyCopy(callsign);
  const { copied: urlCopiedOnce, copy: copyUrlRaw } = useStickyCopy(
    MANAGER_URL[browser],
  );
  // One clipboard: only the thing copied last may show as copied.
  const [onClipboard, setOnClipboard] = useState<"pw" | "url" | null>(null);
  const copy = () => {
    copyPw();
    setOnClipboard("pw");
  };
  const copyUrl = () => {
    copyUrlRaw();
    setOnClipboard("url");
  };
  const copied = pwCopied && onClipboard === "pw";
  const urlCopied = urlCopiedOnce && onClipboard === "url";
  const k = (key: string) => `mtlsInstall.linux.${browser}.${key}`;
  const host = new URL(mtlsUrl, window.location.href).hostname;

  const seenDownloads = useRef(downloadCount);
  useEffect(() => {
    if (downloadCount === seenDownloads.current) return;
    seenDownloads.current = downloadCount;
    go(1);
  }, [downloadCount, go]);

  const startDownload = () => {
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
  const action = "h-16 text-lg";
  const keys = ["Ctrl+N", "Ctrl+V", "Enter"];

  return (
    <div
      data-testid="linux-install-flow"
      data-linux-step={current}
      data-browser={browser}
      data-returned={returned ? "true" : "false"}
      className="flex flex-col gap-5"
    >
      <CertProgress step={step} furthest={furthest} onSelect={go} />

      {current === "download" && (
        <>
          <div className="flex flex-col gap-3 py-10">
            <h1 className="text-4xl font-bold leading-tight">
              {t("mtlsInstall.linux.download.title")}
            </h1>
            <p className="text-lg text-muted-foreground">{t(k("caption"))}</p>
          </div>
          {nav}
          <WizardAction
            data-testid="mtls-download-button"
            data-mtls-downloading={isDownloading ? "true" : "false"}
            onClick={startDownload}
            disabled={isDownloading || !callsign}
            className={action}
          >
            {isDownloading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Download className="size-6" />
            )}
            {t("mtlsInstall.linux.download.action")}
          </WizardAction>
        </>
      )}

      {current === "install" && (
        <>
          <h1 className="text-4xl font-bold leading-tight">{t(k("title"))}</h1>
          <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <ol className="flex flex-col gap-3 text-base">
              {(
                t(k("steps"), {
                  returnObjects: true,
                  fileName,
                }) as string[]
              ).map((line, i) => (
                <li key={i} className="flex flex-col gap-2">
                  <span className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c41010] text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{line}</span>
                  </span>
                  {i === 0 && (
                    <div className="ml-7 flex flex-col gap-2">
                      <button
                        type="button"
                        data-testid="linux-manager-copy"
                        data-copied={urlCopied ? "true" : "false"}
                        onClick={copyUrl}
                        title={MANAGER_URL[browser]}
                        className={cn(
                          "flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold uppercase tracking-[0.08em]",
                          urlCopied
                            ? "bg-success text-white"
                            : "bg-primary-light text-primary-foreground",
                        )}
                      >
                        {urlCopied ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                        {urlCopied
                          ? t("mtlsInstall.linux.copied")
                          : t("mtlsInstall.linux.copy")}
                      </button>
                      <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                        {keys.map((combo, n) => (
                          <span
                            key={combo}
                            className="flex items-center gap-1.5"
                          >
                            {n > 0 && <span aria-hidden="true">→</span>}
                            {combo.split("+").map((key, j) => (
                              <span
                                key={key}
                                className="flex items-center gap-1"
                              >
                                {j > 0 && "+"}
                                <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs text-foreground">
                                  {key}
                                </kbd>
                              </span>
                            ))}
                          </span>
                        ))}
                      </p>
                      <details className="text-sm text-muted-foreground">
                        <summary className="cursor-pointer select-none hover:text-foreground">
                          {t("mtlsInstall.linux.fallback")}
                        </summary>
                        <p className="mt-1">{t(k("fallbackPath"))}</p>
                      </details>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-4">
              {browser === "chrome" && (
                <>
                  <ChromeCertImport mark={2} />
                  <ChromePassword callsign={callsign} mark={4} />
                </>
              )}
              {browser === "firefox" && (
                <>
                  <FirefoxCertManager mark={2} />
                  <FirefoxPassword
                    callsign={callsign}
                    mark={4}
                    buttonMark={4}
                  />
                </>
              )}
              <PasswordCallout
                callsign={callsign}
                isCopied={copied}
                onCopy={copy}
              />
            </div>
          </div>

          <div className="flex text-sm text-muted-foreground">
            <button
              type="button"
              data-testid="linux-retry"
              onClick={startDownload}
              disabled={isDownloading || !callsign}
              className="flex min-h-11 items-center gap-2 underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
            >
              <RotateCw className="h-4 w-4" />
              {t("mtlsInstall.linux.retry")}
            </button>
          </div>
          {nav}
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
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-start">
            <p className="text-lg">{t(k("pick"), { callsign })}</p>
            {browser === "firefox" ? (
              <FirefoxCertPicker host={host} callsign={callsign} />
            ) : (
              <ChromeLinuxCertPicker
                host={host}
                callsign={callsign}
                issuer={`${deployment} Intermediate CA`}
              />
            )}
          </div>
          {nav}
          <WizardAction asChild className={action}>
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
