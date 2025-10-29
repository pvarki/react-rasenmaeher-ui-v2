import { type UseMutationOptions, useMutation } from "react-query";

interface DemoteUserResponse {
  success: boolean;
  detail?: string;
}

async function demoteUser({ callsign }: { callsign: string }) {
  const res = await fetch("/api/v1/enrollment/demote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ callsign }),
  });

  const data = (await res.json()) as DemoteUserResponse;

  if (res.status !== 200) {
    throw new Error(data.detail || "Failed to demote user");
  }

  if (!data.success) {
    throw new Error("Failed to demote user");
  }
}

type UseDemoteUserOptions = UseMutationOptions<
  void,
  Error,
  { callsign: string },
  unknown
>;

export function useDemoteUser(options?: UseDemoteUserOptions) {
  return useMutation(demoteUser, options);
}
