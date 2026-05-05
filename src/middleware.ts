import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "session_token";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-insecure-secret-change-me");
  const { payload } = await jwtVerify(token, secret);
  const userId = Number(payload.userId);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  return { userId };
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const auth = await verifyToken(token);
    if (!auth) return new NextResponse("Unauthorized", { status: 401 });

    const headers = new Headers(request.headers);
    headers.set("x-user-id", String(auth.userId));
    return NextResponse.next({ request: { headers } });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}

export const config = {
  matcher: ["/api/tasks/:path*"]
};
