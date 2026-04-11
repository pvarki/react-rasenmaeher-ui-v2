import { useQuery, type UseQueryOptions } from "react-query";

const isMock = import.meta.env.VITE_MOCK === "true";

export interface HealthCheckResponse {
  all_ok: boolean;
  products: Record<string, boolean>;
}

let _mockHealthDataCache: HealthCheckResponse | null = null;

async function getMockHealthData(): Promise<HealthCheckResponse> {
  if (_mockHealthDataCache) return _mockHealthDataCache;

  try {
    const resp = await fetch("/product-integrations.json");
    if (resp.ok) {
      const integrations = await resp.json();
      // integrations is an array of { shortname, ... }
      const products: Record<string, boolean> = {};
      if (Array.isArray(integrations)) {
        for (const p of integrations) {
          if (p.shortname) {
            products[p.shortname] = true;
          }
        }
      }
      _mockHealthDataCache = {
        all_ok: Object.keys(products).length > 0,
        products,
      };
    }
  } catch {
    // Fallback: no products available
  }

  if (!_mockHealthDataCache) {
    _mockHealthDataCache = { all_ok: false, products: {} };
  }
  return _mockHealthDataCache;
}

async function getHealthCheck() {
  if (isMock) return getMockHealthData();

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
