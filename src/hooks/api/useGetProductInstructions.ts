import { useQuery, type UseQueryOptions } from "react-query";

export interface ProductInstructions {
  data: Record<string, unknown>;
  // Allow additional fields as needed by different products
  [key: string]: unknown;
}

async function getProductInstructions(product: string) {
  const jwt = localStorage.getItem("token");

  const res = await fetch(`/api/v2/instructions/data/${product}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt || ""}`,
    },
  });

  if (!res.ok) {
    // Return empty data if instructions not found, don't throw
    console.warn(`Instructions not found for product ${product}`);
    return { data: {} };
  }

  const data = await res.json();
  return data as ProductInstructions;
}

type UseGetProductInstructionsOptions = UseQueryOptions<
  ProductInstructions,
  Error,
  ProductInstructions,
  string[]
>;

export function useGetProductInstructions(
  product: string,
  options?: UseGetProductInstructionsOptions,
) {
  return useQuery(
    ["productInstructions", product],
    () => getProductInstructions(product),
    {
      ...options,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
}
