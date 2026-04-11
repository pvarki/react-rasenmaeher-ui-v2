import { useQuery, type UseQueryOptions } from "react-query";

const isMock = import.meta.env.VITE_MOCK === "true";

export interface ProductInstructions {
  data: Record<string, unknown>;
  // Allow additional fields as needed by different products
  [key: string]: unknown;
}

async function getProductInstructions(product: string) {
  if (isMock) {
    if (product === "tak") {
      return {
        data: {
          tak_zips: [
            {
              title: "ATAK Package (Mock)",
              filename: "mock-atak.zip",
              data: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==",
            },
            {
              title: "iTAK Package (Mock)",
              filename: "mock-itak.zip",
              data: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==",
            },
            {
              title: "Tracker Package (Mock)",
              filename: "mock-tracker-package.zip",
              data: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==",
            },
          ],
        },
      } as ProductInstructions;
    }
    return { data: {} } as ProductInstructions;
  }

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
