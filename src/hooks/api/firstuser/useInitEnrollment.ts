import { type UseMutationOptions, useMutation } from "@tanstack/react-query";

interface Response {
  callsign: string;
  approvecode: string;
  jwt: string;
}

class StatusCodeError extends Error {
  statusCode: number;

  constructor(statusCode: number) {
    super(`Error with status code: ${statusCode}`);
    this.statusCode = statusCode;
    this.name = "StatusCodeError";
  }
}

async function initEnrollment({
  callsign,
  invite_code,
}: {
  callsign: string;
  invite_code: string;
}): Promise<Response> {
  const res = await fetch("/api/v1/enrollment/invitecode/enroll", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ callsign, invite_code }),
  });

  if (!res.ok) {
    throw new StatusCodeError(res.status);
  }

  const data = (await res.json()) as Response;
  return data;
}

type UseInitEnrollmentOptions = Omit<
  UseMutationOptions<
    Response,
    StatusCodeError,
    { callsign: string; invite_code: string }
  >,
  "mutationFn"
>;

export function useInitEnrollment(options?: UseInitEnrollmentOptions) {
  return useMutation({ mutationFn: initEnrollment, ...options });
}
