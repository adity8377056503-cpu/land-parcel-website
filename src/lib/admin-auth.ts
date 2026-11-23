"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_STORAGE_KEY = "lp_admin_session";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check server session cookie first
    fetch("/api/admin/session")
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // Check localStorage as fallback
          const session = typeof window !== "undefined" ? localStorage.getItem(ADMIN_STORAGE_KEY) : null;
          if (session) {
            try {
              const parsed = JSON.parse(session);
              if (parsed.authenticated && parsed.expiresAt > Date.now()) {
                setIsAuthenticated(true);
                return;
              }
            } catch {}
          }
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      if (res.ok) {
        const session = {
          authenticated: true,
          email: email.trim().toLowerCase(),
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
        }
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  return { isAuthenticated, login, logout };
}
