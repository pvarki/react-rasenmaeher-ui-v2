import { useQuery, type UseQueryOptions } from "react-query";

export interface HealthCheckResponse {
  all_ok: boolean;
  products: Record<string, boolean>;
}

async function getHealthCheck() {
  const response = await fetch("/api/v1/healthcheck/services");

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  const data = await response.json();
  return data as HealthCheckResponse;
}

type UseHealthCheckOptions = Omit<
  UseQueryOptions<HealthCheckResponse, Error, HealthCheckResponse, string[]>,
  "queryKey" | "queryFn"
>;

export function useHealthCheck(options?: UseHealthCheckOptions) {
  return useQuery(["healthCheck"], () => getHealthCheck(), {
    refetchInterval: 30000, // Check every 30 seconds
    ...options,
  });
}
