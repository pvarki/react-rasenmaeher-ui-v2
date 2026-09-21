import { useCallback, useEffect, useState } from "react";

const STORAGE_NAME = "guides.autoOpen";
/** localStorage "storage" events do not fire in the tab that wrote the value. */
const CHANGED = "guides.autoOpen.changed";

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_NAME) !== "off";
  } catch {
    // A browser refusing storage should still show the guides.
    return true;
  }
}

function write(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_NAME, enabled ? "on" : "off");
  } catch {
    // Not being able to remember the choice is not a reason to break the page.
  }
  window.dispatchEvent(new Event(CHANGED));
}

/**
 * Set the preference without a React context, for the few places that decide
 * it before anything is mounted (an invite link carrying the opt-out).
 */
export function setAutoOpenGuides(enabled: boolean): void {
  write(enabled);
}

/** The query parameter an invite link uses to carry the opt-out. */
export const GUIDES_PARAM = "guides";

/**
 * Apply an opt-out carried in the current URL.
 *
 * Deploy App spans two origins -- the base domain and mtls.* -- and
 * localStorage does not cross between them, so the choice has to travel in
 * the link and be re-recorded on the other side. Call this on startup, before
 * any guide has had a chance to open.
 *
 * Only ever turns guides off: a link must not switch them back on over a
 * choice the person made for themselves.
 */
export function applyGuidePreferenceFromUrl(): void {
  try {
    const value = new URLSearchParams(window.location.search).get(GUIDES_PARAM);
    if (value === "off") {
      write(false);
    }
  } catch {
    // A malformed URL is not a reason to fail startup.
  }
}

/**
 * Add the opt-out to a link pointing at the other origin, so the choice
 * survives the hop. Returns the url untouched when guides are allowed.
 */
export function withGuidePreference(url: string): string {
  if (read()) {
    return url;
  }
  try {
    const parsed = new URL(url);
    parsed.searchParams.set(GUIDES_PARAM, "off");
    return parsed.toString();
  } catch {
    return url;
  }
}

export function useGuidePreferences() {
  const [autoOpen, setAutoOpenState] = useState(read);

  useEffect(() => {
    const sync = () => setAutoOpenState(read());
    // "storage" covers this person's other tabs; CHANGED covers this one.
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGED, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGED, sync);
    };
  }, []);

  const setAutoOpen = useCallback((enabled: boolean) => {
    write(enabled);
    setAutoOpenState(enabled);
  }, []);

  const disableAutoOpen = useCallback(() => setAutoOpen(false), [setAutoOpen]);

  return { autoOpen, setAutoOpen, disableAutoOpen };
}
