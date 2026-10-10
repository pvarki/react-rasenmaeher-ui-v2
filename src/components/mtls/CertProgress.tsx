"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CERT_STEPS } from "./certSteps";

interface CertProgressProps {
  step: number;
  furthest: number;
  onSelect: (index: number) => void;
  steps?: readonly string[];
}

/**
 * The progress bar is also the navigation: any step already reached stays one
 * tap away, so no sequence of taps (or a system dialog closing at the wrong
 * moment) can strand someone on the wrong screen.
 */
export function CertProgress({
  step,
  furthest,
  onSelect,
  steps = CERT_STEPS,
}: CertProgressProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex gap-2"
      data-testid="cert-progress"
      data-current-step={steps[step]}
    >
      {steps.map((name, idx) => (
        <button
          key={name}
          type="button"
          data-testid={`cert-step-${name}`}
          disabled={idx > furthest}
          aria-current={idx === step ? "step" : undefined}
          onClick={() => onSelect(idx)}
          className="flex flex-1 flex-col gap-1.5 py-1 text-left disabled:cursor-default"
        >
          <span
            className={cn(
              "h-1.5 w-full rounded-full",
              // A solid colour, not an opacity modifier: /20 against this theme
              // variable resolves to the full colour, so every step looked done.
              idx <= step ? "bg-primary-light" : "bg-border",
            )}
          />
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.1em]",
              idx === step ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {t(`mtlsInstall.steps.${name}`)}
          </span>
        </button>
      ))}
    </div>
  );
}
