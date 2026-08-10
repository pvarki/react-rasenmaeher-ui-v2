import { useQuery, type UseQueryOptions } from "react-query";

export interface HealthCheckResponse {
  all_ok: boolean;
  products: Record<string, boolean>;
}

/** How often the services are re-checked. */
export const HEALTH_CHECK_INTERVAL_MS = 30000;

/** A check that does not answer within this window counts as failed. */
const HEALTH_CHECK_TIMEOUT_MS = 10000;

/**
 * Cached results older than this no longer describe the current state: at that
 * point at least two checks have failed to come back, so the products must be
 * reported as unknown instead of whatever they were the last time we heard.
 */
export const HEALTH_CHECK_STALE_AFTER_MS =
  HEALTH_CHECK_INTERVAL_MS * 2 + HEALTH_CHECK_TIMEOUT_MS;

async function getHealthCheck() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch("/api/v1/healthcheck/services", {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    const data = await response.json();
    return data as HealthCheckResponse;
  } finally {
    clearTimeout(timeout);
  }
}

type UseHealthCheckOptions = Omit<
  UseQueryOptions<HealthCheckResponse, Error, HealthCheckResponse, string[]>,
  "queryKey" | "queryFn"
>;

export function useHealthCheck(options?: UseHealthCheckOptions) {
  return useQuery(["healthCheck"], () => getHealthCheck(), {
    refetchInterval: HEALTH_CHECK_INTERVAL_MS,
    // Keep the interval authoritative: long retry chains would hide failures
    // behind a query that never settles.
    retry: 1,
    ...options,
  });
}
