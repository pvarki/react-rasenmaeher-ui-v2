import { type UseQueryOptions, useQuery } from "react-query";

export interface InviteCodeItem {
  invitecode: string;
  active: true;
  owner_cs: string;
  created: string;
}

interface InviteCodeListResponse {
  pools: InviteCodeItem[];
}

async function getInviteCodeList() {
  const res = await fetch("/api/v1/enrollment/pools", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to fetch invite codes with status code:");
  }

  const data = (await res.json()) as InviteCodeListResponse;
  console.log("Data received from API:", data); // This will log the raw response from the API

  return data.pools;
}

type UseInviteCodeOptions = UseQueryOptions<
  InviteCodeItem[],
  Error,
  InviteCodeItem[],
  "inviteCodeList"
>;

export function useInviteCodeList(options?: UseInviteCodeOptions) {
  return useQuery("inviteCodeList", () => getInviteCodeList(), {
    ...options,
    onSuccess: (data) => {
      console.log("Fetched invite code list:", data);
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
