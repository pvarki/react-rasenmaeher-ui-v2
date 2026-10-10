"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, FileKey, Loader2, RotateCw } from "lucide-react";
import { useWizardStep } from "@/hooks/mtls/useWizardStep";
import { usePageFocus } from "@/hooks/mtls/usePageFocus";
import { useStickyCopy } from "@/hooks/mtls/useStickyCopy";
import { CertProgress } from "./CertProgress";
import { MAC_STEPS } from "./certSteps";
import { MacKeychainStep } from "./MacKeychainStep";
import { PasswordCallout } from "./PasswordCallout";
import { WizardAction, WizardConfirm, WizardNav } from "./WizardParts";
import {
  MacCertPicker,
  MacImportDialog,
  MacKeyAccessDialog,
  MacKeychainAuthDialog,
  SafariCertPicker,
  SafariDownloadDialog,
} from "./MacDialogs";

const STEP_KEY = "mtls_mac_step";

function isSafari() {
  const ua = navigator.userAgent;
  return /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Firefox\//.test(ua);
}

function browserName() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/Chrome\//.test(ua)) return "Google Chrome";
  return null;
}

interface MacInstallFlowProps {
  callsign: string;
  deployment: string;
  fileName: string;
  mtlsUrl: string;
  onDownload: () => void;
  isDownloading: boolean;
  downloadCount: number;
  platformPicker: ReactNode;
}

export function MacInstallFlow({
  callsign,
  deployment,
  fileName,
  mtlsUrl,
  onDownload,
  isDownloading,
  downloadCount,
  platformPicker,
}: MacInstallFlowProps) {
  const { t } = useTranslation();
  const { step, furthest, go } = useWizardStep(
    STEP_KEY,
    callsign,
    MAC_STEPS.length,
  );
  const { returned } = usePageFocus(step === 1);
  const { copied, copy } = useStickyCopy(callsign);
  const loginUrl = `${window.location.origin}/`;
  const browser = browserName();

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

  const current = MAC_STEPS[step];
  const issuer = `${deployment} Intermediate CA`;
  const mtlsHost = new URL(mtlsUrl, window.location.href).hostname;
  const nav = (
    <WizardNav
      step={step}
      onBack={() => go(step - 1)}
      platformPicker={platformPicker}
    />
  );
  const action = "h-16 text-lg";

  return (
    <div
      data-testid="mac-install-flow"
      data-mac-step={current}
      data-returned={returned ? "true" : "false"}
      className="flex flex-col gap-5"
    >
      <CertProgress
        step={step}
        furthest={furthest}
        onSelect={go}
        steps={MAC_STEPS}
      />

      {current === "download" && (
        <>
          <div className="flex flex-col gap-3 py-10">
            <h1 className="text-4xl font-bold leading-tight">
              {t("mtlsInstall.mac.download.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("mtlsInstall.mac.download.caption")}
            </p>
          </div>
          {isSafari() && (
            <figure className="flex max-w-md flex-col gap-3">
              <SafariDownloadDialog host={window.location.hostname} />
              <figcaption className="text-base text-muted-foreground">
                {t("mtlsInstall.mac.download.safari")}
              </figcaption>
            </figure>
          )}
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
            {t("mtlsInstall.mac.download.action")}
          </WizardAction>
        </>
      )}

      {current === "install" && (
        <>
          <h1 className="text-4xl font-bold leading-tight">
            {t("mtlsInstall.mac.install.title")}
          </h1>
          <ol>
            <Numbered n={1} label={t("mtlsInstall.mac.install.open")}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <FileKey className="h-5 w-5 shrink-0 text-primary-light" />
                  <span className="break-all font-mono text-sm">
                    {fileName}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("mtlsInstall.mac.install.openHint")}
                </span>
              </div>
            </Numbered>
          </ol>
          <ol start={2} className="grid gap-6 md:grid-cols-2">
            <Numbered n={2} label={t("mtlsInstall.mac.install.unlock")}>
              <MacKeychainAuthDialog />
            </Numbered>
            <Numbered n={3} label={t("mtlsInstall.mac.install.password")}>
              <MacImportDialog fileName={fileName} callsign={callsign} />
              <PasswordCallout
                callsign={callsign}
                isCopied={copied}
                onCopy={copy}
              />
              <p
                data-testid="mac-come-back"
                className="rounded-lg border-2 border-primary-light px-3 py-2 text-sm font-bold"
              >
                {t("mtlsInstall.mac.install.comeBack")}
              </p>
            </Numbered>
          </ol>
          <div className="flex text-sm text-muted-foreground">
            <button
              type="button"
              data-testid="mac-retry"
              onClick={startDownload}
              disabled={isDownloading || !callsign}
              className="flex min-h-11 items-center gap-2 underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
            >
              <RotateCw className="h-4 w-4" />
              {t("mtlsInstall.mac.install.retry")}
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

      {current === "keychain" && (
        <>
          <h1 className="text-4xl font-bold leading-tight">
            {t("mtlsInstall.mac.keychain.title")}
          </h1>
          <MacKeychainStep
            callsign={callsign}
            issuer={issuer}
            footer={(last, next) => (
              <>
                {nav}
                <WizardConfirm
                  data-testid="mac-keychain-next"
                  lit={false}
                  onClick={last ? () => go(3) : next}
                >
                  {last
                    ? t("mtlsInstall.mac.keychain.done")
                    : t("mtlsInstall.mac.keychain.nextPart")}
                </WizardConfirm>
              </>
            )}
          />
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
          {browser ? (
            <ol className="grid gap-6 md:grid-cols-2">
              <Numbered
                n={1}
                label={t("mtlsInstall.mac.done.pick", { callsign })}
              >
                <MacCertPicker
                  host={mtlsHost}
                  callsign={callsign}
                  issuer={issuer}
                />
              </Numbered>
              <Numbered n={2} label={t("mtlsInstall.mac.done.allowIf")}>
                <MacKeyAccessDialog browser={browser} />
              </Numbered>
            </ol>
          ) : isSafari() ? (
            <ol className="grid max-w-xl gap-6">
              <Numbered n={1} label={t("mtlsInstall.mac.done.safariGo")}>
                <span />
              </Numbered>
              <Numbered
                n={2}
                label={t("mtlsInstall.mac.done.safariLogin", { callsign })}
              >
                <SafariCertPicker host={mtlsHost} callsign={callsign} />
              </Numbered>
            </ol>
          ) : (
            <p className="text-lg text-balance text-muted-foreground">
              {t("mtlsInstall.mac.done.generic", { callsign })}
            </p>
          )}
          {nav}
          <WizardAction asChild className={action}>
            <a
              data-testid="mtls-navigate-link"
              data-mtls-url={isSafari() ? loginUrl : mtlsUrl}
              href={isSafari() ? loginUrl : mtlsUrl}
            >
              {t("mtlsInstall.done.action")}
            </a>
          </WizardAction>
        </>
      )}
    </div>
  );
}

function Numbered({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex min-w-0 flex-col gap-3">
      <p className="flex items-baseline gap-2 text-lg font-bold leading-snug">
        <span className="text-primary-light">{n}.</span>
        <span>{label}</span>
      </p>
      {children}
    </li>
  );
}
