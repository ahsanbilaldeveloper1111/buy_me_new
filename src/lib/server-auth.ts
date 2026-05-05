import { cookies } from "next/headers";

import { getSessionCookieName, verifySession } from "@/lib/auth";

export async function requireAuth() {
  const token = (await cookies()).get(getSessionCookieName())?.value;
  if (!token) return null;

  try {
    return verifySession(token);
  } catch {
    return null;
  }
}
