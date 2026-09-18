import { type UseMutationOptions, useMutation } from "react-query";

interface PlanMdmEnrollmentResponse {
  callsign: string;
  approvecode: string;
  jwt: string;
  detail?: string;
}

export interface PlannedDevice {
  callsign: string;
  approvecode: string;
  /** What the MDM has to be told this device is called. */
  deviceName: string;
}

async function planMdmEnrollment({
  callsign,
}: {
  callsign: string;
}): Promise<PlannedDevice> {
  const res = await fetch("/api/v1/enrollment/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // mdm says this callsign is waiting for a device rather than a person: no login token is
    // issued for it, and only the MDM agent may complete it.
    body: JSON.stringify({ callsign, mdm: true }),
  });

  const data = (await res.json()) as PlanMdmEnrollmentResponse;
  if (res.status !== 200) {
    throw new Error(data.detail ?? "Failed to plan the device");
  }
  return {
    callsign: data.callsign,
    approvecode: data.approvecode,
    deviceName: `${data.callsign}@${data.approvecode}`,
  };
}

type UsePlanMdmEnrollmentOptions = UseMutationOptions<
  PlannedDevice,
  Error,
  { callsign: string },
  unknown
>;

export function usePlanMdmEnrollment(options?: UsePlanMdmEnrollmentOptions) {
  return useMutation(planMdmEnrollment, options);
}
