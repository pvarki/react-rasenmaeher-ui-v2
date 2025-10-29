import { type UseQueryOptions, useQuery } from "react-query";

interface GetVerificationCodeInfoResponse {
  state: string;
  callsign: string;
  accepted: string;
  locked: string;
}

async function getVerificationCodeInfo(code: string) {
  const query = new URLSearchParams({
    verification_code: code,
  });
  const res = await fetch(
    "/api/v1/enrollment/show-verification-code-info?" + query.toString(),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (res.status !== 200) {
    throw new Error("Failed to login as admin");
  }

  const data = (await res.json()) as GetVerificationCodeInfoResponse;

  return data;
}

type UseOwnEnrollmentStatusOptions = UseQueryOptions<
  GetVerificationCodeInfoResponse,
  Error,
  GetVerificationCodeInfoResponse,
  "verificationCodeInfo"
>;

export function useGetVerificationCodeInfo(
  code: string | undefined,
  options?: UseOwnEnrollmentStatusOptions,
) {
  return useQuery(
    "verificationCodeInfo",
    () => getVerificationCodeInfo(code!),
    {
      ...options,
      enabled: !!code || options?.enabled,
    },
  );
}
