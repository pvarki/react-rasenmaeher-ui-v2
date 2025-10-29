import { type UseQueryOptions, useQuery } from "react-query";
import { EnrollmentState } from "./model/enrollmentState";

interface CallsignItem {
  approvecode: string;
  callsign: string;
  state: EnrollmentState;
}

interface EnrollmentListResponse {
  callsign_list: CallsignItem[];
}

async function getEnrolledUsers() {
  const res = await fetch("/api/v1/enrollment/list", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to login as admin");
  }

  const data = (await res.json()) as EnrollmentListResponse;

  return data.callsign_list.filter((u) => u.state === EnrollmentState.APPROVED);
}

type UseEnrolledUsersOptions = UseQueryOptions<
  CallsignItem[],
  Error,
  CallsignItem[],
  "enrollmentList"
>;

export function useEnrolledUsers(options?: UseEnrolledUsersOptions) {
  return useQuery("enrollmentList", () => getEnrolledUsers(), options);
}
