import { type UseMutationOptions, useMutation } from "react-query";

interface DeleteUserResponse {
  invite_code: string;
}

async function deleteUser(callsign: string) {
  const res = await fetch("/api/v1/people/" + callsign, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status !== 200) {
    throw new Error("Failed to login as admin");
  }

  const data = (await res.json()) as DeleteUserResponse;

  return data.invite_code;
}

type UseDeleteUserOptions = UseMutationOptions<string, Error, string, unknown>;

export function useDeleteUser(options?: UseDeleteUserOptions) {
  return useMutation(deleteUser, options);
}
