"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SubscriptionPlan,
  ClientAccount,
  Subscription,
  PaymentTransaction,
  ListingEligibility,
  PaymentMethod,
  UserRole,
} from "@/types";

/**
 * Official Subscription Plans (Mirrored for immediate SSR/hydration paint; live values loaded from /api/subscriptions/plans)
 * ZERO demo users, ZERO fake payments.
 */
export const OFFICIAL_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-monthly-599",
    slug: "monthly-plan",
    name: "Monthly Plan",
    description:
      "Standard monthly listing package for property owners, dealers, agents, builders, and developers in Delhi NCR.",
    price: 599,
    billing_period: "monthly",
    validity_months: 1,
    listing_credits: 20,
    features: [
      "20 Property Listing Credits",
      "Validity: 1 Month (30 Days)",
      "Separate from 5 Lifetime Free Credits",
      "Credits Added Upon Payment Verification",
      "Existing Published Properties Remain Live After Expiry",
      "Official Invoice & Payment Record",
    ],
    is_popular: false,
    is_active: true,
  },
  {
    id: "plan-quarterly-999",
    slug: "quarterly-plan",
    name: "Quarterly Plan",
    description:
      "Best value 3-month package for active property dealers, agents, builders, and developers.",
    price: 999,
    billing_period: "quarterly",
    validity_months: 3,
    listing_credits: 50,
    features: [
      "50 Property Listing Credits",
      "Validity: 3 Months (90 Days)",
      "Save ₹798 Compared to Monthly Renewals",
      "Separate from 5 Lifetime Free Credits",
      "Credits Added Upon Payment Verification",
      "Existing Published Properties Remain Live After Expiry",
      "Official Invoice & Payment Record",
    ],
    is_popular: true,
    is_active: true,
  },
];

// Legacy no-op exports kept solely for backwards module compatibility (credits are strictly enforced server-side)
export function consumeStoredCredit(_sellerMobile: string) {
  return { consumed: false };
}

export function refundStoredCredit(_sellerMobile: string) {
  return { refunded: false };
}

export function checkClientEligibility(
  customer: ClientAccount | null,
  source: "admin" | "owner" | "dealer" | "agent" | "builder" | "developer" = "owner"
): ListingEligibility {
  if (source === "admin") {
    return {
      eligible: true,
      reason: "Super Admin: Permanent unlimited free listings.",
      isUnlimited: true,
      freeCreditsTotal: 999999,
      freeCreditsUsed: 0,
      freeCreditsRemaining: 999999,
      paidCreditsTotal: 999999,
      paidCreditsUsed: 0,
      paidCreditsRemaining: 999999,
      subscriptionStatus: "active",
      planName: "Super Admin Unlimited",
      requiresSubscription: false,
      creditsExhausted: false,
    };
  }

  if (!customer) {
    return {
      eligible: true,
      reason: "Every new customer receives 5 lifetime free listing credits upon registration.",
      isUnlimited: false,
      freeCreditsTotal: 5,
      freeCreditsUsed: 0,
      freeCreditsRemaining: 5,
      paidCreditsTotal: 0,
      paidCreditsUsed: 0,
      paidCreditsRemaining: 0,
      subscriptionStatus: "none",
      requiresSubscription: false,
      creditsExhausted: false,
    };
  }

  const freeRemaining = Math.max(0, customer.free_credits_total - customer.free_credits_used);
  const paidRemaining = Math.max(0, customer.paid_credits_total - customer.paid_credits_used);
  const isSubActive =
    customer.subscription_status === "active" &&
    (!customer.current_period_end || new Date(customer.current_period_end) > new Date());

  if (freeRemaining > 0) {
    return {
      eligible: true,
      reason: `${freeRemaining} of ${customer.free_credits_total} lifetime free listing credits remaining.`,
      isUnlimited: false,
      freeCreditsTotal: customer.free_credits_total,
      freeCreditsUsed: customer.free_credits_used,
      freeCreditsRemaining: freeRemaining,
      paidCreditsTotal: customer.paid_credits_total,
      paidCreditsUsed: customer.paid_credits_used,
      paidCreditsRemaining: isSubActive ? paidRemaining : 0,
      subscriptionStatus: customer.subscription_status,
      planName: customer.current_plan_name,
      expiryDate: customer.current_period_end,
      requiresSubscription: false,
      creditsExhausted: false,
    };
  }

  if (isSubActive && paidRemaining > 0) {
    return {
      eligible: true,
      reason: `Active ${customer.current_plan_name || "Subscription"}: ${paidRemaining} listing credits remaining.`,
      isUnlimited: false,
      freeCreditsTotal: customer.free_credits_total,
      freeCreditsUsed: customer.free_credits_used,
      freeCreditsRemaining: 0,
      paidCreditsTotal: customer.paid_credits_total,
      paidCreditsUsed: customer.paid_credits_used,
      paidCreditsRemaining: paidRemaining,
      subscriptionStatus: "active",
      planName: customer.current_plan_name,
      expiryDate: customer.current_period_end,
      requiresSubscription: false,
      creditsExhausted: false,
    };
  }

  return {
    eligible: false,
    reason:
      customer.subscription_status === "pending"
        ? "Your subscription payment is pending manual verification by the Super Admin."
        : "Your 5 lifetime free credits are used and no active subscription credits remain. Purchase a Monthly (₹599) or Quarterly (₹999) plan.",
    isUnlimited: false,
    freeCreditsTotal: customer.free_credits_total,
    freeCreditsUsed: customer.free_credits_used,
    freeCreditsRemaining: 0,
    paidCreditsTotal: customer.paid_credits_total,
    paidCreditsUsed: customer.paid_credits_used,
    paidCreditsRemaining: 0,
    subscriptionStatus: customer.subscription_status,
    planName: customer.current_plan_name,
    expiryDate: customer.current_period_end,
    requiresSubscription: true,
    creditsExhausted: true,
  };
}

/**
 * Server-backed Subscription & Payment Store Hook.
 * Automatically loads public plans, and when called inside Admin Console loads real customer & payment records.
 */
export function useSubscriptionStore(options?: { adminMode?: boolean }) {
  const adminMode = Boolean(options?.adminMode);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(OFFICIAL_PLANS);
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const plansRes = await fetch("/api/subscriptions/plans", { cache: "no-store" });
      if (plansRes.ok) {
        const json = await plansRes.json();
        if (Array.isArray(json.plans) && json.plans.length > 0) {
          setPlans(json.plans);
        }
      }

      if (adminMode) {
        const [custRes, payRes] = await Promise.all([
          fetch("/api/admin/customers", { cache: "no-store" }),
          fetch("/api/admin/payments", { cache: "no-store" }),
        ]);

        if (custRes.ok) {
          const custJson = await custRes.json();
          setClients(Array.isArray(custJson.customers) ? custJson.customers : []);
          setSubscriptions(Array.isArray(custJson.subscriptions) ? custJson.subscriptions : []);
        }
        if (payRes.ok) {
          const payJson = await payRes.json();
          setPayments(Array.isArray(payJson.payments) ? payJson.payments : []);
        }
      }
    } catch (err) {
      console.error("Failed to sync subscription data:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [adminMode]);

  useEffect(() => {
    refresh();
    const handler = () => {
      refresh();
    };
    window.addEventListener("lp_subscriptions_updated", handler);
    return () => window.removeEventListener("lp_subscriptions_updated", handler);
  }, [refresh]);

  const notifyAll = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("lp_subscriptions_updated"));
      window.dispatchEvent(new Event("lp_customer_updated"));
    }
  };

  const submitSubscriptionPurchase = async (params: {
    planId: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    proofNotes?: string;
  }) => {
    const res = await fetch("/api/subscriptions/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit payment");
    notifyAll();
    return data;
  };

  const adminApprovePayment = async (transactionId: string, adminNotes?: string) => {
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, action: "approve", adminNotes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to approve payment");
    await refresh();
    notifyAll();
    return data;
  };

  const adminRejectPayment = async (transactionId: string, adminNotes: string) => {
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, action: "reject", adminNotes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to reject payment");
    await refresh();
    notifyAll();
    return data;
  };

  const adminManualActivate = async (
    customerId: string,
    planId: string,
    validityMonths?: number,
    notes?: string,
    creditsOverride?: number
  ) => {
    const res = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "activate_subscription",
        customerId,
        planId,
        validityMonths,
        creditsOverride,
        notes,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to activate subscription");
    await refresh();
    notifyAll();
    return data;
  };

  const adminDeactivateSubscription = async (customerId: string) => {
    const res = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deactivate_subscription", customerId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to deactivate subscription");
    await refresh();
    notifyAll();
    return data;
  };

  const adminAdjustCredits = async (
    customerId: string,
    params: { free_credits_total?: number; paid_credits_total?: number; add_paid_credits?: number }
  ) => {
    const res = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "adjust_credits", customerId, ...params }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to adjust credits");
    await refresh();
    notifyAll();
    return data;
  };

  const adminChangeRole = async (customerId: string, systemRole: UserRole) => {
    const res = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change_role", customerId, system_role: systemRole }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update role");
    await refresh();
    notifyAll();
    return data;
  };

  const adminUpdatePlan = async (
    planId: string,
    updates: Partial<Pick<SubscriptionPlan, "price" | "listing_credits" | "validity_months" | "name" | "description">>
  ) => {
    const res = await fetch("/api/subscriptions/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update plan");
    await refresh();
    notifyAll();
    return data;
  };

  return {
    plans,
    clients,
    payments,
    subscriptions,
    isLoaded,
    refresh,
    submitSubscriptionPurchase,
    adminApprovePayment,
    adminRejectPayment,
    adminManualActivate,
    adminDeactivateSubscription,
    adminAdjustCredits,
    adminChangeRole,
    adminUpdatePlan,
  };
}
