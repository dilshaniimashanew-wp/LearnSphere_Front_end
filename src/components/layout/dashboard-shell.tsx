"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  FileCheck2,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  ShieldCheck,
  Users,
  X,
  Award,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/feedback";
import { homePathFor, useAuth } from "@/features/auth/auth-context";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navByRole: Record<Role, NavItem[]> = {
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/courses", label: "My courses", icon: BookOpen },
    { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/student/grades", label: "Grades", icon: FileCheck2 },
    { href: "/student/certificates", label: "Certificates", icon: Award },
    { href: "/student/notifications", label: "Notifications", icon: Bell },
    { href: "/student/profile", label: "Profile", icon: UserCircle },
  ],
  instructor: [
    { href: "/instructor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/instructor/courses", label: "My courses", icon: BookOpen },
    { href: "/instructor/submissions", label: "Submissions", icon: FileCheck2 },
    { href: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/instructor/notifications", label: "Notifications", icon: Bell },
    { href: "/instructor/profile", label: "Profile", icon: UserCircle },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/courses", label: "Course approvals", icon: ShieldCheck },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText },
  ],
};

/** Shared sidebar layout. Also guards the route client-side; the API must enforce the same rules. */
export function DashboardShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Signing out empties `user`; without this the guard below would send the user to /login instead of home.
  const signingOut = useRef(false);

  useEffect(() => {
    if (loading || signingOut.current) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (user.role !== role) router.replace(homePathFor(user.role));
  }, [loading, user, role, router, pathname]);

  async function signOut() {
    signingOut.current = true;
    await logout();
    router.push("/");
  }

  if (loading || !user || user.role !== role) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-8" aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const items = navByRole[role];

  const nav = (
    <nav aria-label="Dashboard" className="flex-1 space-y-1 p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === `/${role}` ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
              active ? "bg-accent font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <Link href="/" className="flex h-16 items-center gap-2 border-b border-border px-5 font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden />
          LearnSphere
        </Link>
        {nav}
        <SidebarUser name={user.name} avatarUrl={user.avatarUrl} role={role} onLogout={() => void signOut()} />
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" aria-hidden />
            LearnSphere
          </Link>
          <button
            className="rounded-lg p-2 hover:bg-muted"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        {open && (
          <div className="border-b border-border bg-card md:hidden">
            {nav}
            <SidebarUser name={user.name} avatarUrl={user.avatarUrl} role={role} onLogout={() => void signOut()} />
          </div>
        )}
        <main className="mx-auto max-w-5xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarUser({ name, avatarUrl, role, onLogout }: { name: string; avatarUrl?: string; role: Role; onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between border-t border-border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={name} url={avatarUrl} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs capitalize text-muted-foreground">{role}</p>
        </div>
      </div>
      <button onClick={onLogout} aria-label="Sign out" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
