import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";

interface PwaInstallProps {
  /** "card" is the onboarding call to action, "link" the footer entry. */
  variant: "card" | "link";
}

export function PwaInstall({ variant }: PwaInstallProps) {
  const { t } = useTranslation();
  const { available, canPrompt, install } = usePwaInstall();
  const [showSteps, setShowSteps] = useState(false);

  if (!available) return null;

  // iOS never offers a prompt, so written steps are all we can do there.
  const handleClick = () =>
    canPrompt ? void install() : setShowSteps((shown) => !shown);

  const steps = showSteps && (
    <p className="text-xs text-muted-foreground leading-relaxed">
      {t("pwa.iosSteps")}
    </p>
  );

  if (variant === "link") {
    return (
      <div className="space-y-2">
        <button
          onClick={handleClick}
          className="text-primary hover:underline cursor-pointer bg-transparent border-none p-0 text-sm"
        >
          {t("pwa.installToHomeScreen")}
        </button>
        {steps}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t("pwa.callToAction")}
      </p>
      <Button
        onClick={handleClick}
        variant="outline"
        className="w-full h-11 bg-primary-light hover:bg-primary-light/90 text-primary-light-foreground focus:outline-none focus:ring-0 focus-visible:ring-0"
        tabIndex={-1}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Download className="w-4 h-4 mr-2" />
        {t("pwa.install")}
      </Button>
      {steps}
    </div>
  );
}
