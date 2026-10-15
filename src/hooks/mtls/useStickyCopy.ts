import { useCallback, useState } from "react";

/**
 * Copy state that stays put. The generic copy hook flips back after two
 * seconds, but here "copied" is information the user needs for as long as the
 * password dialog is open.
 */
export function useStickyCopy(text: string) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    if (!text) return;
    // Missing on plain http, and a refused write is not worth an error: the
    // password is on screen either way.
    navigator.clipboard
      ?.writeText(text)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  }, [text]);

  return { copied, copy };
}
