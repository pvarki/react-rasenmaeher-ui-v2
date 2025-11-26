import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdminToolsSectionProps {
  onNavigate: () => void;
}

export function AdminToolsSection({ onNavigate }: AdminToolsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="pt-4 border-t border-border">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant={"outline"}
          onClick={onNavigate}
          className="w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 text-base font-semibold"
        >
          <Settings className="w-5 h-5" />
          {t("adminTools.navLink")}
        </Button>
      </div>
    </div>
  );
}
