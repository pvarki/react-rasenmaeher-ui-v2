import { type UseMutationOptions, useMutation } from "react-query";
import { downloadBlob } from "../../lib/downloadBlob";

async function getCertificate(callsign: string) {
  const jwt = localStorage.getItem("token");
  if (!jwt) {
    throw new Error("No JWT found");
  }

  const res = await fetch("/api/v1/enduserpfx/" + callsign, {
    method: "GET",
    headers: {
      // "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (res.status !== 200) {
    let errorMessage = "Failed to get the certificate.";
    try {
      const errorBody = (await res.json()) as { detail?: string };
      errorMessage = errorBody.detail || errorMessage;
    } catch {
      // If the response is not json, use the default error message
    }
    throw new Error(errorMessage);
  }

  const blob = await res.blob();
  downloadBlob(blob, callsign + ".pfx");

  return blob;
}

type UseGetCertificateOptions = UseMutationOptions<
  Blob,
  Error,
  string,
  unknown
>;

export function useGetCertificate(options?: UseGetCertificateOptions) {
  return useMutation(getCertificate, options);
}
