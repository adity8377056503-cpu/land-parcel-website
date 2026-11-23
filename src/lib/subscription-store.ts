"use client";

import { useState, useEffect } from "react";
import {
  SubscriptionPlan,
  ClientAccount,
  Subscription,
  PaymentTransaction,
  ListingEligibility,
  ClientRole,
  PaymentMethod,
} from "@/types";
import { generateId, OFFICIAL_BUSINESS } from "@/lib/utils";

const STORAGE_KEY_PLANS = "lp_official_subscription_plans_v2";
const STORAGE_KEY_CLIENTS = "lp_clients_registry_v2";
const STORAGE_KEY_SUBSCRIPTIONS = "lp_subscriptions_list_v2";
const STORAGE_KEY_PAYMENTS = "lp_payments_list_v2";
const STORAGE_KEY_ACTIVE_CLIENT = "lp_active_session_client_v2";

/**
 * OFFICIAL LAND PARCEL SUBSCRIPTION PLANS
 * Plan 1 - Monthly: ₹599, 1 Month Validity, 20 Listing Credits
 * Plan 2 - Quarterly: ₹999, 3 Months Validity, 50 Listing Credits
 */
export const OFFICIAL_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-monthly-599",
    slug: "monthly-plan",
    name: "Monthly Plan",
    description: "Standard monthly listing package for property owners, brokers, and developers in Delhi NCR.",
    price: 599,
    billing_period: "monthly",
    validity_months: 1,
    listing_credits: 20,
    features: [
      "20 Property Listing Credits",
      "Validity: 1 Month (30 Days)",
      "Direct WhatsApp Inquiries (8750442235)",
      "Separate from 5 Lifetime Free Credits",
      "Standard Locality Placement",
      "Official Tax Invoice & Receipt",
      "Owner & Deal Verification",
    ],
    is_popular: false,
    is_active: true,
  },
  {
    id: "plan-quarterly-999",
    slug: "quarterly-plan",
    name: "Quarterly Plan",
    description: "Best value 3-month package for active dealers, real estate consultants, and builders.",
    price: 999,
    billing_period: "quarterly",
    validity_months: 3,
    listing_credits: 50,
    features: [
      "50 Property Listing Credits",
      "Validity: 3 Months (90 Days)",
      "Save ₹798 Compared to Monthly Renewals",
      "Direct WhatsApp Inquiries (8750442235)",
      "Separate from 5 Lifetime Free Credits",
      "Priority Locality Search Placement",
      "Official Tax Invoice & Receipt",
      "Priority Verification by Suraj Prakash",
    ],
    is_popular: true,
    is_active: true,
  },
];

export const INITIAL_CLIENTS: ClientAccount[] = [
  {
    id: "client-rajesh-sharma",
    name: "Rajesh Sharma",
    mobile: "9811002233",
    email: "rajesh.sharma@example.com",
    role: "owner",
    free_credits_total: 5,
    free_credits_used: 2, // 2 published properties consumed out of 5 lifetime
    paid_credits_total: 0,
    paid_credits_used: 0,
    subscription_status: "none",
    created_at: "2026-11-01T10:00:00Z",
    updated_at: "2026-11-20T14:30:00Z",
  },
  {
    id: "client-amit-verma",
    name: "Amit Verma (Delhi NCR Realtors)",
    mobile: "8750442235", // Official WhatsApp contact
    email: OFFICIAL_BUSINESS.email,
    role: "agent",
    company_name: "Delhi NCR Property Consultants",
    free_credits_total: 5,
    free_credits_used: 5, // All 5 lifetime free used
    paid_credits_total: 50, // Active Quarterly Plan
    paid_credits_used: 12, // 38 remaining
    subscription_status: "active",
    current_plan_id: "plan-quarterly-999",
    current_plan_name: "Quarterly Plan (50 Credits / 3 Months)",
    current_period_start: "2026-11-15T00:00:00Z",
    current_period_end: "2027-02-15T23:59:59Z", // Active for 3 months
    created_at: "2026-10-15T09:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "client-suresh-gupta",
    name: "Suresh Gupta (Gupta Properties)",
    mobile: "9988776655",
    email: "suresh@guptaproperties.com",
    role: "agent",
    company_name: "Gupta Properties Dwarka",
    free_credits_total: 5,
    free_credits_used: 5, // All 5 free used
    paid_credits_total: 20,
    paid_credits_used: 20, // Exhausted
    subscription_status: "expired",
    current_plan_id: "plan-monthly-599",
    current_plan_name: "Monthly Plan (20 Credits)",
    current_period_start: "2026-10-01T00:00:00Z",
    current_period_end: "2026-11-01T23:59:59Z", // Expired
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-11-02T00:00:00Z",
  },
  {
    id: "client-dlf-estates",
    name: "DLF Builders & Developers",
    mobile: "9899001122",
    email: "corporate@dlfinfra.com",
    role: "developer",
    company_name: "DLF Premium Infra",
    free_credits_total: 5,
    free_credits_used: 5,
    paid_credits_total: 0,
    paid_credits_used: 0,
    subscription_status: "pending",
    current_plan_id: "plan-quarterly-999",
    current_plan_name: "Quarterly Plan (50 Credits)",
    created_at: "2026-11-15T11:00:00Z",
    updated_at: "2026-11-22T16:00:00Z",
  },
];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: "pay-tx-101",
    transaction_id: "TXN_UPI_9899001122_001",
    invoice_number: "INV-LP-2026-002",
    client_id: "client-dlf-estates",
    client_name: "DLF Builders & Developers",
    client_mobile: "9899001122",
    client_email: "corporate@dlfinfra.com",
    plan_id: "plan-quarterly-999",
    plan_name: "Quarterly Plan (₹999 · 50 Credits)",
    amount: 999,
    status: "pending_verification",
    payment_method: "offline_upi",
    reference_number: "UPI-875044223598",
    proof_notes: "Transferred ₹999 via Google Pay to 8750442235 (Suraj Prakash). Ref: UPI-875044223598",
    submitted_at: "2026-11-22T15:45:00Z",
  },
  {
    id: "pay-tx-100",
    transaction_id: "TXN_RZP_8750442235_001",
    invoice_number: "INV-LP-2026-001",
    client_id: "client-amit-verma",
    client_name: "Amit Verma (Delhi NCR Realtors)",
    client_mobile: "8750442235",
    client_email: OFFICIAL_BUSINESS.email,
    plan_id: "plan-quarterly-999",
    plan_name: "Quarterly Plan (₹999 · 50 Credits)",
    amount: 999,
    status: "verified",
    payment_method: "offline_bank_transfer",
    reference_number: "NEFT-8750442235-HDFC",
    proof_notes: "NEFT Verified by Suraj Prakash on business bank account.",
    submitted_at: "2026-11-15T11:30:00Z",
    verified_at: "2026-11-15T12:00:00Z",
    verified_by: OFFICIAL_BUSINESS.email,
  },
];

// Local storage helpers
function loadData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading ${key}:`, err);
    return fallback;
  }
}

function saveData<T>(key: string, data: T) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event("lp_subscription_updated"));
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
    }
  }
}

/**
 * Standalone helper to consume credit when listing is approved/published by admin.
 * Pending, rejected or incomplete submissions NEVER consume credits.
 * Consumes lifetime free credits first (up to 5), then purchased subscription credits.
 */
export function consumeStoredCredit(sellerMobile?: string, source?: string) {
  if (source === "admin" || !sellerMobile) return;
  const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
  const normalizedMobile = sellerMobile.replace(/\D/g, "").slice(-10);

  const updated = currentClients.map((client) => {
    if (client.mobile.replace(/\D/g, "").slice(-10) === normalizedMobile) {
      // 1. Consume from 5 lifetime free credits if available
      if (client.free_credits_used < client.free_credits_total) {
        return {
          ...client,
          free_credits_used: client.free_credits_used + 1,
          updated_at: new Date().toISOString(),
        };
      }
      // 2. Otherwise consume from purchased plan credits if active
      if (
        client.subscription_status === "active" &&
        (client.paid_credits_used || 0) < (client.paid_credits_total || 0)
      ) {
        return {
          ...client,
          paid_credits_used: (client.paid_credits_used || 0) + 1,
          updated_at: new Date().toISOString(),
        };
      }
    }
    return client;
  });

  saveData(STORAGE_KEY_CLIENTS, updated);
}

/**
 * Standalone helper to refund credit if a published listing is unpublished or rejected
 */
export function refundStoredCredit(sellerMobile?: string, source?: string) {
  if (source === "admin" || !sellerMobile) return;
  const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
  const normalizedMobile = sellerMobile.replace(/\D/g, "").slice(-10);

  const updated = currentClients.map((client) => {
    if (client.mobile.replace(/\D/g, "").slice(-10) === normalizedMobile) {
      if ((client.paid_credits_used || 0) > 0) {
        return {
          ...client,
          paid_credits_used: (client.paid_credits_used || 0) - 1,
          updated_at: new Date().toISOString(),
        };
      } else if (client.free_credits_used > 0) {
        return {
          ...client,
          free_credits_used: client.free_credits_used - 1,
          updated_at: new Date().toISOString(),
        };
      }
    }
    return client;
  });

  saveData(STORAGE_KEY_CLIENTS, updated);
}

/**
 * Check if a user is eligible to submit a new listing (offline helper)
 */
export function checkClientEligibilityOffline(mobile?: string, source?: string): ListingEligibility {
  // Land Parcel Admin gets unlimited free listings permanently
  if (source === "admin") {
    return {
      eligible: true,
      reason: "Land Parcel Admin: Permanently FREE unlimited property uploads.",
      isUnlimited: true,
      freeCreditsTotal: Infinity,
      freeCreditsUsed: 0,
      freeCreditsRemaining: Infinity,
      paidCreditsTotal: Infinity,
      paidCreditsUsed: 0,
      paidCreditsRemaining: Infinity,
      subscriptionStatus: "active",
      planName: "Land Parcel Admin (Unlimited Free)",
      requiresSubscription: false,
      creditsExhausted: false,
    };
  }

  if (!mobile) {
    return {
      eligible: true,
      reason: "New client: 5 Lifetime Free Property Listing Credits included.",
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

  const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
  const normalizedMobile = mobile.replace(/\D/g, "").slice(-10);
  const client = currentClients.find(
    (c) => c.mobile.replace(/\D/g, "").slice(-10) === normalizedMobile
  );

  if (!client) {
    return {
      eligible: true,
      reason: "Welcome to Land Parcel! You have 5 lifetime free listing credits.",
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

  const freeRemaining = Math.max(0, client.free_credits_total - client.free_credits_used);
  const paidRemaining = Math.max(0, (client.paid_credits_total || 0) - (client.paid_credits_used || 0));

  // 1. If client still has free lifetime credits
  if (freeRemaining > 0) {
    return {
      eligible: true,
      reason: `Free Plan: ${client.free_credits_used} of 5 lifetime credits used (${freeRemaining} remaining).`,
      isUnlimited: false,
      freeCreditsTotal: client.free_credits_total,
      freeCreditsUsed: client.free_credits_used,
      freeCreditsRemaining: freeRemaining,
      paidCreditsTotal: client.paid_credits_total || 0,
      paidCreditsUsed: client.paid_credits_used || 0,
      paidCreditsRemaining: paidRemaining,
      subscriptionStatus: client.subscription_status,
      requiresSubscription: false,
      creditsExhausted: false,
    };
  }

  // 2. All 5 free credits used. Check active subscription
  const isSubscriptionActive =
    client.subscription_status === "active" &&
    (!client.current_period_end || new Date(client.current_period_end) > new Date());

  if (isSubscriptionActive) {
    if (paidRemaining > 0) {
      return {
        eligible: true,
        reason: `Active ${client.current_plan_name || "Subscription"}: ${paidRemaining} listing credits remaining (Expires ${
          client.current_period_end ? new Date(client.current_period_end).toLocaleDateString("en-IN") : ""
        }).`,
        isUnlimited: false,
        freeCreditsTotal: client.free_credits_total,
        freeCreditsUsed: client.free_credits_used,
        freeCreditsRemaining: 0,
        paidCreditsTotal: client.paid_credits_total || 0,
        paidCreditsUsed: client.paid_credits_used || 0,
        paidCreditsRemaining: paidRemaining,
        subscriptionStatus: "active",
        planName: client.current_plan_name,
        expiryDate: client.current_period_end,
        requiresSubscription: false,
        creditsExhausted: false,
      };
    } else {
      // Subscription active by date, but credits exhausted!
      return {
        eligible: false,
        reason: `Subscription listing credits exhausted (${client.paid_credits_total}/${client.paid_credits_total} used). Please renew your subscription to list additional properties.`,
        isUnlimited: false,
        freeCreditsTotal: client.free_credits_total,
        freeCreditsUsed: client.free_credits_used,
        freeCreditsRemaining: 0,
        paidCreditsTotal: client.paid_credits_total || 0,
        paidCreditsUsed: client.paid_credits_used || 0,
        paidCreditsRemaining: 0,
        subscriptionStatus: "active",
        planName: client.current_plan_name,
        expiryDate: client.current_period_end,
        requiresSubscription: true,
        creditsExhausted: true,
      };
    }
  }

  // 3. No active subscription and free credits exhausted!
  return {
    eligible: false,
    reason: "Free listing quota of 5 properties has been exhausted. An active subscription is required to submit additional properties.",
    isUnlimited: false,
    freeCreditsTotal: client.free_credits_total,
    freeCreditsUsed: client.free_credits_used,
    freeCreditsRemaining: 0,
    paidCreditsTotal: client.paid_credits_total || 0,
    paidCreditsUsed: client.paid_credits_used || 0,
    paidCreditsRemaining: 0,
    subscriptionStatus: client.subscription_status,
    planName: client.current_plan_name,
    expiryDate: client.current_period_end,
    requiresSubscription: true,
    creditsExhausted: true,
  };
}

/**
 * Hook to access and manage subscriptions, plans, client balances, and official invoices
 */
export function useSubscriptionStore() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(OFFICIAL_PLANS);
  const [clients, setClients] = useState<ClientAccount[]>(INITIAL_CLIENTS);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [activeClient, setActiveClient] = useState<ClientAccount>(INITIAL_CLIENTS[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshData = () => {
    const loadedPlans = loadData(STORAGE_KEY_PLANS, OFFICIAL_PLANS);
    const loadedClients = loadData(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
    const loadedPayments = loadData(STORAGE_KEY_PAYMENTS, INITIAL_PAYMENTS);
    const activeClientId = loadData(STORAGE_KEY_ACTIVE_CLIENT, INITIAL_CLIENTS[0].id);

    setPlans(loadedPlans);
    setClients(loadedClients);
    setPayments(loadedPayments);

    const foundActive = loadedClients.find((c: ClientAccount) => c.id === activeClientId) || loadedClients[0];
    setActiveClient(foundActive);
    setIsLoaded(true);
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener("lp_subscription_updated", handleUpdate);
    return () => window.removeEventListener("lp_subscription_updated", handleUpdate);
  }, []);

  const switchActiveClient = (clientId: string) => {
    const currentClients = loadData(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
    const target = currentClients.find((c: ClientAccount) => c.id === clientId);
    if (target) {
      setActiveClient(target);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ACTIVE_CLIENT, JSON.stringify(target.id));
      }
    }
  };

  const getOrCreateClient = (mobile: string, name?: string, role: ClientRole = "owner", email?: string): ClientAccount => {
    const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
    const normalizedMobile = mobile.replace(/\D/g, "").slice(-10);

    let found = currentClients.find(
      (c) => c.mobile.replace(/\D/g, "").slice(-10) === normalizedMobile
    );

    if (!found) {
      found = {
        id: `client-${generateId()}`,
        name: name || `Client ${normalizedMobile}`,
        mobile: normalizedMobile,
        email: email || "",
        role: role,
        free_credits_total: 5,
        free_credits_used: 0,
        paid_credits_total: 0,
        paid_credits_used: 0,
        subscription_status: "none",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [found, ...currentClients];
      saveData(STORAGE_KEY_CLIENTS, updated);
      setClients(updated);
    }
    return found;
  };

  const checkEligibility = (mobile?: string, source?: string): ListingEligibility => {
    return checkClientEligibilityOffline(mobile, source);
  };

  /**
   * Submit offline payment reference (UPI / Bank Transfer)
   */
  const submitOfflinePayment = (params: {
    clientId: string;
    planId: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    proofNotes?: string;
  }) => {
    const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
    const currentPlans = loadData<SubscriptionPlan[]>(STORAGE_KEY_PLANS, OFFICIAL_PLANS);
    const currentPayments = loadData<PaymentTransaction[]>(STORAGE_KEY_PAYMENTS, INITIAL_PAYMENTS);

    const client = currentClients.find((c) => c.id === params.clientId);
    const plan = currentPlans.find((p) => p.id === params.planId);

    if (!client || !plan) throw new Error("Client or Plan not found");

    const newPayment: PaymentTransaction = {
      id: `pay-${generateId()}`,
      transaction_id: `TXN_${params.referenceNumber.slice(-8)}_${Date.now().toString().slice(-4)}`,
      invoice_number: `INV-LP-${Date.now().toString().slice(-6)}`,
      client_id: client.id,
      client_name: client.name,
      client_mobile: client.mobile,
      client_email: client.email || OFFICIAL_BUSINESS.email,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.price,
      status: "pending_verification",
      payment_method: params.paymentMethod,
      reference_number: params.referenceNumber,
      proof_notes: params.proofNotes,
      submitted_at: new Date().toISOString(),
    };

    const updatedPayments = [newPayment, ...currentPayments];
    saveData(STORAGE_KEY_PAYMENTS, updatedPayments);
    setPayments(updatedPayments);

    // Update client status to 'pending'
    const updatedClients = currentClients.map((c) => {
      if (c.id === client.id) {
        return {
          ...c,
          subscription_status: "pending" as const,
          current_plan_id: plan.id,
          current_plan_name: `${plan.name} (₹${plan.price})`,
          updated_at: new Date().toISOString(),
        };
      }
      return c;
    });

    saveData(STORAGE_KEY_CLIENTS, updatedClients);
    setClients(updatedClients);

    return newPayment;
  };

  /**
   * Admin verifies payment and activates subscription:
   * Sets paid_credits_total to plan.listing_credits (20 or 50), paid_credits_used = 0
   */
  const adminApprovePayment = (transactionId: string, adminNotes?: string) => {
    const currentPayments = loadData<PaymentTransaction[]>(STORAGE_KEY_PAYMENTS, INITIAL_PAYMENTS);
    const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
    const currentPlans = loadData<SubscriptionPlan[]>(STORAGE_KEY_PLANS, OFFICIAL_PLANS);

    const tx = currentPayments.find((p) => p.id === transactionId);
    if (!tx) return;

    const plan = currentPlans.find((p) => p.id === tx.plan_id) || currentPlans[0];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.validity_months * 30);

    const updatedPayments = currentPayments.map((p) => {
      if (p.id === transactionId) {
        return {
          ...p,
          status: "verified" as const,
          verified_at: new Date().toISOString(),
          verified_by: `${OFFICIAL_BUSINESS.owner_name} (${OFFICIAL_BUSINESS.email})`,
          admin_notes: adminNotes || "Payment verified and approved by admin.",
        };
      }
      return p;
    });

    saveData(STORAGE_KEY_PAYMENTS, updatedPayments);
    setPayments(updatedPayments);

    const updatedClients = currentClients.map((c) => {
      if (c.id === tx.client_id) {
        return {
          ...c,
          subscription_status: "active" as const,
          current_plan_id: plan.id,
          current_plan_name: `${plan.name} (${plan.listing_credits} Credits / ${plan.validity_months} Month${plan.validity_months > 1 ? "s" : ""})`,
          paid_credits_total: plan.listing_credits,
          paid_credits_used: 0, // Fresh credits for new billing period
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return c;
    });

    saveData(STORAGE_KEY_CLIENTS, updatedClients);
    setClients(updatedClients);
  };

  /**
   * Admin rejects invalid payment reference
   */
  const adminRejectPayment = (transactionId: string, reason: string) => {
    const currentPayments = loadData<PaymentTransaction[]>(STORAGE_KEY_PAYMENTS, INITIAL_PAYMENTS);
    const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);

    const tx = currentPayments.find((p) => p.id === transactionId);
    if (!tx) return;

    const updatedPayments = currentPayments.map((p) => {
      if (p.id === transactionId) {
        return {
          ...p,
          status: "rejected" as const,
          verified_at: new Date().toISOString(),
          verified_by: `${OFFICIAL_BUSINESS.owner_name} (${OFFICIAL_BUSINESS.email})`,
          admin_notes: reason,
        };
      }
      return p;
    });

    saveData(STORAGE_KEY_PAYMENTS, updatedPayments);
    setPayments(updatedPayments);

    const updatedClients = currentClients.map((c) => {
      if (c.id === tx.client_id) {
        return {
          ...c,
          subscription_status: (c.free_credits_used >= c.free_credits_total ? "expired" : "none") as any,
          updated_at: new Date().toISOString(),
        };
      }
      return c;
    });

    saveData(STORAGE_KEY_CLIENTS, updatedClients);
    setClients(updatedClients);
  };

  /**
   * Admin manually activates or extends a client subscription
   */
  const adminManualActivate = (clientId: string, planId: string, validityMonths = 1, notes?: string) => {
    const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
    const currentPlans = loadData<SubscriptionPlan[]>(STORAGE_KEY_PLANS, OFFICIAL_PLANS);

    const plan = currentPlans.find((p) => p.id === planId) || currentPlans[0];
    const credits = plan.listing_credits;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + validityMonths * 30);

    const updatedClients = currentClients.map((c) => {
      if (c.id === clientId) {
        return {
          ...c,
          subscription_status: "active" as const,
          current_plan_id: plan.id,
          current_plan_name: `${plan.name} (${credits} Credits / ${validityMonths} Mo)`,
          paid_credits_total: credits,
          paid_credits_used: 0,
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return c;
    });

    saveData(STORAGE_KEY_CLIENTS, updatedClients);
    setClients(updatedClients);
  };

  /**
   * Admin suspends or cancels a client subscription
   */
  const adminSuspendSubscription = (clientId: string) => {
    const currentClients = loadData<ClientAccount[]>(STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
    const updatedClients = currentClients.map((c) => {
      if (c.id === clientId) {
        return {
          ...c,
          subscription_status: "cancelled" as const,
          updated_at: new Date().toISOString(),
        };
      }
      return c;
    });

    saveData(STORAGE_KEY_CLIENTS, updatedClients);
    setClients(updatedClients);
  };

  /**
   * Admin updates plan prices, validity and listing limits
   */
  const adminUpdatePlan = (planId: string, updates: Partial<SubscriptionPlan>) => {
    const currentPlans = loadData<SubscriptionPlan[]>(STORAGE_KEY_PLANS, OFFICIAL_PLANS);
    const updatedPlans = currentPlans.map((p) => (p.id === planId ? { ...p, ...updates } : p));
    saveData(STORAGE_KEY_PLANS, updatedPlans);
    setPlans(updatedPlans);
  };

  return {
    isLoaded,
    plans,
    clients,
    payments,
    activeClient,
    switchActiveClient,
    getOrCreateClient,
    checkEligibility,
    consumeCreditOnApproval: consumeStoredCredit,
    refundCredit: refundStoredCredit,
    submitOfflinePayment,
    adminApprovePayment,
    adminRejectPayment,
    adminManualActivate,
    adminSuspendSubscription,
    adminUpdatePlan,
  };
}
