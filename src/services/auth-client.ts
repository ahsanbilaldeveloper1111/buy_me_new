import type { LoginInput, RegisterInput, User } from "@/models/user";

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function registerRequest(payload: RegisterInput) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse<User>(res);
}

export async function loginRequest(payload: LoginInput) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse<User>(res);
}

export async function logoutRequest() {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
}

export async function fetchMe() {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  return parseResponse<User>(res);
}
