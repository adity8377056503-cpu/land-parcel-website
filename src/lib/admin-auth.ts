"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_STORAGE_KEY = "lp_admin_session";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = typeof window !== "undefined" ? localStorage.getItem(ADMIN_STORAGE_KEY) : null;
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.authenticated && parsed.expiresAt > Date.now()) {
          setIsAuthenticated(true);
          return;
        }
      } catch {
        // invalid session
      }
    }
    setIsAuthenticated(false);
  }, []);

  const login = (email: string, pass: string): boolean => {
    // Default admin credential (can be overridden in settings or env)
    const validEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@landparcel.in";
    const validPass = "Admin@LandParcel2026";

    if (email.trim().toLowerCase() === validEmail.toLowerCase() && pass === validPass) {
      const session = {
        authenticated: true,
        email,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  return { isAuthenticated, login, logout };
}
