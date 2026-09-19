"use client";

import { cn } from "@/lib/utils";

interface StepProgressProps {
  count: number;
  step: number;
  furthest: number;
  onSelect: (index: number) => void;
  label: (index: number) => string;
  testId: (index: number) => string;
}

/**
 * The progress bar is also the navigation: any step already reached stays
 * reachable, so no sequence of taps can strand someone on the wrong screen.
 */
export function StepProgress({
  count,
  step,
  furthest,
  onSelect,
  label,
  testId,
}: StepProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }, (_, idx) => (
        <button
          key={idx}
          type="button"
          data-testid={testId(idx)}
          disabled={idx > furthest}
          aria-current={idx === step ? "step" : undefined}
          aria-label={label(idx)}
          onClick={() => onSelect(idx)}
          className={cn(
            "h-6 flex-1 rounded-full disabled:cursor-default",
            "before:block before:h-1.5 before:rounded-full before:content-['']",
            // A solid colour, not an opacity modifier: /20 against this theme
            // variable resolves to the full colour, so every step looked done.
            idx <= step ? "before:bg-primary-light" : "before:bg-border",
          )}
        />
      ))}
    </div>
  );
}
