/**
 * localStorage that cannot take the page down with it.
 *
 * Storage access throws outright when site data is blocked, and these flows
 * read it during render. Losing the ability to resume is survivable; a
 * render-time throw is not.
 */
export function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStore(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // No resume across reloads, but the flow still works in this session.
  }
}
