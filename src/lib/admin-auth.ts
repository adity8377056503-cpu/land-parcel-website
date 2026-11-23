"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AdminUserInfo {
  userId: string;
  name: string;
  mobile: string;
  email: string;
  role: "super_admin" | "admin";
  accountType: string;
  expiresAt?: number;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(null);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAdminUser(data.user);
          setIsAuthenticated(true);
          return;
        }
      }
      setAdminUser(null);
      setIsAuthenticated(false);
    } catch {
      setAdminUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ ok: boolean; error?: string; user?: AdminUserInfo }> => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUser(data.user);
        setIsAuthenticated(true);
        return { ok: true, user: data.user };
      }
      return { ok: false, error: data.error || "Invalid credentials" };
    } catch {
      return { ok: false, error: "Authentication service unavailable" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setAdminUser(null);
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  return {
    isAuthenticated,
    adminUser,
    isSuperAdmin: adminUser?.role === "super_admin",
    login,
    logout,
    refreshSession,
  };
}
