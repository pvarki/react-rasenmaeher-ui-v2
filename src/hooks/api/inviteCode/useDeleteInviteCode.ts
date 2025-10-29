import { type UseMutationOptions, useMutation } from "react-query";

interface DeleteInviteCodeResponse {
  invite_code: string;
}

async function deleteInviteCode(inviteCode: string) {
  console.log("Deleting invite code:", inviteCode);
  const res = await fetch("/api/v1/enrollment/invitecode/" + inviteCode, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("Delete response:", res);

  if (res.status !== 200) {
    console.error("Failed to delete invite code. Status code:", res.status);
    throw new Error("Failed to login as admin");
  }

  const data = (await res.json()) as DeleteInviteCodeResponse;

  return data.invite_code;
}

type UseDeleteInviteCodeOptions = UseMutationOptions<
  string,
  Error,
  string,
  unknown
>;

export function useDeleteInviteCode(options?: UseDeleteInviteCodeOptions) {
  return useMutation(deleteInviteCode, options);
}
