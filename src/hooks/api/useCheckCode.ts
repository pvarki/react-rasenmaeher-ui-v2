import { type UseMutationOptions, useMutation } from "react-query";

async function checkCode(code: string) {
  const result = await Promise.all([
    checkAdminCode(code),
    checkEnrollmentCode(code),
  ]);

  return {
    isAdminCodeValid: result[0],
    isEnrollmentCodeValid: result[1],
  } as CodeCheckResult;
}

interface CheckAdminCodeResponse {
  code_ok: boolean;
}

async function checkAdminCode(code: string) {
  console.log("usecheckcode: checking if admincode");
  const query = new URLSearchParams({
    temp_admin_code: code,
  });
  const res = await fetch("/api/v1/firstuser/check-code?" + query.toString());
  const data = (await res.json()) as CheckAdminCodeResponse;
  console.log("debug: Response from /firstuser/check-code:", data);
  return data?.code_ok ?? false;
}

interface CheckEnrollmentCodeResponse {
  invitecode_is_active: boolean;
}

async function checkEnrollmentCode(code: string) {
  console.log("usecheckcode: checking if enrollmentcodecode");
  const query = new URLSearchParams({
    invitecode: code,
  });
  const res = await fetch("/api/v1/enrollment/invitecode?" + query.toString());
  const data = (await res.json()) as CheckEnrollmentCodeResponse;
  console.log("debug: Response from /enrollment/invitecode:", data);
  return data?.invitecode_is_active ?? false;
}

interface CodeCheckResult {
  isEnrollmentCodeValid: boolean;
  isAdminCodeValid: boolean;
}
type UseCheckInviteCodeOptions = UseMutationOptions<
  CodeCheckResult,
  Error,
  string,
  unknown
>;

export function useCheckCode(options?: UseCheckInviteCodeOptions) {
  return useMutation(checkCode, options);
}
