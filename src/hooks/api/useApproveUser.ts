import { type UseMutationOptions, useMutation } from "react-query";

interface ApproveUserResponse {
  success: boolean;
  detail?: string;
}

async function approveUser({
  callsign,
  approvalCode,
}: {
  callsign: string;
  approvalCode: string;
}) {
  const res = await fetch("/api/v1/enrollment/accept", {
    // Correct endpoint as per API spec
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ callsign, approvecode: approvalCode }), // make sure this matches the API spec
  });

  const data = (await res.json()) as ApproveUserResponse;

  if (res.status !== 200) {
    throw new Error(data.detail);
  }

  if (!data.success) {
    throw new Error("Failed to approve user");
  }
}

type useApproveUserOptions = UseMutationOptions<
  void,
  Error,
  { callsign: string; approvalCode: string },
  unknown
>;

export function useApproveUser(options?: useApproveUserOptions) {
  return useMutation(approveUser, options);
}
