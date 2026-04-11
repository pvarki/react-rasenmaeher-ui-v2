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
  testId?: string;
}

export function TypeConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  isDangerous = false,
  testId = "type-confirmation-modal",
}: TypeConfirmationModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={testId}
        data-confirmation-dangerous={isDangerous ? "true" : "false"}
        data-confirmation-loading={isLoading ? "true" : "false"}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            data-testid={`${testId}-cancel`}
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {t("common.cancel")}
          </Button>
          <Button
            data-testid={`${testId}-confirm`}
            onClick={onConfirm}
            disabled={isLoading}
            variant={"outline"}
            className={
              isDangerous
                ? "flex-1 bg-destructive hover:bg-destructive/90"
                : "flex-1 bg-primary-light hover:bg-primary-light/90"
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
  testId?: string;
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
  testId = "simple-confirmation-modal",
}: SimpleConfirmationModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={testId}
        data-confirmation-dangerous={isDangerous ? "true" : "false"}
        data-confirmation-loading={isLoading ? "true" : "false"}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            data-testid={`${testId}-cancel`}
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {t("common.cancel")}
          </Button>
          <Button
            data-testid={`${testId}-confirm`}
            onClick={onConfirm}
            disabled={isLoading}
            variant={"outline"}
            className={
              isDangerous
                ? "flex-1 bg-destructive hover:bg-destructive/90"
                : "flex-1 bg-primary-light hover:bg-primary-light/90"
            }
          >
            {isLoading ? t("common.processing") : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
