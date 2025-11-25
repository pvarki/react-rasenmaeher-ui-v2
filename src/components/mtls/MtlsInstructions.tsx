"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface MtlsInstructionsProps {
  instructions: {
    steps: string[];
    notes?: string[];
  };
}

export function MtlsInstructions({ instructions }: MtlsInstructionsProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 bg-card border border-border rounded-xl p-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between hover:opacity-70 transition-opacity">
          <h3 className="font-semibold text-sm">
            {t("mtlsInstall.instructionsTitle")}
          </h3>
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
            {instructions.steps.map((keyOrText, idx) => (
              <li key={idx} className="pl-2">
                {t(keyOrText)}
              </li>
            ))}
          </ol>

          {instructions.notes && instructions.notes.length > 0 && (
            <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-accent">
                {t("mtlsInstall.note")}
              </p>
              <ul className="list-disc list-inside space-y-1">
                {instructions.notes.map((noteKey, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground pl-1">
                    {t(noteKey)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
