import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface InviteHeaderProps {
  onBack: () => void;
}

export function InviteHeader({ onBack }: InviteHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="border-b border-border bg-card/50 px-4 md:px-8 py-3">
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-2 text-sm hover:bg-accent/50"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("inviteCode.backToInvites")}
      </Button>
    </div>
  );
}
