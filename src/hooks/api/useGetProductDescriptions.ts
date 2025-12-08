import { useQuery, type UseQueryOptions } from "react-query";

export interface ProductDescription {
  shortname: string;
  title: string;
  icon: string | null;
  description: string;
  language: string;
  docs: string | null;
  component: {
    type: "component" | "markdown" | "link";
    ref: string;
  };
}

async function getProductDescriptions(language: string) {
  const res = await fetch(`/api/v2/descriptions/${language}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product descriptions");
  }

  const data = await res.json();
  return data as ProductDescription[];
}

type UseGetProductDescriptionsOptions = Omit<
  UseQueryOptions<ProductDescription[], Error, ProductDescription[], string[]>,
  "queryKey" | "queryFn"
>;

export function useGetProductDescriptions(
  language: string,
  options?: UseGetProductDescriptionsOptions,
) {
  return useQuery(
    ["productDescriptions", language],
    () => getProductDescriptions(language),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes - don't refetch if data is fresh
      refetchOnMount: false, // Don't refetch when component mounts if data exists
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      ...options,
    },
  );
}
