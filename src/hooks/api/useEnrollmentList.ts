import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { EnrollmentState } from "./model/enrollmentState";

interface CallsignItem {
  approvecode: string;
  callsign: string;
  state: EnrollmentState;
}

interface EnrollmentListResponse {
  callsign_list: CallsignItem[];
}

async function getEnrollmentList() {
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

  return data.callsign_list;
}

type UseEnrollmentListOptions = Omit<
  UseQueryOptions<CallsignItem[], Error>,
  "queryKey" | "queryFn"
>;

export function useEnrollmentList(options?: UseEnrollmentListOptions) {
  return useQuery({
    queryKey: ["enrollmentList"],
    queryFn: getEnrollmentList,
    ...options,
  });
}
