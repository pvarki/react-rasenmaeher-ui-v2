import { type UseQueryOptions, useQuery } from "react-query";
import type { EnrollmentState } from "./model/enrollmentState";

export interface MdmEnrollment {
  callsign: string;
  state: EnrollmentState;
  /** What the MDM has to be told this device is called. */
  deviceName: string;
}

interface CallsignItem {
  approvecode: string;
  callsign: string;
  state: EnrollmentState;
  mdm?: boolean;
}

interface EnrollmentListResponse {
  callsign_list: CallsignItem[];
}

async function getMdmEnrollments(): Promise<MdmEnrollment[]> {
  const res = await fetch("/api/v1/enrollment/list", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (res.status !== 200) {
    throw new Error("Failed to read the enrollment list");
  }
  const data = (await res.json()) as EnrollmentListResponse;

  return data.callsign_list
    .filter((item) => item.mdm)
    .map((item) => ({
      callsign: item.callsign,
      state: item.state,
      // The code proves to the deployment that this device was meant to have this callsign. It
      // travels in the certificate request, so the MDM has to carry both.
      deviceName: `${item.callsign}@${item.approvecode}`,
    }));
}

type UseMdmEnrollmentsOptions = UseQueryOptions<
  MdmEnrollment[],
  Error,
  MdmEnrollment[],
  "mdmEnrollments"
>;

/** Devices planned for MDM enrolment */
export function useMdmEnrollments(options?: UseMdmEnrollmentsOptions) {
  return useQuery("mdmEnrollments", () => getMdmEnrollments(), options);
}

/** Plan one callsign for a device. No login token is issued for it; only the MDM agent may
 * complete it. */
export async function planMdmEnrollment(callsign: string): Promise<void> {
  const res = await fetch("/api/v1/enrollment/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callsign, mdm: true }),
  });
  if (res.status !== 200) {
    const data = (await res.json().catch(() => ({}))) as { detail?: unknown };
    throw new Error(
      typeof data.detail === "string" ? data.detail : res.statusText,
    );
  }
}

export interface MdmSettings {
  /** Where the MDM sends each device's certificate request */
  scep_url: string;
  /** Not a secret: the MDM hands it to every device */
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
