"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyLine } from "./CopyLine";

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scepUrl: string;
  challenge: string;
}

/** Everything the MDM is configured with, once, in one place.
 *
 * On demand rather than on the page: an operator reads this when the MDM is first set up and
 * never again, and it used to be the first thing anybody saw.
 */
export function ConnectionDialog({
  open,
  onOpenChange,
  scepUrl,
  challenge,
}: ConnectionDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="mdm-connection-dialog"
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>{t("mdm.connectionTitle")}</DialogTitle>
          <DialogDescription>{t("mdm.connectionDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <CopyLine label={t("mdm.scepUrl")} value={scepUrl} />
          <CopyLine
            label={t("mdm.challenge")}
            value={challenge}
            hint={t("mdm.challengeHint")}
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("mdm.subjectTitle")}
            </p>
            <p className="font-mono text-sm break-all rounded-lg bg-muted px-3 py-2">
              CN=&lt;callsign&gt;, OU=&lt;callsign&gt;@&lt;code&gt;
            </p>
            <p className="text-xs text-muted-foreground">
              {t("mdm.subjectDesc")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
