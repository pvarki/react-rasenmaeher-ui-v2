import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { GuardHeader } from "./GuardHeader";
import { BrowserExplanation } from "./BrowserExplanation";
import { SupportedBrowsersList } from "./SupportedBrowsersList";
import type { BrowserInfo } from "@/utils/browserDetection";

interface DesktopGuardProps {
  deployment: string;
  logoUrl?: string;
  browserInfo: BrowserInfo;
  os: string;
  downloadLinks: Array<{ name: string; url: string }>;
}

export function DesktopGuard({
  deployment,
  logoUrl,
  browserInfo,
  os,
  downloadLinks,
}: DesktopGuardProps) {
  const { t } = useTranslation();

  return (
    <div
      data-testid="browser-guard-desktop"
      data-browser-name={browserInfo.browserName}
      data-browser-type={browserInfo.browserType}
      data-browser-os={os}
      className="min-h-screen flex flex-col bg-background"
    >
      <GuardHeader deployment={deployment} logoUrl={logoUrl} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 shrink-0">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("browserGuard.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("browserGuard.subtitle")}
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg border border-border">
            <p className="text-base text-foreground">
              {t("browserGuard.currentBrowser", {
                browser: browserInfo.browserName,
              })}
            </p>
          </div>

          <BrowserExplanation browserType={browserInfo.browserType} os={os} />

          <SupportedBrowsersList downloadLinks={downloadLinks} />

          <p className="text-xs text-muted-foreground text-center">
            {t("browserGuard.refreshNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
