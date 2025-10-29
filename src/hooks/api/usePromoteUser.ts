import { type UseMutationOptions, useMutation } from "react-query";

interface PromoteUserResponse {
  success: boolean;
  detail?: string;
}

async function promoteUser({ callsign }: { callsign: string }) {
  const res = await fetch("/api/v1/enrollment/promote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ callsign }),
  });

  const data = (await res.json()) as PromoteUserResponse;

  if (res.status !== 200) {
    throw new Error(data.detail || "Failed to promote user");
  }

  if (!data.success) {
    throw new Error("Failed to promote user");
  }
}

type UsePromoteUserOptions = UseMutationOptions<
  void,
  Error,
  { callsign: string },
  unknown
>;

export function usePromoteUser(options?: UsePromoteUserOptions) {
  return useMutation(promoteUser, options);
}
