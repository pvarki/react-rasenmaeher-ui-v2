import { Key } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoginHeader } from "@/components/auth/LoginHeader";

interface MtlsPageHeaderProps {
  deployment: string | undefined;
}

export function MtlsPageHeader({ deployment }: MtlsPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-3 mt-10">
      <LoginHeader deployment={deployment} />
      <div className="flex justify-center mt-12">
        <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20">
          <Key className="w-12 h-12 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold text-balance">
        {t("mtlsInstall.title")}
      </h2>
      <p className="text-muted-foreground text-xs max-w-xl mx-auto leading-relaxed">
        {t("mtlsInstall.description")}
      </p>
    </div>
  );
}
