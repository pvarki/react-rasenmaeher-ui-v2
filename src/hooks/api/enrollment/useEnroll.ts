import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api";
import { saveToken } from "./enrollmentToken";

export interface EnrollmentStatus {
  callsign: string;
  approvalCode: string | null;
  approved: boolean;
}

interface Token {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
}

export interface EnrollRequest {
  code: string;
  callsign: string;
}

/** Redeems an invite code for a callsign and saves the returned enrollment token. */
async function enroll(request: EnrollRequest) {
  const { status, token } = await post<{
    status: EnrollmentStatus;
    token: Token;
  }>("/enrollment", request);
  saveToken(token.accessToken);
  return status;
}

type UseEnrollOptions = Omit<
  UseMutationOptions<EnrollmentStatus, Error, EnrollRequest>,
  "mutationFn"
>;

export function useEnroll(options?: UseEnrollOptions) {
  return useMutation({ mutationFn: enroll, ...options });
}
