"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiRequestError, api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again.") {
  if (e instanceof ApiRequestError) {
    const first = e.error.details?.[0] as { message?: string } | undefined;
    return first?.message && e.status === 400 ? `${e.message}: ${first.message}` : e.message;
  }
  return fallback;
}

/**
 * Loads GET `path` (pass null to skip). Results are cached and shared between components,
 * and `reload()` refetches. Mutations made with `send()` refresh every query automatically.
 */
export function useApi<T>(path: string | null) {
  const query = useQuery<T>({
    queryKey: ["api", path],
    queryFn: () => api<T>(path as string),
    enabled: path !== null,
  });
  const { refetch } = query;
  const reload = useCallback(() => void refetch(), [refetch]);

  return {
    data: query.data ?? null,
    error: query.error ? errorMessage(query.error, "Could not load data. Is the API running?") : null,
    loading: path !== null && query.isLoading,
    reload,
  };
}

export async function send<T = unknown>(method: "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown) {
  const result = await api<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  // Any change can affect several screens (dashboards, lists, notifications), so refresh all cached data.
  void queryClient.invalidateQueries({ queryKey: ["api"] });
  return result;
}
