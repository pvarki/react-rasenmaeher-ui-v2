"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TypeConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export function TypeConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  isDangerous = false,
}: TypeConfirmationModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={
              isDangerous
                ? "flex-1 bg-destructive hover:bg-destructive/90"
                : "flex-1"
            }
          >
            {isLoading ? t("common.confirming") : t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SimpleConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionText: string;
  onConfirm: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export function SimpleConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  actionText,
  onConfirm,
  isLoading = false,
  isDangerous = false,
}: SimpleConfirmationModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={
              isDangerous
                ? "flex-1 bg-destructive hover:bg-destructive/90"
                : "flex-1"
            }
          >
            {isLoading ? t("common.processing") : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
