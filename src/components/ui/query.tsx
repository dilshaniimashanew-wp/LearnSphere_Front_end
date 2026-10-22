import { Alert, Skeleton } from "@/components/ui/feedback";

/** Shared loading / error wrapper so every screen handles both states the same way. */
export function Query({ loading, error, children }: { loading: boolean; error: string | null; children: React.ReactNode }) {
  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-busy="true">
        <span className="sr-only">Loading</span>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (error) return <Alert tone="danger">{error}</Alert>;
  return <>{children}</>;
}
