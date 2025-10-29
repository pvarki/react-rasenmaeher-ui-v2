import { type UseQueryOptions, useQuery } from "react-query";

interface EnrollmentStatusResponse {
  have_i_been_accepted: boolean;
}

async function getEnrollmentStatus() {
  const jwt = localStorage.getItem("token");
  if (!jwt) {
    return false;
  }
  const res = await fetch("/api/v1/enrollment/have-i-been-accepted", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to login as accepted user");
  }

  const data = (await res.json()) as EnrollmentStatusResponse;

  return data.have_i_been_accepted;
}

type UseOwnEnrollmentStatusOptions = UseQueryOptions<
  boolean,
  Error,
  boolean,
  "enrollmentStatus"
>;

export function useOwnEnrollmentStatus(
  options?: UseOwnEnrollmentStatusOptions,
) {
  return useQuery("enrollmentStatus", getEnrollmentStatus, options);
}
