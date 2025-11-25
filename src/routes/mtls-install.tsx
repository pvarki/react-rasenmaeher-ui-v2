"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetCertificate } from "@/hooks/api/useGetCertificate";
import { useUserType } from "@/hooks/auth/useUserType";
import { useTranslation } from "react-i18next";
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

export const Route = createFileRoute("/mtls-install")({
  component: MtlsInstallPage,
});

function MtlsInstallPage() {
  const { callsign: userCallsign } = useUserType();
  const { t } = useTranslation();

  const [callsign, setCallsign] = useState("");
  const [selectedOS, setSelectedOS] = useState("");
  const [userOS, setUserOS] = useState("");
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
    PLATFORM_INSTRUCTIONS[osToShow] || PLATFORM_INSTRUCTIONS.Windows;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background p-4 md:p-6">
      <div className="w-full max-w-3xl space-y-6 md:space-y-8 py-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <MtlsPageHeader deployment={deployment} />

        <MtlsExplanationCard />

        <PlatformSelector
          value={osToShow}
          onValueChange={setSelectedOS}
        />

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
  );
}
