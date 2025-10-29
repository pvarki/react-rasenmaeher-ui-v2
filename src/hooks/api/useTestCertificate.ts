import { type UseMutationOptions, useMutation } from "react-query";

async function testCertificate() {
  const res = await fetch(
    "https://mtls.localmaeher.dev.pvarki.fi:4439//api/v1/check-auth/mtls",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      credentials: "include",
    },
  );
  if (res.status !== 200) {
    return false;
  }

  return true;
}

type UseTestInviteCodeOptions = UseMutationOptions<
  boolean,
  Error,
  undefined,
  unknown
>;

export function useTestCertificate(options?: UseTestInviteCodeOptions) {
  return useMutation(testCertificate, options);
}
