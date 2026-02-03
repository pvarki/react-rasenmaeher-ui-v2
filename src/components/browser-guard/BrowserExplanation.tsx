import { useTranslation } from "react-i18next";
import type { BrowserInfo } from "@/utils/browserDetection";

interface BrowserExplanationProps {
  browserType: BrowserInfo["browserType"];
  os: string;
  titleClassName?: string;
}

export function BrowserExplanation({
  browserType,
  os,
  titleClassName = "text-lg font-semibold",
}: BrowserExplanationProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h2 className={`${titleClassName} text-foreground`}>
        {t("browserGuard.whyNotSupported")}
      </h2>

      {browserType === "in-app" && (
        <p className="text-sm text-muted-foreground">
          {t("browserGuard.inAppExplanation")}
        </p>
      )}

      {browserType === "privacy-focused" && (
        <p className="text-sm text-muted-foreground">
          {t("browserGuard.privacyExplanation")}
        </p>
      )}

      {os === "iOS" && browserType === "standard" && (
        <p className="text-sm text-muted-foreground">
          {t("browserGuard.iosExplanation")}
        </p>
      )}

      {browserType === "unknown" && (
        <p className="text-sm text-muted-foreground">
          {t("browserGuard.unknownExplanation")}
        </p>
      )}
    </div>
  );
}
