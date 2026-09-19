import { type UseQueryOptions, useQuery } from "react-query";

export interface MdmSettings {
  scepUrl: string;
  challenge: string;
}

/** Where the responder answers, derived the same way the API derives it. */
function fallbackScepUrl(): string {
  return `https://${window.location.hostname.replace(/^mtls\./, "")}/scep`;
}

async function getMdmSettings(): Promise<MdmSettings> {
  const res = await fetch("/api/v1/enrollment/mdm-settings", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (res.status !== 200) {
    // A deployment whose API predates this endpoint still has a working SCEP URL, and the
    // challenge is then read from its own configuration. Degrade rather than break the page.
    return { scepUrl: fallbackScepUrl(), challenge: "" };
  }
  const data = (await res.json()) as { scep_url: string; challenge: string };
  return {
    scepUrl: data.scep_url || fallbackScepUrl(),
    challenge: data.challenge ?? "",
  };
}

type UseMdmSettingsOptions = UseQueryOptions<
  MdmSettings,
  Error,
  MdmSettings,
  "mdmSettings"
>;

export function useMdmSettings(options?: UseMdmSettingsOptions) {
  return useQuery("mdmSettings", () => getMdmSettings(), options);
}
