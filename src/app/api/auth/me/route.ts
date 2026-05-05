import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, verifySession } from "@/lib/auth";
import { getUserById, initUsersTable } from "@/services/auth-service";

export async function GET() {
  await initUsersTable();

  const token = (await cookies()).get(getSessionCookieName())?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const payload = verifySession(token);
    const user = await getUserById(payload.userId);
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    return NextResponse.json(user);
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
