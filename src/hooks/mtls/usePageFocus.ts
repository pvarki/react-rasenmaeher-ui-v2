import { useEffect, useState } from "react";

export interface PageFocus {
  /** The page has the screen and the input right now. */
  focused: boolean;
  /** Something took the focus at least once since this became active. */
  wasAway: boolean;
  /** Was away, and is back: whatever took the screen has closed. */
  returned: boolean;
}

// 250 ms keeps up with the dialog without visible lag, and it only runs while
// the install step is on screen.
const POLL_MS = 250;

/**
 * Whether the system has put something over the page, which is the only
 * signal a web page gets about Android's certificate installer.
 *
 * No single source is reliable across devices, so this reads all of them:
 *  - document.hasFocus() is polled, because some Androids fire no blur at all
 *    when the installer opens over Chrome, yet report the page as unfocused;
 *  - blur, focus and visibilitychange cover the ones that do fire events, and
 *    leaving the browser entirely for the file manager hides the page;
 *  - a focus event on its own also counts as having been away, since focus
 *    cannot arrive unless it was lost. That is what Android measurably sends
 *    when the dialog closes.
 *
 * None of it says what happened in the dialog. Callers may use it to move the
 * emphasis around, never to move the step.
 */
export function usePageFocus(active: boolean): PageFocus {
  const [focused, setFocused] = useState(true);
  const [wasAway, setWasAway] = useState(false);

  useEffect(() => {
    if (!active) {
      setWasAway(false);
      setFocused(true);
      return;
    }

    const read = () => {
      const now = document.visibilityState === "visible" && document.hasFocus();
      setFocused(now);
      if (!now) setWasAway(true);
    };
    const onFocus = () => {
      setWasAway(true);
      read();
    };

    read();
    const timer = window.setInterval(read, POLL_MS);
    window.addEventListener("blur", read);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", read);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("blur", read);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", read);
    };
  }, [active]);

  return { focused, wasAway, returned: wasAway && focused };
}
