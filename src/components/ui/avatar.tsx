import { cn } from "@/lib/utils";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/** Profile picture, or the user's initials when none is set. */
export function Avatar({ name, url, className }: { name: string; url?: string; className?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={cn("h-9 w-9 shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-primary", className)}
    >
      {initials(name)}
    </span>
  );
}
