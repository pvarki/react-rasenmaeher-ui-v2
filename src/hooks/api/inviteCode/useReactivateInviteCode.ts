import { type UseMutationOptions, useMutation } from "react-query";

interface ReactivateInviteCodeResponse {
  success: boolean;
}

async function ReactivateInviteCode(inviteCode: string) {
  console.log("Deactivating invite code:", inviteCode);

  const res = await fetch("/api/v1/enrollment/invitecode/activate", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invite_code: inviteCode }),
  });

  console.log("Reactivate response:", res);

  if (res.status !== 200) {
    console.error("Failed to Reactivate invite code. Status code:", res.status);
    throw new Error("Failed to Reactivate invite code");
  }

  const data = (await res.json()) as ReactivateInviteCodeResponse;

  return data;
}

type UseReactivateInviteCodeOptions = UseMutationOptions<
  ReactivateInviteCodeResponse,
  Error,
  string
>;

export function useReactivateInviteCode(
  options?: UseReactivateInviteCodeOptions,
) {
  return useMutation(ReactivateInviteCode, options);
}
