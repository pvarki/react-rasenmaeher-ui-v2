import { type UseMutationOptions, useMutation } from "react-query";

interface DeactivateInviteCodeResponse {
  success: boolean;
}

async function deactivateInviteCode(inviteCode: string) {
  console.log("Deactivating invite code:", inviteCode);

  const res = await fetch("/api/v1/enrollment/invitecode/deactivate", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invite_code: inviteCode }),
  });

  console.log("Deactivate response:", res);

  if (res.status !== 200) {
    console.error("Failed to deactivate invite code. Status code:", res.status);
    throw new Error("Failed to deactivate invite code");
  }

  const data = (await res.json()) as DeactivateInviteCodeResponse;

  return data;
}

type UseDeactivateInviteCodeOptions = UseMutationOptions<
  DeactivateInviteCodeResponse,
  Error,
  string
>;

export function useDeactivateInviteCode(
  options?: UseDeactivateInviteCodeOptions,
) {
  return useMutation(deactivateInviteCode, options);
}
