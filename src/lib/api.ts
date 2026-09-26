export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v2${path}`, init);
  if (!res.ok) throw new ApiError(res.status);
  return res.json() as Promise<T>;
}

export const get = <T>(path: string, headers?: HeadersInit) =>
  request<T>(path, { headers });

export const post = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
