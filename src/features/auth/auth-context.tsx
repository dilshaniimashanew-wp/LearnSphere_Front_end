"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import type { Role, User } from "@/types";
import type { LoginValues, RegisterValues } from "./schemas";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (values: LoginValues) => Promise<User>;
  register: (values: Omit<RegisterValues, "confirmPassword">) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // The session lives in an HttpOnly cookie; ask the API who we are on first load.
  useEffect(() => {
    let active = true;
    api<User>("/auth/me")
      .then((me) => active && setUser(me))
      .catch(() => undefined) // not signed in, or API unreachable
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // api() fires this when a session can no longer be refreshed.
  useEffect(() => {
    const expire = () => {
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener("auth:expired", expire);
    return () => window.removeEventListener("auth:expired", expire);
  }, []);

  const login = useCallback(async (values: LoginValues) => {
    const u = await api<User>("/auth/login", { method: "POST", body: JSON.stringify(values) });
    queryClient.clear();
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (values: Omit<RegisterValues, "confirmPassword">) => {
    const u = await api<User>("/auth/register", { method: "POST", body: JSON.stringify(values) });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    queryClient.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
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
