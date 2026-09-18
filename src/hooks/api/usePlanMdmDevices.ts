import { useState } from "react";
import { planMdmEnrollment, type PlannedDevice } from "./usePlanMdmEnrollment";

export interface BulkProgress {
  done: number;
  total: number;
  planned: PlannedDevice[];
  failed: { callsign: string; reason: string }[];
}

const IDLE: BulkProgress = { done: 0, total: 0, planned: [], failed: [] };

/** How many requests are in flight at once.
 *
 * Each one writes a row and reserves a callsign, so this is deliberately small: a unit planning
 * a hundred phones would rather it took a minute than have the deployment answer nothing else
 * while it happens. */
const AT_ONCE = 4;

export function callsignsFrom(
  prefix: string,
  count: number,
  from: number,
): string[] {
  const clean = prefix.trim();
  if (!clean || count < 1) {
    return [];
  }
  return Array.from({ length: count }, (_, index) => `${clean}${from + index}`);
}

/** Plan many devices at once, reporting progress and surviving the ones that fail
 *
 * A callsign already taken is the ordinary failure here, not an exceptional one: names get
 * reused between batches and a callsign is never handed out twice. So one refusal must not
 * abandon the other ninety-nine.
 */
export function usePlanMdmDevices() {
  const [progress, setProgress] = useState<BulkProgress>(IDLE);
  const [isPlanning, setIsPlanning] = useState(false);

  const reset = () => setProgress(IDLE);

  const planMany = async (callsigns: string[]): Promise<BulkProgress> => {
    const planned: PlannedDevice[] = [];
    const failed: { callsign: string; reason: string }[] = [];
    let done = 0;

    setIsPlanning(true);
    setProgress({ done: 0, total: callsigns.length, planned: [], failed: [] });

    const queue = [...callsigns];
    const worker = async () => {
      for (;;) {
        const next = queue.shift();
        if (next === undefined) {
          return;
        }
        try {
          planned.push(await planMdmEnrollment({ callsign: next }));
        } catch (error) {
          failed.push({
            callsign: next,
            reason: error instanceof Error ? error.message : "failed",
          });
        }
        done += 1;
        setProgress({
          done,
          total: callsigns.length,
          planned: [...planned],
          failed: [...failed],
        });
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(AT_ONCE, callsigns.length) }, () =>
        worker(),
      ),
    );
    setIsPlanning(false);
    const final = { done, total: callsigns.length, planned, failed };
    setProgress(final);
    return final;
  };

  return { planMany, progress, isPlanning, reset };
}
