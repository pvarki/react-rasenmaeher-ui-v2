"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetCertificate } from "@/hooks/api/useGetCertificate";
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
import { downloadProfile, profileUrl } from "@/lib/downloadProfile";
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

function MtlsInstallPage() {
  const { callsign: userCallsign } = useUserType();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [callsign, setCallsign] = useState("");
  const [selectedOS, setSelectedOS] = useState("");
  const [userOS, setUserOS] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [forceClassic, setForceClassic] = useState(false);
  const [certDownloaded, setCertDownloaded] = useState<boolean>(
    () => localStorage.getItem("cert_downloaded") === "true",
  );
  // Counts completed downloads rather than tracking a flag: re-downloading has
  // to move the Android flow on again, and the flag is already true by then.
  const [downloadCount, setDownloadCount] = useState(0);
  const { deployment } = useHealthCheck();

  useEffect(() => {
    setUserOS(getOperatingSystem());
  }, []);

  useEffect(() => {
    const storedCallsign = localStorage.getItem("callsign");
    if (storedCallsign) {
      setCallsign(storedCallsign);
    } else if (userCallsign) {
      setCallsign(userCallsign);
    }
  }, [userCallsign]);

  // The guided flows walk the user through it, so the guide would only be in the way.
  useEffect(() => {
    if (!userOS) return;
    const guidedPhone =
      (userOS === "Android" || userOS === "iOS") &&
      window.matchMedia("(max-width: 767px)").matches;
    setShowGuide(!guidedPhone);
  }, [userOS]);

  const osToShow = selectedOS || userOS;

  const mtlsUrl = getMtlsUrl();

  const useAndroidFlow = isMobile && osToShow === "Android" && !forceClassic;
  const useIosFlow = isMobile && osToShow === "iOS" && !forceClassic;
  const useStepFlow = useAndroidFlow || useIosFlow;
  // Apple cannot import a password-less PKCS12 at all, so both get the profile instead.
  const applePlatform = osToShow === "iOS" || osToShow === "MacOS";

  const getCertificateMutation = useGetCertificate({
    onSuccess: () => {
      localStorage.setItem("cert_downloaded", "true");
      setCertDownloaded(true);
      setDownloadCount((n) => n + 1);
      if (!useStepFlow) {
        toast.success(t("mtlsInstall.certificateDownloaded"));
      }
    },
    onError: (err) => {
      console.error("Certificate download error:", err);
      toast.error(err.message || t("mtlsInstall.downloadFailed"));
    },
  });

  const canNavigate = certDownloaded;

  const handleDownloadKey = () => {
    if (!callsign) {
      toast.error(t("mtlsInstall.callsignNotFound"));
      return;
    }
    if (applePlatform) {
      localStorage.setItem("cert_downloaded", "true");
      setCertDownloaded(true);
      downloadProfile(profileUrl(callsign, deployment)).catch((err: Error) => {
        console.error("Profile download error:", err);
        toast.error(err.message || t("mtlsInstall.downloadFailed"));
      });
      return;
    }
    getCertificateMutation.mutate({ callsign, deployment });
  };

  const platformInstructions =
    PLATFORM_INSTRUCTIONS[osToShow] || PLATFORM_INSTRUCTIONS.Android;

  if (isMobile) {
    return (
      <>
        <MtlsGuide open={showGuide} onOpenChange={setShowGuide} />

        <div
          data-testid="mtls-install-page"
          data-mtls-layout="mobile"
          data-mtls-os={osToShow || ""}
          className="h-dvh flex flex-col bg-background"
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

          <div className="flex-1 min-h-0 flex flex-col items-center justify-start overflow-y-auto p-6">
            <div
              className={
                useStepFlow
                  ? "flex w-full max-w-6xl flex-1"
                  : "w-full max-w-6xl space-y-8 py-8"
              }
            >
              {!useStepFlow && <MtlsPageHeader deployment={deployment} />}

              {useAndroidFlow ? (
                <AndroidInstallFlow
                  callsign={callsign}
                  fileName={`${callsign}_${deployment}.pfx`}
                  mtlsUrl={mtlsUrl}
                  onDownload={handleDownloadKey}
                  isDownloading={getCertificateMutation.isLoading}
                  downloadCount={downloadCount}
                  onUseOtherPlatform={() => setForceClassic(true)}
                />
              ) : useIosFlow ? (
                <IosInstallFlow
                  callsign={callsign}
                  profileUrl={profileUrl(callsign, deployment)}
                  mtlsUrl={mtlsUrl}
                  onDownloaded={() => {
                    localStorage.setItem("cert_downloaded", "true");
                    setCertDownloaded(true);
                  }}
                  onUseOtherPlatform={() => setForceClassic(true)}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-max">
                  <div className="lg:col-span-1 space-y-6">
                    <PlatformSelector
                      value={osToShow}
                      onValueChange={setSelectedOS}
                    />
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
              )}
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

          <PlatformSelector value={osToShow} onValueChange={setSelectedOS} />

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
