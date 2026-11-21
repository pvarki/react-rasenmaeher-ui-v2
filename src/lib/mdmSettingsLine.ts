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
