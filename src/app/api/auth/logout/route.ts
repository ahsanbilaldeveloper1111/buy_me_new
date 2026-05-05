import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/lib/auth";

export async function POST() {
  (await cookies()).set(getSessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return new NextResponse(null, { status: 204 });
}
