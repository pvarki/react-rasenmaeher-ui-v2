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

  // Construct mtls URL with subdomain
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background p-4 md:p-6">
      <div className="w-full max-w-3xl space-y-6 md:space-y-8 py-8">
        <div className="text-center space-y-3">
          <h1 className="text-sm font-medium text-muted-foreground uppercase">
            {callsign || "USER"}
          </h1>
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
            <li>Download your certificate using the button below</li>
            <li>
              When prompted for a password, enter:{" "}
              <span className="font-mono font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
                {callsign}
              </span>
            </li>
            <li>Install the certificate on your device</li>
            <li>Use the "Navigate with your key" button to access services</li>
          </ol>
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
