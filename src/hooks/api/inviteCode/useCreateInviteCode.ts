import { type UseMutationOptions, useMutation } from "react-query";

interface CreateInviteCodeResponse {
  invite_code: string;
}

async function createInviteCode() {
  const res = await fetch("/api/v1/enrollment/invitecode/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to login as admin");
  }

  const data = (await res.json()) as CreateInviteCodeResponse;

  return data.invite_code;
}

type UseCreateInviteCodeOptions = UseMutationOptions<
  string,
  Error,
  undefined,
  unknown
>;

export function useCreateInviteCode(options?: UseCreateInviteCodeOptions) {
  return useMutation(createInviteCode, options);
}
