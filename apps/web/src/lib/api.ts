/**
 * API client for wedding backend.
 * Base URL: NEXT_PUBLIC_API_URL or http://localhost:9090
 * Handles token refresh 1 min before expiry and route-protection cookie.
 */

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090";

const TOKEN_KEY = "wedding_copilot_access_token";
const REFRESH_TOKEN_KEY = "wedding_copilot_refresh_token";
/** Cookie for middleware route protection (same name as in middleware.ts) */
export const AUTH_COOKIE_NAME = "wedding_copilot_token";
const REFRESH_BUFFER_SEC = 60;

/** Decode JWT payload without verification (client-side; only read exp). */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob !== "undefined" ? atob(raw) : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

/** True if token expires within REFRESH_BUFFER_SEC seconds. */
function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - REFRESH_BUFFER_SEC <= now;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Set both tokens and the auth cookie for middleware. */
export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=86400; samesite=lax`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
  }
}

/** Store both access and refresh tokens (e.g. after login/signup/refresh). */
export function setStoredTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(accessToken)}; path=/; max-age=86400; samesite=lax`;
}

type ApiError = { message?: string; status?: number };

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiClientError";
  }
}

let refreshPromise: Promise<void> | null = null;

/** Refresh tokens if access token is expiring within REFRESH_BUFFER_SEC. */
async function ensureValidToken(): Promise<void> {
  const access = getStoredToken();
  const refresh = getStoredRefreshToken();
  if (!access) return;
  if (!isTokenExpiringSoon(access)) return;
  if (!refresh) return;

  if (refreshPromise) {
    await refreshPromise;
    return;
  }

  refreshPromise = (async () => {
    try {
      const base = getBaseUrl();
      const res = await fetch(`${base}/auth/token/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        accessToken?: string;
        refreshToken?: string;
        message?: string;
      };
      if (res.ok && data.accessToken && data.refreshToken) {
        setStoredTokens(data.accessToken, data.refreshToken);
      } else {
        setStoredToken(null);
      }
    } catch {
      setStoredToken(null);
    } finally {
      refreshPromise = null;
    }
  })();

  await refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  await ensureValidToken();
  const { params, ...init } = options;
  const base = getBaseUrl();
  const url = path.startsWith("http") ? new URL(path) : new URL(path, base + "/");
  if (params && Object.keys(params).length) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url.toString(), {
    ...init,
    credentials: "include",
    headers,
  });
  const data = await res.json().catch(() => ({})) as { data?: T; message?: string };
  if (!res.ok) {
    const msg = (data as ApiError).message || data.message || res.statusText;
    throw new ApiClientError(msg, res.status);
  }
  return (data.data ?? data) as T;
}

// Auth
export type AuthTokens = { accessToken: string; refreshToken: string };

export const authApi = {
  signin: (body: { email: string; password: string }) =>
    request<{ user: unknown; tokens: AuthTokens }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signup: (body: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: unknown; tokens: AuthTokens }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signout: () => request("/auth/signout", { method: "POST" }),
  me: () => request<{ id: number; name: string; email: string }>("/auth/me"),
};

// Weddings
export type Wedding = {
  id: string;
  title: string;
  description?: string | null;
  weddingDate: string;
  venue?: string | null;
  venueAddress?: string | null;
  coverImageUrl?: string | null;
  host?: { id: number; name: string; email?: string };
  events?: Array<{
    id: string;
    name: string;
    eventDate: string;
    startTime: string;
    endTime?: string | null;
    location?: string | null;
  }>;
  guestStats?: { total?: number; accepted?: number; pending?: number; declined?: number; rsvpStatus?: string };
  stats?: { totalPhotos?: number };
  _count?: { photos?: number };
};

export const weddingsApi = {
  hosted: () => request<Wedding[]>("/weddings/hosted"),
  invited: () => request<Wedding[]>("/weddings/invited"),
  get: (weddingId: string) => request<Wedding>(`/weddings/${weddingId}`),
  create: (body: {
    title: string;
    weddingDate: string;
    venue?: string;
    description?: string;
    venueAddress?: string;
    coverImageUrl?: string;
  }) =>
    request<Wedding>("/weddings", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// Events
export type Event = {
  id: string;
  name: string;
  eventDate: string;
  startTime: string;
  endTime?: string | null;
  location?: string | null;
  description?: string | null;
};

export const eventsApi = {
  list: (weddingId: string) =>
    request<Event[]>(`/weddings/${weddingId}/events`),
  create: (weddingId: string, body: { events: Array<{ name: string; eventDate: string; startTime: string; endTime?: string; location?: string; description?: string }> }) =>
    request<Event[]>(`/weddings/${weddingId}/events`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (eventId: string, body: Partial<Event>) =>
    request<Event>(`/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (eventId: string) =>
    request(`/events/${eventId}`, { method: "DELETE" }),
};

// Guests / Invitations
export type Guest = {
  id: string;
  rsvpStatus: string;
  uploadPermission?: boolean;
  uploadRequestedAt?: string | null;
  user?: { name: string; email: string };
};

export const guestsApi = {
  list: (weddingId: string, params?: { rsvpStatus?: string; search?: string }) =>
    request<Guest[]>(
      `/weddings/${weddingId}/guests`,
      { params: params as Record<string, string> }
    ),
  add: (weddingId: string, body: { guests: Array<{ email: string }> }) =>
    request<{ invited: unknown[]; errors?: Array<{ email: string; error: string }> }>(
      `/weddings/${weddingId}/guests`,
      { method: "POST", body: JSON.stringify(body) }
    ),
  me: (weddingId: string) =>
    request<{ id: string; uploadPermission: boolean; uploadRequestedAt?: string | null; rsvpStatus: string }>(
      `/weddings/${weddingId}/guests/me`
    ),
  requestUpload: (weddingId: string) =>
    request<unknown>(`/weddings/${weddingId}/guests/upload-request`, {
      method: "POST",
    }),
  updateGuest: (weddingId: string, guestId: string, body: { uploadPermission?: boolean }) =>
    request<Guest>(`/weddings/${weddingId}/guests/${guestId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// Invite (public)
export const inviteApi = {
  get: (token: string) =>
    request<{
      guest: { id: string; rsvpStatus: string; user?: { name: string; email: string } };
      wedding: { id: string; title: string; weddingDate: string; venue?: string; host?: { name: string } };
      hasResponded: boolean;
    }>(`/invite/${token}`),
};

// RSVP (public)
export const rsvpApi = {
  submit: (
    token: string,
    body: { rsvpStatus: "accepted" | "declined"; rsvpNote?: string; setPassword?: string }
  ) =>
    request<{ user: unknown; accessToken: string; redirectTo: string }>(
      `/rsvp/${token}`,
      { method: "POST", body: JSON.stringify(body) }
    ),
};

// Photos
export type Photo = {
  id: string;
  originalUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  processingStatus?: string;
};

export const photosApi = {
  gallery: (weddingId: string, params?: { page?: string; limit?: string; eventId?: string }) =>
    request<{ photos: Photo[]; pagination: { page: number; totalCount: number; totalPages: number } }>(
      `/weddings/${weddingId}/photos`,
      { params: params as Record<string, string> }
    ),
  presign: (weddingId: string, body: { fileName: string; contentType: string }) =>
    request<{ uploadUrl: string; key: string; publicUrl: string }>(
      `/weddings/${weddingId}/photos/presign`,
      { method: "POST", body: JSON.stringify(body) }
    ),
  confirm: (weddingId: string, body: { key: string; eventId?: string; caption?: string }) =>
    request<Photo>(`/weddings/${weddingId}/photos/confirm`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  myPhotos: (weddingId?: string) =>
    request<{ photos: Photo[]; totalCount: number }>(
      "/photos/my-photos",
      weddingId ? { params: { weddingId } as Record<string, string> } : {}
    ),
  faceSamplePresign: (body: { fileName: string; contentType: string }) =>
    request<{ uploadUrl: string; key: string; publicUrl: string }>(
      "/photos/face-sample/presign",
      { method: "POST", body: JSON.stringify(body) }
    ),
  faceSample: (body: { imageUrl: string; guestId?: string }) =>
    request<{ faceEncodingId?: string; encodingQuality?: number; accepted?: boolean }>(
      "/photos/face-sample",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    ),
};
