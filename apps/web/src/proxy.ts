/**
 * Protects /dashboard and /wedding routes by validating the auth cookie
 * via /api/proxy/me (which calls backend /auth/me). Redirects to /login if not authenticated.
 * Next.js 16 proxy convention (replaces middleware).
 */

import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/wedding/:path*"],
};

export async function proxy(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const cookieHeader = request.headers.get("cookie") ?? "";

  const res = await fetch(`${origin}/api/proxy/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}
