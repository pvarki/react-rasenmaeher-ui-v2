import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface HowItWorksSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowItWorksSection({
  open,
  onOpenChange,
}: HowItWorksSectionProps) {
  const { t } = useTranslation();

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="border border-border rounded-xl overflow-hidden"
    >
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors cursor-pointer">
        <span className="font-medium">{t("approveUsers.howItWorks")}</span>
        <ChevronDown
          className={cn("w-5 h-5 transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p className="pt-2">
          <span className="text-primary font-semibold">1.</span>{" "}
          {t("approveUsers.step1")}{" "}
          <span className="font-medium text-foreground">
            {t("approveUsers.approvalCode")}
          </span>{" "}
          {t("approveUsers.step1End")}
        </p>
        <p>
          <span className="text-primary font-semibold">2.</span>{" "}
          {t("approveUsers.step2")}
        </p>
        <p>
          <span className="text-primary font-semibold">3.</span>{" "}
          {t("approveUsers.step3")}{" "}
          <span className="font-medium text-green-600">
            {t("approveUsers.approve")}
          </span>{" "}
          {t("approveUsers.step3End")}{" "}
          <span className="font-medium text-destructive">
            {t("approveUsers.reject")}
          </span>{" "}
          {t("approveUsers.step3End2")}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
