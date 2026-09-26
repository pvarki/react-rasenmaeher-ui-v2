import { type UseMutationOptions, useMutation } from "@tanstack/react-query";

interface RejectUserResponse {
  success: boolean;
  detail?: { msg: string }[];
}

async function rejectUser({ callsign }: { callsign: string }) {
  // Hard-coded value for lockReason
  const lockReason = "Locked by an admin";

  const requestBody = {
    lock_reason: lockReason,
    callsign: callsign,
  };

  const res = await fetch("/api/v1/enrollment/lock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = (await res.json()) as RejectUserResponse;

  if (res.status !== 200) {
    const errorMessage =
      data.detail?.map((detail) => detail.msg).join(", ") ||
      "Failed to reject user";
    throw new Error(errorMessage);
  }

  if (!data.success) {
    throw new Error("Failed to reject user");
  }

  return data;
}

type UseRejectUserOptions = Omit<
  UseMutationOptions<RejectUserResponse, Error, { callsign: string }>,
  "mutationFn"
>;

export function useRejectUser(options?: UseRejectUserOptions) {
  return useMutation({ mutationFn: rejectUser, ...options });
}
