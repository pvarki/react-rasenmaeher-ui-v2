import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuardHeader } from "./GuardHeader";
import { BrowserExplanation } from "./BrowserExplanation";
import { SupportedBrowsersList } from "./SupportedBrowsersList";
import { RiskConfirmationDrawer } from "./RiskConfirmationDrawer";
import type { BrowserInfo } from "@/utils/browserDetection";

interface MobileGuardProps {
  deployment: string;
  logoUrl?: string;
  browserInfo: BrowserInfo;
  os: string;
  downloadLinks: Array<{ name: string; url: string }>;
  showConfirmationDrawer: boolean;
  setShowConfirmationDrawer: (show: boolean) => void;
  handleContinueClick: () => void;
  handleConfirmRisk: () => void;
  handleCancelRisk: () => void;
}

export function MobileGuard({
  deployment,
  logoUrl,
  browserInfo,
  os,
  downloadLinks,
  showConfirmationDrawer,
  setShowConfirmationDrawer,
  handleContinueClick,
  handleConfirmRisk,
  handleCancelRisk,
}: MobileGuardProps) {
  const { t } = useTranslation();

  return (
    <>
      <div
        data-testid="browser-guard-mobile"
        data-browser-name={browserInfo.browserName}
        data-browser-type={browserInfo.browserType}
        data-browser-os={os}
        className="min-h-screen flex flex-col bg-background"
      >
        <GuardHeader deployment={deployment} logoUrl={logoUrl} isMobile />

        <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg space-y-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 shrink-0">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {t("browserGuard.title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("browserGuard.subtitle")}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-foreground">
                {t("browserGuard.currentBrowser", {
                  browser: browserInfo.browserName,
                })}
              </p>
            </div>

            <BrowserExplanation
              browserType={browserInfo.browserType}
              os={os}
              titleClassName="text-base font-semibold"
            />

            <SupportedBrowsersList
              downloadLinks={downloadLinks}
              titleClassName="text-base font-semibold"
              gridClassName="grid grid-cols-1 gap-3"
            />

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium">
                {t("browserGuard.riskWarning")}
              </p>
            </div>

            <Button
              data-testid="browser-guard-continue-at-risk-button"
              onClick={handleContinueClick}
              variant="outline"
              className="w-full"
            >
              {t("browserGuard.continueAtRisk")}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {t("browserGuard.refreshNote")}
            </p>
          </div>
        </div>
      </div>

      <RiskConfirmationDrawer
        open={showConfirmationDrawer}
        onOpenChange={setShowConfirmationDrawer}
        onConfirm={handleConfirmRisk}
        onCancel={handleCancelRisk}
      />
    </>
  );
}
