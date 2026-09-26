import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { ApiError, get } from "@/lib/api";
import { authHeader, hasToken } from "./enrollmentToken";
import type { EnrollmentStatus } from "./useEnroll";

export const isUnauthorized = (error: unknown) =>
  error instanceof ApiError && error.status === 401;

type UseEnrollmentStatusOptions = Omit<
  UseQueryOptions<EnrollmentStatus, Error>,
  "queryKey" | "queryFn"
>;

export function useEnrollmentStatus(options?: UseEnrollmentStatusOptions) {
  return useQuery({
    queryKey: ["enrollment"],
    queryFn: () => get<EnrollmentStatus>("/enrollment", authHeader()),
    enabled: hasToken(),
    retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 3,
    ...options,
  });
}
