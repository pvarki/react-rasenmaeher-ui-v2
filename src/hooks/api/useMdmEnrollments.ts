import { type UseQueryOptions, useQuery } from "react-query";
import type { EnrollmentState } from "./model/enrollmentState";

export interface MdmEnrollment {
  callsign: string;
  approvecode: string;
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
      approvecode: item.approvecode,
      state: item.state,
      // The callsign alone is not enough. The code is what proves to the deployment that this
      // device was meant to have this callsign, and it travels in the certificate request, so
      // the MDM has to carry both.
      deviceName: `${item.callsign}@${item.approvecode}`,
    }));
}

type UseMdmEnrollmentsOptions = UseQueryOptions<
  MdmEnrollment[],
  Error,
  MdmEnrollment[],
  "mdmEnrollments"
>;

/** Devices planned for MDM enrolment. A separate key from "enrollmentList", which two other
 * hooks already share and invalidate on their own schedule. */
export function useMdmEnrollments(options?: UseMdmEnrollmentsOptions) {
  return useQuery("mdmEnrollments", () => getMdmEnrollments(), options);
}
