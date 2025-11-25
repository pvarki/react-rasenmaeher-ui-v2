import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export function MtlsExplanationCard() {
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-3">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">
            {t("mtlsInstall.whatIsTitle")}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("mtlsInstall.whatIsDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
