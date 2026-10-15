"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetCertificate } from "@/hooks/api/useGetCertificate";
import {
  useGuidePreferences,
  withGuidePreference,
} from "@/hooks/useGuidePreferences";
import { useUserType } from "@/hooks/auth/useUserType";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { MtlsInstructions } from "@/components/mtls/MtlsInstructions";
import { MtlsCallsignDisplay } from "@/components/mtls/MtlsCallsignDisplay";
import { MtlsExplanationCard } from "@/components/mtls/MtlsExplanationCard";
import { MtlsPageHeader } from "@/components/mtls/MtlsPageHeader";
import { MtlsActionButtons } from "@/components/mtls/MtlsActionButtons";
import { PlatformSelector } from "@/components/mtls/PlatformSelector";
import { AndroidInstallFlow } from "@/components/mtls/AndroidInstallFlow";
import { IosInstallFlow } from "@/components/mtls/IosInstallFlow";
import { MacInstallFlow } from "@/components/mtls/MacInstallFlow";
import { WinInstallFlow } from "@/components/mtls/WinInstallFlow";
import { LinuxInstallFlow } from "@/components/mtls/LinuxInstallFlow";
import { CompactHeader } from "@/components/CompactHeader";
import { readStore, writeStore } from "@/lib/safeStorage";
import {
  getOperatingSystem,
  getMtlsUrl,
  PLATFORM_INSTRUCTIONS,
} from "@/components/mtls/platformUtils";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";
import { HelpCircle } from "lucide-react";
import { MtlsGuide } from "@/components/guides";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mtls-install")({
  component: MtlsInstallPage,
});

// Platforms we walk through the install one screen at a time.
const GUIDED = ["Android", "iOS"];
const GUIDED_DESKTOP = ["MacOS", "Windows", "Linux"];

function MtlsInstallPage() {
  const { callsign: userCallsign } = useUserType();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [callsign, setCallsign] = useState("");
  const [selectedOS, setSelectedOS] = useState("");
  const [userOS, setUserOS] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [forceClassic, setForceClassic] = useState(false);
  const { autoOpen } = useGuidePreferences();
  const [certDownloaded, setCertDownloaded] = useState<boolean>(
    () => readStore("cert_downloaded") === "true",
  );
  // Counts completed downloads rather than tracking a flag: re-downloading has
  // to move the Android flow on again, and the flag is already true by then.
  const [downloadCount, setDownloadCount] = useState(0);
  const { deployment } = useHealthCheck();

  useEffect(() => {
    setUserOS(getOperatingSystem());
  }, []);

  useEffect(() => {
    const storedCallsign = readStore("callsign");
    if (storedCallsign) {
      setCallsign(storedCallsign);
    } else if (userCallsign) {
      setCallsign(userCallsign);
    }
  }, [userCallsign]);

  const osToShow = selectedOS || userOS;
  const isGuidedOS = (os: string) =>
    (isMobile ? GUIDED : GUIDED_DESKTOP).includes(os);
  const guided = isGuidedOS(osToShow) && !forceClassic;

  useEffect(() => {
    if (!userOS) return;
    // The guided flows are the walkthrough, so the guide would only cover them.
    // The help button still opens it; only the uninvited appearance stops.
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const guidedNow = (narrow ? GUIDED : GUIDED_DESKTOP).includes(userOS);
    if (autoOpen && !guidedNow) setShowGuide(true);
  }, [autoOpen, userOS]);

  const mtlsUrl = withGuidePreference(getMtlsUrl());

  const getCertificateMutation = useGetCertificate({
    onSuccess: () => {
      writeStore("cert_downloaded", "true");
      setCertDownloaded(true);
      setDownloadCount((n) => n + 1);
      // The guided flow moves to the next screen instead, which says more.
      if (!guided) toast.success(t("mtlsInstall.certificateDownloaded"));
    },
    onError: (err) => {
      console.error("Certificate download error:", err);
      toast.error(err.message || t("mtlsInstall.downloadFailed"));
    },
  });

  const canNavigate = certDownloaded;

  const handleDownloadKey = () => {
    if (callsign) {
      getCertificateMutation.mutate({ callsign, deployment });
    } else {
      toast.error(t("mtlsInstall.callsignNotFound"));
    }
  };

  // Picking a platform we guide goes to its flow; anything else falls back to
  // the full instructions. Without clearing forceClassic, choosing Android here
  // would strand the user in the classic layout.
  const chooseOS = (next: string) => {
    setSelectedOS(next);
    setForceClassic(!isGuidedOS(next));
  };

  const platformInstructions =
    PLATFORM_INSTRUCTIONS[osToShow] || PLATFORM_INSTRUCTIONS.Android;

  if (guided && !isMobile) {
    return (
      <>
        <MtlsGuide open={showGuide} onOpenChange={setShowGuide} />

        <div
          data-testid="mtls-install-page"
          data-mtls-layout="guided-desktop"
          data-mtls-os={osToShow}
          className="flex min-h-dvh flex-col bg-background px-6 py-6"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10">
            <CompactHeader
              deployment={deployment}
              onHelp={() => setShowGuide(true)}
            />
            <div className="my-auto pb-10">
              {osToShow === "Linux" ? (
                <LinuxInstallFlow
                  callsign={callsign}
                  deployment={deployment}
                  fileName={`${callsign}_${deployment}.pfx`}
                  mtlsUrl={mtlsUrl}
                  onDownload={handleDownloadKey}
                  isDownloading={getCertificateMutation.isLoading}
                  downloadCount={downloadCount}
                  platformPicker={
                    <PlatformSelector
                      value={osToShow}
                      onValueChange={chooseOS}
                      triggerLabel={t("mtlsInstall.linux.notLinux")}
                    />
                  }
                />
              ) : osToShow === "Windows" ? (
                <WinInstallFlow
                  callsign={callsign}
                  deployment={deployment}
                  fileName={`${callsign}_${deployment}.pfx`}
                  mtlsUrl={mtlsUrl}
                  onDownload={handleDownloadKey}
                  isDownloading={getCertificateMutation.isLoading}
                  downloadCount={downloadCount}
                  platformPicker={
                    <PlatformSelector
                      value={osToShow}
                      onValueChange={chooseOS}
                      triggerLabel={t("mtlsInstall.win.notWindows")}
                    />
                  }
                />
              ) : (
                <MacInstallFlow
                  callsign={callsign}
                  deployment={deployment}
                  fileName={`${callsign}_${deployment}.pfx`}
                  mtlsUrl={mtlsUrl}
                  onDownload={handleDownloadKey}
                  isDownloading={getCertificateMutation.isLoading}
                  downloadCount={downloadCount}
                  platformPicker={
                    <PlatformSelector
                      value={osToShow}
                      onValueChange={chooseOS}
                      triggerLabel={t("mtlsInstall.mac.notMac")}
                    />
                  }
                />
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (guided) {
    return (
      <>
        <MtlsGuide open={showGuide} onOpenChange={setShowGuide} />

        <div
          data-testid="mtls-install-page"
          data-mtls-layout="guided"
          data-mtls-os={osToShow}
          className="flex h-dvh flex-col bg-background px-4 pb-4 pt-4"
        >
          <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-4">
            <CompactHeader
              deployment={deployment}
              onHelp={() => setShowGuide(true)}
            />

            {osToShow === "iOS" ? (
              <IosInstallFlow
                callsign={callsign}
                mtlsUrl={mtlsUrl}
                onDownload={handleDownloadKey}
                isDownloading={getCertificateMutation.isLoading}
                downloadCount={downloadCount}
                platformPicker={
                  <PlatformSelector
                    value={osToShow}
                    onValueChange={chooseOS}
                    triggerLabel={t("mtlsInstall.ios.notIos")}
                  />
                }
              />
            ) : (
              <AndroidInstallFlow
                callsign={callsign}
                fileName={`${callsign}_${deployment}.pfx`}
                mtlsUrl={mtlsUrl}
                onDownload={handleDownloadKey}
                isDownloading={getCertificateMutation.isLoading}
                downloadCount={downloadCount}
                platformPicker={
                  <PlatformSelector
                    value={osToShow}
                    onValueChange={chooseOS}
                    triggerLabel={t("mtlsInstall.android.notAndroid")}
                  />
                }
              />
            )}
          </div>
        </div>
      </>
    );
  }

  if (isMobile) {
    return (
      <>
        <MtlsGuide open={showGuide} onOpenChange={setShowGuide} />

        <div
          data-testid="mtls-install-page"
          data-mtls-layout="mobile"
          data-mtls-os={osToShow || ""}
          className="min-h-screen flex flex-col bg-background"
        >
          <div className="flex justify-between items-center p-6 border-b border-border">
            <Button
              data-testid="mtls-help-button"
              variant="ghost"
              size="icon"
              onClick={() => setShowGuide(true)}
              aria-label={t("common.help")}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <LanguageSwitcher />
          </div>

          <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto p-6">
            <div className="w-full max-w-6xl space-y-8 py-8">
              <MtlsPageHeader deployment={deployment} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-max">
                <div className="lg:col-span-1 space-y-6">
                  <PlatformSelector value={osToShow} onValueChange={chooseOS} />
                  <MtlsCallsignDisplay callsign={callsign} />
                  <MtlsActionButtons
                    onDownload={handleDownloadKey}
                    isDownloading={getCertificateMutation.isLoading}
                    mtlsUrl={mtlsUrl}
                    disabled={!callsign}
                    canNavigate={canNavigate}
                  />
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <MtlsExplanationCard />
                  <MtlsInstructions instructions={platformInstructions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MtlsGuide open={showGuide} onOpenChange={setShowGuide} />

      <div
        data-testid="mtls-install-page"
        data-mtls-layout="desktop"
        data-mtls-os={osToShow || ""}
        className="min-h-screen flex flex-col items-center justify-start bg-background p-4"
      >
        <div className="w-full max-w-3xl space-y-6 py-8">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              data-testid="mtls-help-button"
              variant="ghost"
              size="icon"
              onClick={() => setShowGuide(true)}
              aria-label={t("common.help")}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <LanguageSwitcher />
          </div>

          <MtlsPageHeader deployment={deployment} />

          <MtlsExplanationCard />

          <PlatformSelector value={osToShow} onValueChange={chooseOS} />

          <MtlsInstructions instructions={platformInstructions} />

          <MtlsCallsignDisplay callsign={callsign} />

          <MtlsActionButtons
            onDownload={handleDownloadKey}
            isDownloading={getCertificateMutation.isLoading}
            mtlsUrl={mtlsUrl}
            disabled={!callsign}
            canNavigate={canNavigate}
          />
        </div>
      </div>
    </>
  );
}

export default MtlsInstallPage;
