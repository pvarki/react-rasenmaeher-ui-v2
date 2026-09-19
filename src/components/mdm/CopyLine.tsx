"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyLineProps {
  label: string;
  value: string;
  hint?: string;
}

/** A value that exists to be copied somewhere else, so copying is the affordance. */
export function CopyLine({ label, value, hint }: CopyLineProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code
          data-testid="mdm-copy-value"
          className="flex-1 min-w-0 font-mono text-sm break-all rounded-lg bg-muted px-3 py-2"
        >
          {value}
        </code>
        <Button
          data-testid="mdm-copy-button"
          variant="ghost"
          size="icon"
          aria-label={t("mdm.copy")}
          onClick={() =>
            navigator.clipboard.writeText(value).then(
              () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              },
              () => toast.error(t("mdm.copyFailed")),
            )
          }
        >
          {copied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
