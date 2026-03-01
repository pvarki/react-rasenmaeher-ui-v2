import { useQuery, type UseQueryOptions } from "react-query";

export interface AdminProductInstructions {
  data: Record<string, unknown>;
  [key: string]: unknown;
}

async function getAdminProductInstructions(product: string) {
  const jwt = localStorage.getItem("token");

  const res = await fetch(`/api/v2/admin/instructions/data/${product}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt || ""}`,
    },
  });

  if (!res.ok) {
    console.warn(`Admin instructions not found for product ${product}`);
    return { data: {} };
  }

  const data = await res.json();
  return data as AdminProductInstructions;
}

type UseGetAdminProductInstructionsOptions = UseQueryOptions<
  AdminProductInstructions,
  Error,
  AdminProductInstructions,
  string[]
>;

export function useGetAdminProductInstructions(
  product: string,
  options?: UseGetAdminProductInstructionsOptions,
) {
  return useQuery(
    ["adminProductInstructions", product],
    () => getAdminProductInstructions(product),
    {
      ...options,
      staleTime: 1000 * 60 * 5,
    },
  );
}
