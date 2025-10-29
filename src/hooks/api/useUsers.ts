import { type UseQueryOptions, useQuery } from "react-query";

interface User {
  callsign: string;
  roles: string[];
  extre: unknown;
}

interface UserListResponse {
  callsign_list: User[];
}

async function getUsers() {
  const res = await fetch("/api/v1/people/list", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to login as admin");
  }

  const data = (await res.json()) as UserListResponse;
  console.log("Fetched user data:", data);

  return data.callsign_list;
}

type UseEnrolledUsersOptions = UseQueryOptions<
  User[],
  Error,
  User[],
  "enrollmentList"
>;

export function useUsers(options?: UseEnrolledUsersOptions) {
  return useQuery("enrollmentList", () => getUsers(), options);
}
