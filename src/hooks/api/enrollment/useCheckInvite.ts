import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api";

async function checkInvite(code: string) {
  const { valid } = await post<{ valid: boolean }>("/enrollment/check", {
    code,
  });
  return valid;
}

type UseCheckInviteOptions = Omit<
  UseMutationOptions<boolean, Error, string>,
  "mutationFn"
>;

export function useCheckInvite(options?: UseCheckInviteOptions) {
  return useMutation({ mutationFn: checkInvite, ...options });
}
