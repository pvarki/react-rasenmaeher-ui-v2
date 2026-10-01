import { useEffect, useState } from "react";

/**
 * Seconds since the hook was enabled. Used on waiting screens so something
 * visibly changes while we poll.
 */
export function useElapsed(enabled = true) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return seconds;
}

export function formatElapsed(seconds: number) {
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes} min ${rest} s`;
}
