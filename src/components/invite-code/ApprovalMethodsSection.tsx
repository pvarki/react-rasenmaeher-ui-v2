import { useState } from "react";
import { ChevronDown, Smartphone, Link2, Binary } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function ApprovalMethodsSection() {
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
        <span className="font-medium">
          {t("inviteCode.approvalMethods.title")}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform",
            instructionsOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 p-6 bg-card border border-border rounded-xl space-y-4 text-sm text-muted-foreground leading-relaxed">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Smartphone className="w-4 h-4" />
            {t("inviteCode.approvalMethods.method1.title")}
          </div>
          <p>{t("inviteCode.approvalMethods.method1.description")}</p>
        </div>

        <hr className="border-border/30" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Binary className="w-4 h-4" />
            {t("inviteCode.approvalMethods.method2.title")}
          </div>
          <p>{t("inviteCode.approvalMethods.method2.description")}</p>
        </div>

        <hr className="border-border/30" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Link2 className="w-4 h-4" />
            {t("inviteCode.approvalMethods.method3.title")}
          </div>
          <p>{t("inviteCode.approvalMethods.method3.description")}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
