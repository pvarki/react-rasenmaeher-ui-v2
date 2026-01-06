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

  useEffect(() => {
    setShowGuide(true);
  }, []);

  const osToShow = selectedOS || userOS;

  const mtlsUrl = getMtlsUrl();

  const getCertificateMutation = useGetCertificate({
    onSuccess: () => {
      toast.success(t("mtlsInstall.certificateDownloaded"));
    },
    onError: (err) => {
      console.error("Certificate download error:", err);
      toast.error(err.message || t("mtlsInstall.downloadFailed"));
    },
  });

  const handleDownloadKey = () => {
    if (callsign) {
      getCertificateMutation.mutate(callsign);
    } else {
      toast.error(t("mtlsInstall.callsignNotFound"));
    }
  };

  const platformInstructions =
    PLATFORM_INSTRUCTIONS[osToShow] || PLATFORM_INSTRUCTIONS.Android;

  if (isMobile) {
    return (
      <>
        <MtlsGuide open={showGuide} onOpenChange={setShowGuide} />

        <div className="min-h-screen flex flex-col bg-background">
          <div className="flex justify-between items-center p-6 border-b border-border">
            <Button
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

      <div className="min-h-screen flex flex-col items-center justify-start bg-background p-4">
        <div className="w-full max-w-3xl space-y-6 py-8">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
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
          />
        </div>
      </div>
    </>
  );
}
