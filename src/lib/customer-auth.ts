"use client";

import { useState, useEffect, useCallback } from "react";
import { ClientAccount, CustomerAccountType, ListingEligibility } from "@/types";

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<ClientAccount | null>(null);
  const [eligibility, setEligibility] = useState<ListingEligibility | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
          setEligibility(data.eligibility || null);
          setIsLoaded(true);
          return data.customer as ClientAccount;
        }
      }
      setCustomer(null);
      setEligibility(null);
    } catch {
      setCustomer(null);
      setEligibility(null);
    } finally {
      setIsLoaded(true);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshCustomer();
    const handler = () => {
      refreshCustomer();
    };
    window.addEventListener("lp_customer_updated", handler);
    return () => window.removeEventListener("lp_customer_updated", handler);
  }, [refreshCustomer]);

  const sendOtp = async (mobile: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send OTP");
    return data as {
      success: boolean;
      message: string;
      expiresInSeconds: number;
      deliveryMode: "sms_gateway" | "local_console";
      devOtp?: string;
    };
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Invalid OTP");
    if (!data.requiresRegistration && data.customer) {
      setCustomer(data.customer);
      setEligibility(data.eligibility || null);
      window.dispatchEvent(new Event("lp_customer_updated"));
    }
    return data as {
      success: boolean;
      requiresRegistration: boolean;
      mobile?: string;
      registrationToken?: string;
      customer?: ClientAccount;
      eligibility?: ListingEligibility;
      message?: string;
    };
  };

  const completeRegistration = async (params: {
    registrationToken: string;
    name: string;
    email?: string;
    accountType: CustomerAccountType;
    companyName?: string;
  }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setCustomer(data.customer);
    setEligibility(data.eligibility || null);
    window.dispatchEvent(new Event("lp_customer_updated"));
    return data.customer as ClientAccount;
  };

  const updateProfile = async (updates: {
    name?: string;
    email?: string;
    accountType?: CustomerAccountType;
    companyName?: string;
  }) => {
    const res = await fetch("/api/auth/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Profile update failed");
    setCustomer(data.customer);
    setEligibility(data.eligibility || null);
    window.dispatchEvent(new Event("lp_customer_updated"));
    return data.customer as ClientAccount;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCustomer(null);
    setEligibility(null);
    window.dispatchEvent(new Event("lp_customer_updated"));
  };

  return {
    customer,
    eligibility,
    isAuthenticated: Boolean(customer),
    isLoaded,
    sendOtp,
    verifyOtp,
    completeRegistration,
    updateProfile,
    logout,
    refreshCustomer,
  };
}
