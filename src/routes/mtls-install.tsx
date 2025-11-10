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
      "Download your certificate using the button below",
      "Double-click the .pfx file to open the Certificate Import Wizard",
      "Select 'Current User' or 'Local Machine' (Current User is recommended)",
      "Choose 'Automatically select the certificate store based on the type of certificate'",
      "When prompted for a password, enter your callsign",
      "Click 'Finish' to complete the installation",
      "Use the 'Navigate with your key' button to access services",
    ],
    notes: [
      "The certificate will be stored in your Windows Certificate Store",
      "You may need to restart your browser for the certificate to be recognized",
    ],
  },
  MacOS: {
    steps: [
      "Download your certificate using the button below",
      "Double-click the .pfx file to open Keychain Access",
      "When prompted, enter your callsign as the password",
      "Verify the certificate was added to your login Keychain",
      "Use the 'Navigate with your key' button to access services",
    ],
    notes: [
      "macOS will automatically install the certificate to Keychain",
      "If prompted about trust, select 'Always Trust' for this application",
    ],
  },
  Linux: {
    steps: [
      "Download your certificate using the button below",
      "Convert the .pfx to PEM format: openssl pkcs12 -in [certificate].pfx -out [certificate].pem -nodes",
      "When prompted, enter your callsign as the password",
      "Place the certificate in your browser's certificate directory or system store",
      "For Firefox: Settings → Privacy → Certificates → View Certificates → Import",
      "For Chrome: Settings → Privacy and security → Security → Manage certificates → Import",
      "Use the 'Navigate with your key' button to access services",
    ],
    notes: [
      "The exact process depends on your Linux distribution and browser",
      "You may need to restart your browser after importing the certificate",
    ],
  },
  Android: {
    steps: [
      "Download your certificate using the button below",
      "Open Settings → Security → Encryption and credentials → Install a certificate",
      "Select 'Certificate' and choose the .pfx file",
      "When prompted, enter your callsign as the password",
      "Name the certificate and confirm installation",
      "Use the 'Navigate with your key' button to access services",
    ],
    notes: [
      "Android must be running version 4.4 or later",
      "The certificate will be added to your system's trusted certificate store",
    ],
  },
  iOS: {
    steps: [
      "Download your certificate using the button below",
      "Tap the file to open it, then tap 'Allow' to install",
      "Go to Settings → General → VPN & Device Management",
      "Tap the certificate under 'Downloaded Profile'",
      "When prompted, enter your callsign as the password",
      "Tap 'Install' twice to confirm",
      "Use the 'Navigate with your key' button to access services",
    ],
    notes: [
      "iOS requires the certificate to be trusted before use",
      "You may see a prompt asking to allow certificate installation",
    ],
  },
};

function MtlsInstallPage() {
  const { userType, callsign: userCallsign } = useUserType();

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
    { label: "Windows", value: "Windows" },
    { label: "MacOS", value: "MacOS" },
    { label: "Linux", value: "Linux" },
    { label: "Android", value: "Android" },
    { label: "iOS", value: "iOS" },
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
      toast.success("Certificate downloaded successfully!");
    },
    onError: (err) => {
      console.error("Certificate download error:", err);
      toast.error(err.message || "Failed to download certificate");
    },
  });

  const handleDownloadKey = () => {
    if (callsign) {
      getCertificateMutation.mutate(callsign);
    } else {
      toast.error("Callsign not found");
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
            Download & Install Your Key
          </h2>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto leading-relaxed">
            Install your mTLS certificate to securely access all services. This
            ensures only you can connect with your identity.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">What is mTLS?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using an mTLS key installed on your device to connect to our
                service, we can ensure the connection comes from you. No one
                else can impersonate you.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            Choose your platform:{" "}
            {osToShow &&
              `(${osOptions.find((o) => o.value === osToShow)?.label})`}
          </label>
          <Select value={osToShow} onValueChange={setSelectedOS}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select your OS" />
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
          <h3 className="font-semibold">Installation Instructions:</h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
            {platformInstructions.steps.map((step, idx) => (
              <li key={idx} className="pl-2">
                {step}
              </li>
            ))}
          </ol>

          {platformInstructions.notes &&
            platformInstructions.notes.length > 0 && (
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-accent">Note:</p>
                <ul className="list-disc list-inside space-y-1">
                  {platformInstructions.notes.map((note, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground pl-1"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div className="pt-2 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Password for certificate:</span>{" "}
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
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download your key
              </>
            )}
          </Button>
          <a href={mtlsUrl} className="flex-1">
            <Button
              variant="outline"
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl border-2"
            >
              Navigate with your key
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
