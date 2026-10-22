import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star rating. The visible stars are decorative; the label carries the value. */
export function Stars({ value, count, className }: { value: number; count?: number; className?: string }) {
  const label =
    count === 0 || !value
      ? "No ratings yet"
      : `${value} out of 5${count !== undefined ? `, ${count} review${count === 1 ? "" : "s"}` : ""}`;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)} role="img" aria-label={label}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={cn("h-3.5 w-3.5", value >= n - 0.25 ? "fill-warning text-warning" : "text-border")} />
        ))}
      </span>
      <span aria-hidden>{value ? value.toFixed(1) : "New"}</span>
      {count !== undefined && count > 0 && <span aria-hidden>({count})</span>}
    </span>
  );
}
