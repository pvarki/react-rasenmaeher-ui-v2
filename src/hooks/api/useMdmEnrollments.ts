import { type UseQueryOptions, useQuery } from "react-query";

export interface MdmDevice {
  /** The name the MDM gave the device, which became its callsign */
  callsign: string;
}

interface Person {
  callsign: string;
  extra?: { mdm?: boolean } | null;
}

interface PeopleListResponse {
  callsign_list: Person[];
}

async function getMdmDevices(): Promise<MdmDevice[]> {
  const res = await fetch("/api/v1/people/list", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (res.status !== 200) {
    throw new Error("Failed to read the user list");
  }
  const data = (await res.json()) as PeopleListResponse;
  return data.callsign_list
    .filter((person) => person.extra?.mdm)
    .map((person) => ({ callsign: person.callsign }));
}

type UseMdmDevicesOptions = UseQueryOptions<
  MdmDevice[],
  Error,
  MdmDevice[],
  "mdmDevices"
>;

/** Users that enrolled through the MDM. Re-read while the page is open, so phones show up as they
 * enrol. */
export function useMdmDevices(options?: UseMdmDevicesOptions) {
  return useQuery("mdmDevices", () => getMdmDevices(), {
    refetchInterval: 10_000,
    ...options,
  });
}

export interface MdmSettings {
  /** Where the MDM sends each device's certificate request */
  scep_url: string;
  /** The MDM hands it to every device, so the open window is what really gates enrolment */
  challenge: string;
  /** When the enrolment window closes, or null while it is closed */
  open_until: string | null;
}

async function getMdmSettings(): Promise<MdmSettings> {
  const res = await fetch("/api/v1/enrollment/mdm-settings", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (res.status !== 200) {
    throw new Error("Failed to read the MDM settings");
  }
  return (await res.json()) as MdmSettings;
}

/** What to configure the MDM with, and until when devices may enrol. Re-read every minute so
 * the page notices when the window closes itself. */
export function useMdmSettings() {
  return useQuery("mdmSettings", () => getMdmSettings(), {
    refetchInterval: 60_000,
  });
}

/** Open device enrolment for this many hours, or close it with 0. It closes itself when the
 * time runs out. */
export async function setMdmEnrolmentWindow(hours: number): Promise<void> {
  const res = await fetch("/api/v1/enrollment/mdm-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hours }),
  });
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }
}
