import { useEffect, useState } from "react";

/**
 * Whether the user has come back from whatever took the screen: the Android
 * certificate installer, the file manager, or the iOS Settings app.
 *
 * Measured on Android: when the installer dialog opens over the page it fires
 * no blur and no visibilitychange, only a focus event once it closes. Since
 * focus cannot arrive unless the page had lost it, that event alone is the
 * signal. Leaving the browser entirely hides the page instead, so both are
 * watched.
 *
 * Being back never proves anything was installed, so callers must use this
 * only to draw the eye to the next action - never to move the step. Inferring
 * progress from these events is what desynced the flow in field testing.
 */
export function useReturnedFromSystem(active: boolean): boolean {
  const [returned, setReturned] = useState(false);

  useEffect(() => {
    if (!active) {
      setReturned(false);
      return;
    }
    const back = () => {
      if (document.visibilityState === "visible") setReturned(true);
    };
    window.addEventListener("focus", back);
    document.addEventListener("visibilitychange", back);
    return () => {
      window.removeEventListener("focus", back);
      document.removeEventListener("visibilitychange", back);
    };
  }, [active]);

  return returned;
}
