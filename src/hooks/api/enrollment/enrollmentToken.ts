// JWT issued by rmapi when an invite code is claimed; only enrollment calls use it.
const TOKEN_KEY = "token";

export const saveToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const hasToken = () => localStorage.getItem(TOKEN_KEY) !== null;

export const authHeader = (): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ""}`,
});
