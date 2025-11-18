"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface MtlsInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MtlsInfoModal({ open, onOpenChange }: MtlsInfoModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modals.mtls.title")}</DialogTitle>
          <DialogDescription>{t("modals.mtls.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm leading-relaxed">
          <p>{t("modals.mtls.paragraph1")}</p>
          <p>{t("modals.mtls.paragraph2")}</p>
          <p className="font-medium text-foreground">
            {t("modals.mtls.paragraph3")}
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            {t("modals.mtls.gotIt")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
