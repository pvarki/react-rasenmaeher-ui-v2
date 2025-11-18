"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TypeConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  requiredText: string;
  onConfirm: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export function TypeConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  requiredText,
  onConfirm,
  isLoading = false,
  isDangerous = false,
}: TypeConfirmationModalProps) {
  const [input, setInput] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      setInput("");
    }
  }, [open]);

  const isConfirmed = input === requiredText.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {t("common.type")}{" "}
              <span className="font-mono bg-muted px-2 py-1 rounded">
                {requiredText}
              </span>{" "}
              {t("common.toConfirm")}
            </p>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder={t("common.typeConfirmPlaceholder", {
                text: requiredText,
              })}
              className="font-mono uppercase"
            />
          </div>
        </div>
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
            disabled={!isConfirmed || isLoading}
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
