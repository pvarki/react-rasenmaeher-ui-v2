"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, Loader2, RotateCw } from "lucide-react";
import { useWizardStep } from "@/hooks/mtls/useWizardStep";
import { usePageFocus } from "@/hooks/mtls/usePageFocus";
import { useStickyCopy } from "@/hooks/mtls/useStickyCopy";
import { CertProgress } from "./CertProgress";
import { CERT_STEPS } from "./certSteps";
import { IosAlert } from "./IosAlert";
import { IosDialogPreview } from "./IosDialogPreview";
import { IosSettingsStrip } from "./IosSettingsStrip";
import { PasswordCallout } from "./PasswordCallout";
import { WizardAction, WizardConfirm, WizardNav } from "./WizardParts";

const STEP_KEY = "mtls_ios_step";
const SHOT_LANGS = ["fi", "en", "sv"];
const SHOTS = ["install-1", "install-2", "install-3", "install-4"];

interface IosInstallFlowProps {
  callsign: string;
  mtlsUrl: string;
  onDownload: () => void;
  isDownloading: boolean;
  downloadCount: number;
  platformPicker: ReactNode;
}

export function IosInstallFlow({
  callsign,
  mtlsUrl,
  onDownload,
  isDownloading,
  downloadCount,
  platformPicker,
}: IosInstallFlowProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "";
  const shotDir = `/guide/ios/${SHOT_LANGS.includes(lang) ? lang : "en"}`;
  const { step, furthest, go } = useWizardStep(
    STEP_KEY,
    callsign,
    CERT_STEPS.length,
  );
  // Safari's own download alerts blur the page; only a trip to Settings hides it.
  const { returned } = usePageFocus(step === 1, { hiddenOnly: true });
  const { copied, copy } = useStickyCopy(callsign);

  useEffect(() => {
    for (const name of SHOTS) new Image().src = `${shotDir}/${name}.webp`;
    new Image().src = "/guide/ios/settings-icon.webp";
  }, [shotDir]);

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

  return (
    <div
      data-testid="ios-install-flow"
      data-ios-step={current}
      data-returned={returned ? "true" : "false"}
      className="flex min-h-0 flex-1 flex-col gap-5"
    >
      <CertProgress step={step} furthest={furthest} onSelect={go} />

      {current === "download" && (
        <>
          <h1 className="text-4xl font-bold leading-tight text-balance">
            {t("mtlsInstall.ios.download.title")}
          </h1>

          <IosDialogPreview caption={t("mtlsInstall.ios.download.caption")} />

          {nav}
          <WizardAction
            data-testid="mtls-download-button"
            data-mtls-downloading={isDownloading ? "true" : "false"}
            onClick={startDownload}
            disabled={isDownloading || !callsign}
          >
            {isDownloading ? (
              <Loader2 className="size-7 animate-spin" />
            ) : (
              <Download className="size-7" />
            )}
            {t("mtlsInstall.ios.download.action")}
          </WizardAction>
        </>
      )}

      {current === "install" && (
        <>
          <PasswordCallout
            callsign={callsign}
            isCopied={copied}
            onCopy={copy}
          />

          <h1 className="flex items-center gap-3 text-3xl font-bold leading-tight text-balance">
            <SettingsAppIcon />
            {t("mtlsInstall.ios.install.title")}
          </h1>

          <IosSettingsStrip shotDir={shotDir} />

          <button
            type="button"
            data-testid="ios-retry"
            onClick={startDownload}
            disabled={isDownloading || !callsign}
            className="flex min-h-11 items-center justify-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
          >
            <RotateCw className="h-4 w-4" />
            {t("mtlsInstall.ios.install.retry")}
          </button>
          {returned && (
            <p
              data-testid="ios-old-profile"
              className="-mt-3 text-center text-xs leading-snug text-balance text-muted-foreground"
            >
              {t("mtlsInstall.ios.install.oldProfile")}
            </p>
          )}

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

          <figure className="flex min-h-0 flex-1 flex-col justify-center gap-4">
            <IosAlert
              title={t("mtlsInstall.ios.system.certTitle", {
                host: new URL(mtlsUrl, window.location.href).hostname,
              })}
              body={t("mtlsInstall.ios.system.certBody", { callsign })}
              buttons={[
                t("mtlsInstall.ios.system.cancel"),
                t("mtlsInstall.ios.system.continue"),
              ]}
              press={1}
            />
            <figcaption className="text-center text-base leading-snug text-balance text-muted-foreground">
              {t("mtlsInstall.ios.done.caption")}
            </figcaption>
          </figure>

          {nav}
          <WizardAction asChild>
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

function SettingsAppIcon() {
  return (
    <img
      src="/guide/ios/settings-icon.webp"
      alt=""
      aria-hidden="true"
      className="h-12 w-12 shrink-0"
    />
  );
}
