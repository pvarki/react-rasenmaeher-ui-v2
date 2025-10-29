import { type UseMutationOptions, useMutation } from "react-query";

interface Response {
  jwt: string;
}

type UseCheckInviteCodeOptions = UseMutationOptions<
  string,
  Error,
  { callsign: string; code: string },
  unknown
>;

async function loginAsAdmin({
  callsign,
  code,
}: {
  callsign: string;
  code: string;
}) {
  const jwt = await exchangedCodeToJwt(code);
  const jwt_exchange_code = await createCallsign(callsign, jwt);
  return exchangedCodeToJwt(jwt_exchange_code);
}

async function exchangedCodeToJwt(code: string) {
  console.log("code:", code);
  const res = await fetch("/api/v1/token/code/exchange", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  if (res.status !== 200) {
    throw new Error("Failed to login as admin");
  }
  const data = (await res.json()) as Response;

  console.log("JWT:", data.jwt);
  return data.jwt;
}

interface Response2 {
  admin_added: boolean;
  jwt_exchange_code: string;
}

async function createCallsign(callsign: string, jwt: string) {
  const res = await fetch("/api/v1/firstuser/add-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ callsign }),
  });
  if (res.status !== 200) {
    throw new Error("Failed to login as admin");
  }
  const data = (await res.json()) as Response2;

  if (!data.admin_added) {
    throw new Error("Failed to login as admin");
  }

  console.log("Admin response:", data);

  return data.jwt_exchange_code;
}

export function useLoginAsAdmin(options?: UseCheckInviteCodeOptions) {
  return useMutation(loginAsAdmin, options);
}
