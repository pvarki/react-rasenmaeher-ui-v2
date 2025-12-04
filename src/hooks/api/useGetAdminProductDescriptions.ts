import { useQuery, type UseQueryOptions } from "react-query";

export interface AdminProductDescription {
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

async function getAdminProductDescriptions(language: string) {
  const res = await fetch(`/api/v2/admin/descriptions/${language}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product descriptions");
  }

  const data = await res.json();
  return data as AdminProductDescription[];
}

type UseGetAdminProductDescriptionsOptions = Omit<
  UseQueryOptions<
    AdminProductDescription[],
    Error,
    AdminProductDescription[],
    string[]
  >,
  "queryKey" | "queryFn"
>;

export function useGetAdminProductDescriptions(
  language: string,
  options?: UseGetAdminProductDescriptionsOptions,
) {
  return useQuery(
    ["adminProductDescriptions", language],
    () => getAdminProductDescriptions(language),
    options,
  );
}
