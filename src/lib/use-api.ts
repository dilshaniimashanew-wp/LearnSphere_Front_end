"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, api } from "@/lib/api";

export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again.") {
  if (e instanceof ApiRequestError) {
    const first = e.error.details?.[0] as { message?: string } | undefined;
    return first?.message && e.status === 400 ? `${e.message}: ${first.message}` : e.message;
  }
  return fallback;
}

/** Loads GET `path` (pass null to skip). `reload()` refetches after a mutation. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let active = true;
    api<T>(path)
      .then((d) => {
        if (!active) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e, "Could not load data. Is the API running?"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload, setData };
}

export function send<T = unknown>(method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown) {
  return api<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
}
