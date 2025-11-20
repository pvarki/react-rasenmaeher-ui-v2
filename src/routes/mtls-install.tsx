"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Key, Download, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetCertificate } from "@/hooks/api/useGetCertificate";
import { useUserType } from "@/hooks/auth/useUserType";
import { useTranslation } from "react-i18next";

function getOperatingSystem() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  const iosPlatforms = ["iPhone", "iPad", "iPod"];

  if (macosPlatforms.indexOf(platform) !== -1) {
    return "MacOS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    return "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    return "Windows";
  } else if (/Android/.test(userAgent)) {
    return "Android";
  } else if (/Linux/.test(platform)) {
    return "Linux";
  }

  return "Unknown";
}

export const Route = createFileRoute("/mtls-install")({
  component: MtlsInstallPage,
});

const PLATFORM_INSTRUCTIONS: Record<
  string,
  { steps: string[]; notes?: string[] }
> = {
  Windows: {
    steps: [
      "mtlsInstall.platforms.Windows.steps.1",
      "mtlsInstall.platforms.Windows.steps.2",
      "mtlsInstall.platforms.Windows.steps.3",
      "mtlsInstall.platforms.Windows.steps.4",
      "mtlsInstall.platforms.Windows.steps.5",
      "mtlsInstall.platforms.Windows.steps.6",
      "mtlsInstall.platforms.Windows.steps.7",
    ],
    notes: [
      "mtlsInstall.platforms.Windows.notes.1",
      "mtlsInstall.platforms.Windows.notes.2",
    ],
  },
  MacOS: {
    steps: [
      "mtlsInstall.platforms.MacOS.steps.1",
      "mtlsInstall.platforms.MacOS.steps.2",
      "mtlsInstall.platforms.MacOS.steps.3",
      "mtlsInstall.platforms.MacOS.steps.4",
      "mtlsInstall.platforms.MacOS.steps.5",
    ],
    notes: [
      "mtlsInstall.platforms.MacOS.notes.1",
      "mtlsInstall.platforms.MacOS.notes.2",
    ],
  },
  Linux: {
    steps: [
      "mtlsInstall.platforms.Linux.steps.1",
      "mtlsInstall.platforms.Linux.steps.2",
      "mtlsInstall.platforms.Linux.steps.3",
      "mtlsInstall.platforms.Linux.steps.4",
      "mtlsInstall.platforms.Linux.steps.5",
      "mtlsInstall.platforms.Linux.steps.6",
      "mtlsInstall.platforms.Linux.steps.7",
    ],
    notes: [
      "mtlsInstall.platforms.Linux.notes.1",
      "mtlsInstall.platforms.Linux.notes.2",
    ],
  },
  Android: {
    steps: [
      "mtlsInstall.platforms.Android.steps.1",
      "mtlsInstall.platforms.Android.steps.2",
      "mtlsInstall.platforms.Android.steps.3",
      "mtlsInstall.platforms.Android.steps.4",
      "mtlsInstall.platforms.Android.steps.5",
      "mtlsInstall.platforms.Android.steps.6",
    ],
    notes: [
      "mtlsInstall.platforms.Android.notes.1",
      "mtlsInstall.platforms.Android.notes.2",
    ],
  },
  iOS: {
    steps: [
      "mtlsInstall.platforms.iOS.steps.1",
      "mtlsInstall.platforms.iOS.steps.2",
      "mtlsInstall.platforms.iOS.steps.3",
      "mtlsInstall.platforms.iOS.steps.4",
      "mtlsInstall.platforms.iOS.steps.5",
      "mtlsInstall.platforms.iOS.steps.6",
      "mtlsInstall.platforms.iOS.steps.7",
    ],
    notes: [
      "mtlsInstall.platforms.iOS.notes.1",
      "mtlsInstall.platforms.iOS.notes.2",
    ],
  },
};

function MtlsInstallPage() {
  const { userType, callsign: userCallsign } = useUserType();
  const { t } = useTranslation();

  const [callsign, setCallsign] = useState("");
  const [selectedOS, setSelectedOS] = useState("");
  const [userOS, setUserOS] = useState("");

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
  const osOptions = [
    { label: t("mtlsInstall.os.Windows"), value: "Windows" },
    { label: t("mtlsInstall.os.MacOS"), value: "MacOS" },
    { label: t("mtlsInstall.os.Linux"), value: "Linux" },
    { label: t("mtlsInstall.os.Android"), value: "Android" },
    { label: t("mtlsInstall.os.iOS"), value: "iOS" },
  ];

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;

  let mtlsHostname = hostname;
  if (!hostname.startsWith("mtls.")) {
    mtlsHostname = `mtls.${hostname}`;
  }

  const baseMtlsUrl = `${protocol}//${mtlsHostname}${port ? `:${port}` : ""}/`;

  let mtlsUrl = baseMtlsUrl;
  if (userType === "admin") {
    mtlsUrl += "";
  } else if (userType === "user" && callsign) {
    mtlsUrl += "";
  }

  const getCertificateMutation = useGetCertificate({
    onSuccess: () => {
      console.log("Certificate downloaded successfully");
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
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20">
              <Key className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-balance">
            {t("mtlsInstall.title")}
          </h2>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto leading-relaxed">
            {t("mtlsInstall.description")}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t("mtlsInstall.whatIsTitle")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("mtlsInstall.whatIsDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            {t("mtlsInstall.choosePlatform")}
            {osToShow &&
              ` (${osOptions.find((o) => o.value === osToShow)?.label})`}
          </label>
          <Select value={osToShow} onValueChange={setSelectedOS}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder={t("mtlsInstall.selectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {osOptions.map((os) => (
                <SelectItem key={os.value} value={os.value}>
                  {os.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold">{t("mtlsInstall.instructionsTitle")}</h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
            {platformInstructions.steps.map((keyOrText, idx) => (
              <li key={idx} className="pl-2">
                {t(keyOrText)}
              </li>
            ))}
          </ol>

          {platformInstructions.notes &&
            platformInstructions.notes.length > 0 && (
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-accent">{t("mtlsInstall.note")}</p>
                <ul className="list-disc list-inside space-y-1">
                  {platformInstructions.notes.map((noteKey, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground pl-1"
                    >
                      {t(noteKey)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div className="pt-2 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">{t("mtlsInstall.passwordLabel")}</span>{" "}
              <span className="font-mono font-semibold text-foreground bg-card px-2 py-0.5 rounded inline-block mt-1">
                {callsign}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4">
          <Button
            onClick={handleDownloadKey}
            className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-xl"
            disabled={getCertificateMutation.isLoading || !callsign}
          >
            {getCertificateMutation.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("mtlsInstall.downloading")}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {t("mtlsInstall.downloadButton")}
              </>
            )}
          </Button>
          <a href={mtlsUrl} className="flex-1">
            <Button
              variant="outline"
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl border-2"
            >
              {t("mtlsInstall.navigateButton")}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
