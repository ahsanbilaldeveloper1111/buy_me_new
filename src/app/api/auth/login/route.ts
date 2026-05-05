import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, signSession } from "@/lib/auth";
import { loginSchema } from "@/models/user";
import { initUsersTable, loginUser } from "@/services/auth-service";

export async function POST(request: Request) {
  await initUsersTable();

  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return new NextResponse(parsed.error.message, { status: 400 });

  const user = await loginUser(parsed.data);
  if (!user) return new NextResponse("Invalid credentials", { status: 401 });

  const token = signSession({ userId: user.id, email: user.email });
  (await cookies()).set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return NextResponse.json(user);
}
