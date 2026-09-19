import { useCallback, useState } from "react";
import { readStore, writeStore } from "@/lib/safeStorage";

export interface WizardStep {
  /** The step being shown. */
  step: number;
  /** The furthest step this owner has reached, so Back is never one-way. */
  furthest: number;
  go: (next: number) => void;
}

/** Stored as "<owner>:<step>:<furthest>". Exported for tests. */
export function parseProgress(
  stored: string | null,
  owner: string | null,
  count: number,
): { step: number; furthest: number } {
  const [storedOwner, storedStep, storedMax] = (stored ?? "").split(":");
  const cur = Number(storedStep);
  const max = Number(storedMax);
  // Progress belongs to whoever enrolled: the next person on this device
  // starts from the top rather than resuming a stranger's wizard.
  const mine =
    Boolean(storedOwner) &&
    storedOwner === owner &&
    Number.isInteger(cur) &&
    cur >= 0 &&
    cur < count;
  const step = mine ? cur : 0;
  const furthest =
    mine && Number.isInteger(max)
      ? Math.min(Math.max(max, step), count - 1)
      : step;
  return { step, furthest };
}

/**
 * Wizard position that survives the system installer taking over the screen,
 * and that the user can move freely within: every step already reached stays
 * one tap away.
 */
export function useWizardStep(
  storageKey: string,
  callsign: string,
  count: number,
): WizardStep {
  const owner = callsign || readStore("callsign") || "";
  const [progress, setProgress] = useState(() =>
    parseProgress(readStore(storageKey), owner, count),
  );

  const go = useCallback(
    (next: number) => {
      setProgress((prev) => {
        const furthest = Math.max(prev.furthest, next);
        writeStore(storageKey, `${owner}:${next}:${furthest}`);
        return { step: next, furthest };
      });
    },
    [storageKey, owner],
  );

  return { ...progress, go };
}
