import { QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/api";

/** Client errors (4xx) will not change on retry; only network problems and 5xx are retried. */
const shouldRetry = (failureCount: number, error: unknown) => !(error instanceof ApiRequestError && error.status < 500) && failureCount < 2;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // Cached data is shown instantly and refreshed in the background (stale-while-revalidate).
      queries: { retry: shouldRetry, refetchOnWindowFocus: false, staleTime: 0 },
    },
  });
}

/** Shared by the data hooks and by mutations, which refresh everything after a change. */
export const queryClient = createQueryClient();
