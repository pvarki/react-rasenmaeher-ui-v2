import type { MdmSettings } from "@/hooks/api/useMdmEnrollments";

/**
 * The one line the MDM connector reads, version 1:
 * `ODMDM1 <scep url> <challenge> <closing time in UTC, whole seconds>`.
 * Null while the window is closed, or when a field would break the line.
 */
export function mdmSettingsLine({
  scep_url,
  challenge,
  open_until,
}: MdmSettings): string | null {
  if (!open_until) return null;
  const closes = new Date(open_until);
  if (Number.isNaN(closes.getTime())) return null;
  // Cut, not rounded: the connector must never think the window lasts longer
  const until = `${closes.toISOString().slice(0, 19)}Z`;
  if ([scep_url, challenge].some((field) => !field || /\s/.test(field))) {
    return null;
  }
  return ["ODMDM1", scep_url, challenge, until].join(" ");
}

/** Where the MDM connector serves its page on the operator's own computer. */
export const MDM_CONNECTOR_ORIGIN = "http://127.0.0.1:8737";

/**
 * Opens the connector's page and hands it the line by window message, so the
 * line is never part of any address the browser keeps in its history.
 */
export function openInMdmConnector(line: string): void {
  // No noopener: the connector's page must be able to answer
  const opened = window.open(MDM_CONNECTOR_ORIGIN + "/", "_blank");
  if (!opened) return;
  const onMessage = (event: MessageEvent) => {
    // Only the window opened here, only on the connector's origin, only once
    // it said it is ready: the explicit target origin enforces the same at send
    if (
      event.origin !== MDM_CONNECTOR_ORIGIN ||
      event.source !== opened ||
      event.data !== "odmdm-ready"
    ) {
      return;
    }
    window.removeEventListener("message", onMessage);
    opened.postMessage({ add: line }, MDM_CONNECTOR_ORIGIN);
  };
  window.addEventListener("message", onMessage);
}
