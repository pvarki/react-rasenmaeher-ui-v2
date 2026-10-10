"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Copy,
  Download,
  FileKey,
  Loader2,
  RotateCw,
} from "lucide-react";
import { useWizardStep } from "@/hooks/mtls/useWizardStep";
import { usePageFocus } from "@/hooks/mtls/usePageFocus";
import { useStickyCopy } from "@/hooks/mtls/useStickyCopy";
import { cn } from "@/lib/utils";
import { CertProgress } from "./CertProgress";
import { CERT_STEPS, WIN_FIREFOX_STEPS } from "./certSteps";
import { PasswordCallout } from "./PasswordCallout";
import { WizardAction, WizardConfirm, WizardNav } from "./WizardParts";
import {
  FirefoxCertManager,
  FirefoxCertPicker,
  FirefoxPassword,
  WinCertPicker,
  WinPasswordField,
  WinRadio,
  WinSuccess,
  WinWizardPage,
} from "./WinDialogs";

const STEP_KEY = "mtls_win_step";
// Pasted into Firefox's address bar; pages can't link to chrome:// URLs.
const FF_CERT_MANAGER = "chrome://pippki/content/certManager.xhtml";

interface WinInstallFlowProps {
  callsign: string;
  deployment: string;
  fileName: string;
  mtlsUrl: string;
  onDownload: () => void;
  isDownloading: boolean;
  downloadCount: number;
  platformPicker: ReactNode;
}

export function WinInstallFlow({
  callsign,
  deployment,
  fileName,
  mtlsUrl,
  onDownload,
  isDownloading,
  downloadCount,
  platformPicker,
}: WinInstallFlowProps) {
  const { t } = useTranslation();
  // Firefox doesn't read the Windows certificate store, so it needs its own import.
  const firefox = /Firefox\//.test(navigator.userAgent);
  const steps = firefox ? WIN_FIREFOX_STEPS : CERT_STEPS;
  const { step, furthest, go } = useWizardStep(
    STEP_KEY,
    callsign,
    steps.length,
  );
  const { returned } = usePageFocus(step === 1);
  const { returned: ffReturned } = usePageFocus(steps[step] === "firefox");
  const { copied, copy } = useStickyCopy(callsign);
  const { copied: urlCopied, copy: copyUrl } = useStickyCopy(FF_CERT_MANAGER);
  const s = (k: string) => t(`mtlsInstall.win.system.${k}`);

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

  const current = steps[step];
  const nav = (
    <WizardNav
      step={step}
      onBack={() => go(step - 1)}
      platformPicker={platformPicker}
    />
  );
  const action = "h-16 text-lg";
  const next = s("next");
  const host = new URL(mtlsUrl, window.location.href).hostname;

  return (
    <div
      data-testid="win-install-flow"
      data-win-step={current}
      data-returned={returned ? "true" : "false"}
      className="flex flex-col gap-5"
    >
      <CertProgress
        step={step}
        furthest={furthest}
        onSelect={go}
        steps={steps}
      />

      {current === "download" && (
        <>
          <div className="flex flex-col gap-3 py-10">
            <h1 className="text-4xl font-bold leading-tight">
              {t("mtlsInstall.win.download.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("mtlsInstall.win.download.caption")}
            </p>
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
            {t("mtlsInstall.win.download.action")}
          </WizardAction>
        </>
      )}

      {current === "install" && (
        <>
          <h1 className="text-4xl font-bold leading-tight">
            {t("mtlsInstall.win.install.title")}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <FileKey className="h-5 w-5 shrink-0 text-primary-light" />
              <span className="break-all font-mono text-sm">{fileName}</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {t("mtlsInstall.win.install.openHint")}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <ol className="flex flex-col gap-2 text-base">
              {(
                t("mtlsInstall.win.install.steps", {
                  returnObjects: true,
                }) as string[]
              ).map((line, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c41010] text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-3">
              <WinWizardPage
                title={s("passwordTitle")}
                subtitle={s("passwordSubtitle")}
                next={next}
                mark={3}
              >
                <WinPasswordField callsign={callsign} mark={2} />
              </WinWizardPage>
              <PasswordCallout
                callsign={callsign}
                isCopied={copied}
                onCopy={copy}
              />
            </div>
          </div>

          <details className="group text-sm text-muted-foreground">
            <summary className="cursor-pointer select-none hover:text-foreground">
              {t("mtlsInstall.win.install.showAll")}
            </summary>
            <ol className="mt-3 grid gap-x-4 gap-y-5 md:grid-cols-2">
              {[
                <WinWizardPage
                  key="w"
                  title={s("welcome")}
                  next={next}
                  mark={0}
                >
                  <p className="mb-1">{s("storeLocation")}</p>
                  <div className="flex flex-col gap-1 pl-2">
                    <WinRadio label={s("currentUser")} on />
                    <WinRadio label={s("localMachine")} />
                  </div>
                </WinWizardPage>,
                <WinWizardPage
                  key="f"
                  title={s("fileTitle")}
                  subtitle={s("fileSubtitle")}
                  next={next}
                  mark={0}
                >
                  <p className="truncate rounded border border-black/20 px-2 py-1 font-mono">
                    …\Downloads\{fileName}
                  </p>
                </WinWizardPage>,
                <WinWizardPage
                  key="p"
                  title={s("passwordTitle")}
                  subtitle={s("passwordSubtitle")}
                  next={next}
                  mark={0}
                >
                  <WinPasswordField callsign={callsign} mark={0} />
                </WinWizardPage>,
                <WinWizardPage
                  key="s"
                  title={s("storeTitle")}
                  subtitle={s("storeSubtitle")}
                  next={next}
                  mark={0}
                >
                  <WinRadio label={s("storeAuto")} on />
                </WinWizardPage>,
                <WinWizardPage
                  key="d"
                  title={s("finishTitle")}
                  next={s("finish")}
                  mark={0}
                >
                  <p className="text-black/70">{s("finishBody")}</p>
                </WinWizardPage>,
                <WinSuccess key="ok" ring />,
              ].map((page, i, all) => (
                <li key={i} className="flex min-w-0 flex-col gap-2">
                  <p className="flex items-baseline gap-2 text-foreground">
                    <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground">
                      {i + 1}/{all.length}
                    </span>
                    <span className="font-bold">
                      {
                        (
                          t("mtlsInstall.win.install.pages", {
                            returnObjects: true,
                          }) as string[]
                        )[i]
                      }
                    </span>
                  </p>
                  {page}
                </li>
              ))}
            </ol>
          </details>

          <div className="flex text-sm text-muted-foreground">
            <button
              type="button"
              data-testid="win-retry"
              onClick={startDownload}
              disabled={isDownloading || !callsign}
              className="flex min-h-11 items-center gap-2 underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
            >
              <RotateCw className="h-4 w-4" />
              {t("mtlsInstall.win.install.retry")}
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

      {current === "firefox" && (
        <>
          <h1 className="text-4xl font-bold leading-tight">
            {t("mtlsInstall.win.firefox.title")}
          </h1>
          <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <ol className="flex flex-col gap-3 text-base">
              {(
                t("mtlsInstall.win.firefox.steps", {
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
                        data-testid="ff-cert-manager-copy"
                        data-copied={urlCopied ? "true" : "false"}
                        onClick={copyUrl}
                        title={FF_CERT_MANAGER}
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
                          ? t("mtlsInstall.win.firefox.copied")
                          : t("mtlsInstall.win.firefox.copy")}
                      </button>
                      <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                        {["Ctrl+N", "Ctrl+V", "Enter"].map((keys, k) => (
                          <span
                            key={keys}
                            className="flex items-center gap-1.5"
                          >
                            {k > 0 && <span aria-hidden="true">→</span>}
                            {keys.split("+").map((key, j) => (
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
                          {t("mtlsInstall.win.firefox.fallback")}
                        </summary>
                        <p className="mt-1">
                          {t("mtlsInstall.win.firefox.fallbackPath")}
                        </p>
                      </details>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-4">
              <FirefoxCertManager mark={2} />
              <FirefoxPassword callsign={callsign} mark={4} />
              <PasswordCallout
                callsign={callsign}
                isCopied={copied}
                onCopy={copy}
              />
            </div>
          </div>
          {nav}
          <WizardConfirm
            data-testid="ff-installed-button"
            lit={ffReturned}
            onClick={() => go(3)}
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
            <p className="text-lg">
              {t(
                firefox
                  ? "mtlsInstall.win.done.pickFirefox"
                  : "mtlsInstall.win.done.pick",
                { callsign },
              )}
            </p>
            <div className="flex flex-col gap-4">
              {firefox ? (
                <FirefoxCertPicker host={host} callsign={callsign} />
              ) : (
                <WinCertPicker
                  host={host}
                  callsign={callsign}
                  issuer={`${deployment} Intermediate CA`}
                />
              )}
            </div>
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
