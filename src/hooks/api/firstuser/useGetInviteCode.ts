import { type UseMutationOptions, useMutation } from "react-query";

interface Response {
  code_ok: boolean;
}

type UseCheckInviteCodeOptions = UseMutationOptions<
  boolean,
  Error,
  string,
  unknown
>;

async function checkInviteCode(token: string) {
  const query = new URLSearchParams({
    temp_admin_code: token,
  });
  const res = await fetch("/api/v1/firstuser/check-code?" + query.toString());
  const data = (await res.json()) as Response;
  return data?.code_ok ?? false;
}

export function useCheckInviteCode(options?: UseCheckInviteCodeOptions) {
  return useMutation(checkInviteCode, options);
}
