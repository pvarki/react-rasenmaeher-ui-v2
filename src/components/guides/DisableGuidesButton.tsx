"use client";

import { useTranslation } from "react-i18next";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuidePreferences } from "@/hooks/useGuidePreferences";
import { cn } from "@/lib/utils";

interface DisableGuidesButtonProps {
  /**
   * Close the guide this button is sitting in. Someone pressing "do not show
   * these" while a guide is open means it now, not on the next page.
   */
  onDismiss: () => void;
  className?: string;
}

/**
 * Opt out of guides opening by themselves, from inside the guide that just
 * opened. This is the one place the choice is offered, so that an admin
 * onboarding a group can say "press that button" on the first screen.
 *
 * The help buttons keep working afterwards. Renders nothing once guides are
 * already off, so a guide opened by hand does not offer to turn off something
 * that is off.
 */
export function DisableGuidesButton({
  onDismiss,
  className,
}: DisableGuidesButtonProps) {
  const { t } = useTranslation();
  const { autoOpen, disableAutoOpen } = useGuidePreferences();

  if (!autoOpen) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-testid="disable-guides-button"
      onClick={() => {
        disableAutoOpen();
        onDismiss();
      }}
      className={cn(
        "h-auto w-full justify-start gap-2 px-0 py-1 text-xs font-normal text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <EyeOff className="h-3.5 w-3.5 shrink-0" />
      <span className="text-left">{t("guides.disableAutoOpen")}</span>
    </Button>
  );
}
