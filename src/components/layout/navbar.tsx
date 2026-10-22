"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { ButtonLink, Button } from "@/components/ui/button";
import { homePathFor, useAuth } from "@/features/auth/auth-context";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/verify", label: "Verify certificate" },
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden />
          LearnSphere
        </Link>

        <ul className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-muted-foreground hover:text-foreground">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <>
              <ButtonLink href={homePathFor(user.role)} variant="outline" size="sm">
                Dashboard
              </ButtonLink>
              <Button variant="ghost" size="sm" onClick={() => void logout()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 hover:bg-muted md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="space-y-1 border-t border-border px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-muted">
              {l.label}
            </Link>
          ))}
          {user ? (
            <Link href={homePathFor(user.role)} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-muted">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-muted">
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
