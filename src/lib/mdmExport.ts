import type { MdmEnrollment } from "@/hooks/api/useMdmEnrollments";

/** A spreadsheet of what the MDM has to be told, one row per device
 *
 * An operator standing up a hundred phones works from a list, not from a screen: the device name
 * is what gets pasted into the MDM per host, and it is the only column that has to survive being
 * copied by hand.
 */
export function devicesToCsv(devices: MdmEnrollment[]): string {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ["callsign", "approvecode", "mdm_device_name"],
    ...devices.map((device) => [
      device.callsign,
      device.approvecode,
      device.deviceName,
    ]),
  ];
  // CRLF and a BOM, because these are opened in a spreadsheet on Windows more often than not
  return (
    "﻿" + rows.map((row) => row.map(quote).join(",")).join("\r\n") + "\r\n"
  );
}

export function downloadCsv(filename: string, body: string): void {
  const url = URL.createObjectURL(
    new Blob([body], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
