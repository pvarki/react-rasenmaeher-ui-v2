import { useEffect, useState, useMemo } from "react";
import {
  getBrowserInfo,
  getBrowserDownloadLinks,
} from "@/utils/browserDetection";
import { getOperatingSystem } from "@/components/mtls/platformUtils";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { getTheme } from "@/config/themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileGuard } from "./browser-guard/MobileGuard";
import { DesktopGuard } from "./browser-guard/DesktopGuard";

export function BrowserGuard({ children }: { children: React.ReactNode }) {
  const { deployment } = useHealthCheck();
  const theme = getTheme();
  const isMobile = useIsMobile();

  const [browserInfo, setBrowserInfo] = useState(getBrowserInfo());
  const [os, setOs] = useState(getOperatingSystem());
  const [showConfirmationDrawer, setShowConfirmationDrawer] = useState(false);

  // Initialize state immediately from session storage to avoid blinking
  const [userAcceptedRisk, setUserAcceptedRisk] = useState(() => {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (
          key?.startsWith("browser-risk-accepted-") &&
          sessionStorage.getItem(key) === "true"
        ) {
          return true;
        }
      }
    } catch (e) {
      console.error("Failed to access sessionStorage", e);
    }
    return false;
  });

  useEffect(() => {
    const info = getBrowserInfo();
    setBrowserInfo(info);

    const detectedOs = getOperatingSystem();
    setOs(detectedOs);

    // Re-check specifically for this deployment once it's loaded
    if (deployment) {
      const sessionKey = `browser-risk-accepted-${deployment}`;
      if (sessionStorage.getItem(sessionKey) === "true") {
        setUserAcceptedRisk(true);
      }
    }
  }, [deployment]);

  const downloadLinks = useMemo(() => getBrowserDownloadLinks(os), [os]);

  if (browserInfo.isSupported || userAcceptedRisk) {
    return <>{children}</>;
  }

  const handleContinueClick = () => {
    setShowConfirmationDrawer(true);
  };

  const handleConfirmRisk = () => {
    const sessionKey = `browser-risk-accepted-${deployment}`;
    sessionStorage.setItem(sessionKey, "true");
    setUserAcceptedRisk(true);
    setShowConfirmationDrawer(false);
  };

  const handleCancelRisk = () => {
    setShowConfirmationDrawer(false);
  };

  if (isMobile) {
    return (
      <MobileGuard
        deployment={deployment}
        logoUrl={theme.assets?.logoUrl}
        browserInfo={browserInfo}
        os={os}
        downloadLinks={downloadLinks}
        showConfirmationDrawer={showConfirmationDrawer}
        setShowConfirmationDrawer={setShowConfirmationDrawer}
        handleContinueClick={handleContinueClick}
        handleConfirmRisk={handleConfirmRisk}
        handleCancelRisk={handleCancelRisk}
      />
    );
  }

  return (
    <DesktopGuard
      deployment={deployment}
      logoUrl={theme.assets?.logoUrl}
      browserInfo={browserInfo}
      os={os}
      downloadLinks={downloadLinks}
    />
  );
}
