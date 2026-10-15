"use client";

import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Primary action for a step. Full width at the bottom so it's in thumb reach,
 * same style as the other primary buttons in the UI but bigger.
 */
export function WizardAction({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-20 w-full rounded-xl bg-primary-light text-xl font-bold uppercase tracking-[0.06em] hover:bg-primary-light/90",
        className,
      )}
      {...props}
    />
  );
}

/**
 * "I did it" after a step we cannot observe. Always clearly pressable, so it
 * never reads as disabled. Once the user has left the page and come back it
 * fills in like WizardAction and pulses. It never advances on its own.
 */
export function WizardConfirm({
  lit,
  className,
  ...props
}: ComponentProps<typeof Button> & { lit: boolean }) {
  return (
    <Button
      variant="outline"
      data-lit={lit ? "true" : "false"}
      className={cn(
        "h-16 w-full rounded-xl border-2 border-primary-light text-lg font-bold",
        lit
          ? "animate-attention bg-primary-light hover:bg-primary-light/90"
          : "bg-transparent hover:bg-primary-light/20",
        className,
      )}
      {...props}
    />
  );
}

/** Back on the left, the way out to another platform on the right. */
export function WizardNav({
  step,
  onBack,
  platformPicker,
  children,
}: {
  step: number;
  onBack: () => void;
  platformPicker: ReactNode;
  children?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-2">
      {step > 0 ? (
        <Button
          data-testid="cert-back-button"
          variant="link"
          size="sm"
          className="px-0 text-base text-muted-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          {t("common.back")}
        </Button>
      ) : (
        <span />
      )}
      {children}
      {platformPicker}
    </div>
  );
}
