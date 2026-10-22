import type { ApiError } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public error: ApiError,
  ) {
    super(error.message);
  }
}

/** Auth calls that must never trigger a refresh-and-retry (it would loop or hide real credential errors). */
const NO_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout", "/auth/forgot-password"];

// Several requests can hit an expired access token at once; they all wait for one refresh.
let refreshing: Promise<boolean> | null = null;

function refreshSession() {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request(path: string, init: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

/**
 * Thin fetch wrapper: HttpOnly cookies are sent automatically, JSON in/out, typed errors.
 * When the 15 minute access token has expired it refreshes the session once and retries.
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await request(path, init);

  if (res.status === 401 && !NO_REFRESH.includes(path)) {
    if (await refreshSession()) {
      res = await request(path, init);
    } else if (typeof window !== "undefined") {
      // The refresh token is gone or expired: tell the app so it can send the user to sign in.
      window.dispatchEvent(new Event("auth:expired"));
    }
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiRequestError(res.status, body?.error ?? { code: "UNKNOWN", message: "Something went wrong" });
  }
  return (body?.data ?? body) as T;
}
