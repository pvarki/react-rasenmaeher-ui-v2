import { useTranslation } from "react-i18next";
import { LoginHeader } from "@/components/auth/LoginHeader";

interface MtlsPageHeaderProps {
  deployment: string | undefined;
}

export function MtlsPageHeader({ deployment }: MtlsPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-3 md:mt-10">
      <LoginHeader deployment={deployment} />
      <h2 className="text-2xl md:text-3xl font-semibold text-balance mt-12">
        {t("mtlsInstall.title")}
      </h2>
      <p className="text-muted-foreground text-xs max-w-xl mx-auto leading-relaxed">
        {t("mtlsInstall.description")}
      </p>
    </div>
  );
}
