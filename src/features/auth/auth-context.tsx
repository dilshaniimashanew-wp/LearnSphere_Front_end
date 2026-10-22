"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Role, User } from "@/types";
import type { LoginValues, RegisterValues } from "./schemas";

// Demo mode lets the UI be explored before the Express API exists.
// It stores only a fake, non-sensitive user in localStorage. Real auth uses HttpOnly cookies.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_KEY = "learnsphere-demo-user";

const demoUsers: Record<Role, User> = {
  student: { id: "d-s", name: "Demo Student", email: "student@demo.test", role: "student", status: "active" },
  instructor: { id: "d-i", name: "Demo Instructor", email: "instructor@demo.test", role: "instructor", status: "active" },
  admin: { id: "d-a", name: "Demo Admin", email: "admin@demo.test", role: "admin", status: "active" },
};

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (values: LoginValues) => Promise<User>;
  register: (values: Omit<RegisterValues, "confirmPassword">) => Promise<User>;
  logout: () => Promise<void>;
  loginAsDemo: (role: Role) => User;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (DEMO_MODE) {
          const stored = localStorage.getItem(DEMO_KEY);
          if (stored && active) setUser(JSON.parse(stored) as User);
        } else {
          const me = await api<User>("/auth/me");
          if (active) setUser(me);
        }
      } catch {
        // Not signed in, or API unreachable: stay signed out.
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (values: LoginValues) => {
    const u = await api<User>("/auth/login", { method: "POST", body: JSON.stringify(values) });
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (values: Omit<RegisterValues, "confirmPassword">) => {
    const u = await api<User>("/auth/register", { method: "POST", body: JSON.stringify(values) });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    if (DEMO_MODE) localStorage.removeItem(DEMO_KEY);
    else await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
  }, []);

  const loginAsDemo = useCallback((role: Role) => {
    const u = demoUsers[role];
    localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, loginAsDemo }),
    [user, loading, login, register, logout, loginAsDemo],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function homePathFor(role: Role) {
  return `/${role}`;
}
