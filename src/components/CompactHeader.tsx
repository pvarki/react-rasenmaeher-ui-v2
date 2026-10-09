"use client";

import { getTheme } from "@/config/themes";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompactHeaderProps {
  deployment?: string;
  onHelp?: () => void;
}

/**
 * One line of chrome for the onboarding screens. The full LoginHeader stacks a
 * logo, the deployment name and the theme name, which costs about a fifth of a
 * phone screen before anything useful appears.
 */
export function CompactHeader({ deployment, onHelp }: CompactHeaderProps) {
  const theme = getTheme();
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-3"
      data-testid="compact-header"
      data-deployment={deployment ?? ""}
    >
      {theme.assets?.logoUrl && (
        <img
          src={theme.assets.logoUrl}
          alt=""
          className="h-6 w-auto shrink-0"
        />
      )}
      <span className="min-w-0 truncate text-sm font-semibold tracking-wide">
        {deployment}
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {onHelp && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onHelp}
            aria-label={t("common.help")}
            data-testid="compact-header-help"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        )}
        <LanguageSwitcher />
      </div>
    </div>
  );
}
