import * as React from "react";

// Ignore sub-pixel and rubber-band jitter so the header does not flicker.
const SCROLL_DELTA = 8;
// Keep the header visible while still near the top of the content.
const TOP_OFFSET = 24;

/**
 * Tracks whether the scroll container was last scrolled down, so callers can
 * hide chrome while reading and bring it back on the way up.
 *
 * The app shell is `h-dvh` with `overflow-hidden`, so the document never
 * scrolls and window scroll events never fire. Attach the returned `ref` to
 * the element that actually scrolls.
 */
export function useIsScrollingDown(enabled = true) {
  // A callback ref, rather than useRef, so the effect re-runs when the
  // scroller mounts: it sits behind the auth and loading gates.
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  const [isScrollingDown, setIsScrollingDown] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setIsScrollingDown(false);
      return;
    }

    if (!element) {
      return;
    }

    let lastY = element.scrollTop;
    let frame: number | null = null;

    const onScroll = () => {
      if (frame !== null) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = null;
        const y = element.scrollTop;
        const delta = y - lastY;

        if (y <= TOP_OFFSET) {
          lastY = y;
          setIsScrollingDown(false);
          return;
        }

        if (Math.abs(delta) < SCROLL_DELTA) {
          return;
        }

        lastY = y;
        setIsScrollingDown(delta > 0);
      });
    };

    element.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      element.removeEventListener("scroll", onScroll);
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [element, enabled]);

  return { ref: setElement, isScrollingDown };
}
