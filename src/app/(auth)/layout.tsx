import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-accent px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <GraduationCap className="h-7 w-7 text-primary" aria-hidden />
        LearnSphere
      </Link>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">{children}</div>
    </div>
  );
}
