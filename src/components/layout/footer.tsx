import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LearnSphere. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/courses" className="hover:text-foreground">
            Courses
          </Link>
          <Link href="/verify" className="hover:text-foreground">
            Verify certificate
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
