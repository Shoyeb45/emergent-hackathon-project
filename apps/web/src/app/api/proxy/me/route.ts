/**
 * Proxies to backend /auth/me using the auth cookie.
 * Used by middleware for route protection so the backend is the source of truth.
 */

import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "wedding_copilot_token";

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090";
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data);
}
