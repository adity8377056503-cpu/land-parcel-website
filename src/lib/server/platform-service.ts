import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  ClientAccount,
  CustomerAccountType,
  Enquiry,
  ListingEligibility,
  PaymentMethod,
  PaymentTransaction,
  Subscription,
  SubscriptionPlan,
  UserRole,
} from "@/types";
import { generateLeadId } from "@/lib/utils";
import { normalizeIndianMobile } from "@/lib/server/customer-auth";

const DATA_DIR = path.join(process.cwd(), "data");
const PLANS_FILE = path.join(DATA_DIR, "plans.json");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, "subscriptions.json");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");
const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");

/**
 * Official Subscription Plans (NO fake customers, NO fake payments, NO fake leads)
 */
export const DEFAULT_OFFICIAL_PLANS: SubscriptionPlan[] = [
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

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !key.includes("placeholder") &&
      url.startsWith("https://")
  );
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Failed to write ${path.basename(filePath)}:`, err);
  }
}

function normalizeCustomerRecord(c: any): ClientAccount {
  const now = new Date();
  let status = c.subscription_status || "none";
  if (status === "active" && c.current_period_end && new Date(c.current_period_end) <= now) {
    status = "expired";
  }

  return {
    id: c.id,
    user_id: c.user_id || undefined,
    name: c.name,
    mobile: normalizeIndianMobile(c.mobile),
    email: c.email || undefined,
    role: (c.role || "owner") as CustomerAccountType,
    system_role: (c.system_role || "customer") as UserRole,
    is_mobile_verified: Boolean(c.is_mobile_verified ?? true),
    company_name: c.company_name || undefined,
    rera_number: c.rera_number || undefined,
    pan_number: c.pan_number || undefined,
    free_credits_total: Number(c.free_credits_total ?? 5),
    free_credits_used: Number(c.free_credits_used ?? 0),
    paid_credits_total: Number(c.paid_credits_total ?? 0),
    paid_credits_used: Number(c.paid_credits_used ?? 0),
    subscription_status: status,
    status: (c.status || "active") as "active" | "suspended",
    internal_notes: Array.isArray(c.internal_notes) ? c.internal_notes : [],
    current_plan_id: c.current_plan_id || undefined,
    current_plan_name: c.current_plan_name || undefined,
    current_period_start: c.current_period_start || undefined,
    current_period_end: c.current_period_end || undefined,
    created_at: c.created_at || now.toISOString(),
    updated_at: c.updated_at || now.toISOString(),
  };
}

export class PlatformService {
  // =========================================================================
  // 1. SUBSCRIPTION PLANS
  // =========================================================================
  static async getPlans(): Promise<SubscriptionPlan[]> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description || "",
            price: Number(p.price),
            billing_period: p.billing_period === "quarterly" ? "quarterly" : "monthly",
            validity_months: Number(p.validity_months || (p.billing_period === "quarterly" ? 3 : 1)),
            listing_credits: Number(p.listing_credits ?? p.listing_quota ?? 20),
            features: Array.isArray(p.features) ? p.features : [],
            is_popular: Boolean(p.is_popular),
            is_active: Boolean(p.is_active),
          }));
        }
      } catch (err) {
        console.error("Supabase getPlans error:", err);
      }
    }
    return readJsonFile<SubscriptionPlan[]>(PLANS_FILE, DEFAULT_OFFICIAL_PLANS);
  }

  static async updatePlan(
    planId: string,
    updates: Partial<Pick<SubscriptionPlan, "name" | "description" | "price" | "listing_credits" | "validity_months" | "is_active">>
  ): Promise<SubscriptionPlan | null> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const dbPayload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) dbPayload.name = updates.name;
        if (updates.description !== undefined) dbPayload.description = updates.description;
        if (updates.price !== undefined) dbPayload.price = updates.price;
        if (updates.validity_months !== undefined) {
          dbPayload.validity_months = updates.validity_months;
          dbPayload.billing_period = updates.validity_months >= 3 ? "quarterly" : "monthly";
        }
        if (updates.listing_credits !== undefined) {
          dbPayload.listing_credits = updates.listing_credits;
          dbPayload.listing_quota = updates.listing_credits;
        }
        if (updates.is_active !== undefined) dbPayload.is_active = updates.is_active;

        const { data, error } = await supabase
          .from("subscription_plans")
          .update(dbPayload)
          .or(`id.eq.${planId},slug.eq.${planId}`)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            slug: data.slug,
            name: data.name,
            description: data.description || "",
            price: Number(data.price),
            billing_period: data.billing_period === "quarterly" ? "quarterly" : "monthly",
            validity_months: Number(data.validity_months || 1),
            listing_credits: Number(data.listing_credits ?? data.listing_quota ?? 20),
            features: Array.isArray(data.features) ? data.features : [],
            is_popular: Boolean(data.is_popular),
            is_active: Boolean(data.is_active),
          };
        }
      } catch (err) {
        console.error("Supabase updatePlan error:", err);
      }
    }

    const plans = readJsonFile<SubscriptionPlan[]>(PLANS_FILE, DEFAULT_OFFICIAL_PLANS);
    const idx = plans.findIndex((p) => p.id === planId || p.slug === planId);
    if (idx === -1) return null;

    plans[idx] = {
      ...plans[idx],
      ...updates,
      billing_period:
        updates.validity_months !== undefined
          ? updates.validity_months >= 3
            ? "quarterly"
            : "monthly"
          : plans[idx].billing_period,
    };
    writeJsonFile(PLANS_FILE, plans);
    return plans[idx];
  }

  // =========================================================================
  // 2. CUSTOMER ACCOUNTS (NO DEMO USERS SEEDED)
  // =========================================================================
  static async getAllCustomers(): Promise<ClientAccount[]> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const { data, error } = await supabase
          .from("client_accounts")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map(normalizeCustomerRecord);
        }
      } catch (err) {
        console.error("Supabase getAllCustomers error:", err);
      }
    }
    return readJsonFile<ClientAccount[]>(CUSTOMERS_FILE, []).map(normalizeCustomerRecord);
  }

  static async getCustomerById(id: string): Promise<ClientAccount | null> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const { data, error } = await supabase
          .from("client_accounts")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!error && data) return normalizeCustomerRecord(data);
      } catch (err) {
        console.error("Supabase getCustomerById error:", err);
      }
    }
    const list = readJsonFile<ClientAccount[]>(CUSTOMERS_FILE, []);
    const found = list.find((c) => c.id === id);
    return found ? normalizeCustomerRecord(found) : null;
  }

  static async getCustomerByMobile(rawMobile: string): Promise<ClientAccount | null> {
    const mobile = normalizeIndianMobile(rawMobile);
    if (!mobile) return null;

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const { data, error } = await supabase
          .from("client_accounts")
          .select("*")
          .eq("mobile", mobile)
          .maybeSingle();

        if (!error && data) return normalizeCustomerRecord(data);
      } catch (err) {
        console.error("Supabase getCustomerByMobile error:", err);
      }
    }
    const list = readJsonFile<ClientAccount[]>(CUSTOMERS_FILE, []);
    const found = list.find((c) => normalizeIndianMobile(c.mobile) === mobile);
    return found ? normalizeCustomerRecord(found) : null;
  }

  /**
   * Registers a new customer account with strictly customer role and 5 lifetime free credits.
   */
  static async createCustomer(params: {
    name: string;
    mobile: string;
    email?: string;
    accountType: CustomerAccountType;
    companyName?: string;
    isMobileVerified?: boolean;
  }): Promise<ClientAccount> {
    const mobile = normalizeIndianMobile(params.mobile);
    const existing = await this.getCustomerByMobile(mobile);
    if (existing) return existing;

    const now = new Date().toISOString();
    const newAccount: ClientAccount = {
      id: crypto.randomUUID(),
      name: params.name.trim(),
      mobile,
      email: params.email?.trim() || undefined,
      role: params.accountType || "owner",
      system_role: "customer", // Always customer on registration — never admin/super_admin
      is_mobile_verified: Boolean(params.isMobileVerified ?? true),
      company_name: params.companyName?.trim() || undefined,
      free_credits_total: 5,
      free_credits_used: 0,
      paid_credits_total: 0,
      paid_credits_used: 0,
      subscription_status: "none",
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const { data, error } = await supabase
          .from("client_accounts")
          .insert({
            id: newAccount.id,
            name: newAccount.name,
            mobile: newAccount.mobile,
            email: newAccount.email || null,
            role: newAccount.role,
            system_role: "customer",
            is_mobile_verified: newAccount.is_mobile_verified,
            company_name: newAccount.company_name || null,
            free_credits_total: 5,
            free_credits_used: 0,
            paid_credits_total: 0,
            paid_credits_used: 0,
            subscription_status: "none",
          })
          .select()
          .single();

        if (!error && data) {
          return normalizeCustomerRecord(data);
        }
      } catch (err) {
        console.error("Supabase createCustomer error, using server fallback:", err);
      }
    }

    const list = readJsonFile<ClientAccount[]>(CUSTOMERS_FILE, []);
    list.unshift(newAccount);
    writeJsonFile(CUSTOMERS_FILE, list);
    return newAccount;
  }

  static async updateCustomer(
    id: string,
    updates: Partial<ClientAccount>
  ): Promise<ClientAccount | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const payload: Record<string, any> = { updated_at: now };

        const allowedKeys: (keyof ClientAccount)[] = [
          "name",
          "email",
          "role",
          "system_role",
          "company_name",
          "status",
          "internal_notes",
          "free_credits_total",
          "free_credits_used",
          "paid_credits_total",
          "paid_credits_used",
          "subscription_status",
          "current_plan_id",
          "current_plan_name",
          "current_period_start",
          "current_period_end",
        ];

        for (const k of allowedKeys) {
          if (updates[k] !== undefined) {
            payload[k] = updates[k];
          }
        }

        const { data, error } = await supabase
          .from("client_accounts")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          return normalizeCustomerRecord(data);
        }
      } catch (err) {
        console.error("Supabase updateCustomer error:", err);
      }
    }

    const list = readJsonFile<ClientAccount[]>(CUSTOMERS_FILE, []);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      updated_at: now,
    };
    writeJsonFile(CUSTOMERS_FILE, list);
    return normalizeCustomerRecord(list[idx]);
  }

  /**
   * Computes server-verified listing eligibility for a customer account.
   */
  static computeEligibility(customer: ClientAccount | null): ListingEligibility {
    if (!customer) {
      return {
        eligible: true,
        reason: "New account: 5 lifetime free listing credits available upon registration.",
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
    const now = new Date();
    const isSubActive =
      customer.subscription_status === "active" &&
      (!customer.current_period_end || new Date(customer.current_period_end) > now);
    const isSubExpired =
      customer.subscription_status === "expired" ||
      (customer.subscription_status === "active" &&
        Boolean(customer.current_period_end && new Date(customer.current_period_end) <= now));

    if (freeRemaining > 0) {
      return {
        eligible: true,
        reason: `You have ${freeRemaining} of ${customer.free_credits_total} lifetime free listing credits remaining.`,
        isUnlimited: false,
        freeCreditsTotal: customer.free_credits_total,
        freeCreditsUsed: customer.free_credits_used,
        freeCreditsRemaining: freeRemaining,
        paidCreditsTotal: customer.paid_credits_total,
        paidCreditsUsed: customer.paid_credits_used,
        paidCreditsRemaining: isSubActive ? paidRemaining : 0,
        subscriptionStatus: isSubExpired ? "expired" : customer.subscription_status,
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

    let reason =
      "All 5 lifetime free listing credits have been used. Purchase Monthly (₹599) or Quarterly (₹999) plan to submit more properties.";
    if (customer.subscription_status === "pending") {
      reason = "Your subscription payment is pending manual verification by the Super Admin.";
    } else if (isSubExpired) {
      reason = "Your subscription has expired. Renew your plan to submit new properties (existing published listings stay live).";
    } else if (isSubActive && paidRemaining <= 0) {
      reason = "All subscription listing credits have been used. Purchase or renew a plan to continue listing.";
    }

    return {
      eligible: false,
      reason,
      isUnlimited: false,
      freeCreditsTotal: customer.free_credits_total,
      freeCreditsUsed: customer.free_credits_used,
      freeCreditsRemaining: 0,
      paidCreditsTotal: customer.paid_credits_total,
      paidCreditsUsed: customer.paid_credits_used,
      paidCreditsRemaining: 0,
      subscriptionStatus: isSubExpired ? "expired" : customer.subscription_status,
      planName: customer.current_plan_name,
      expiryDate: customer.current_period_end,
      requiresSubscription: true,
      creditsExhausted: true,
    };
  }

  /**
   * Consumes 1 credit ONLY when an external customer's listing is approved & published.
   * Free credits are used first; then purchased credits from an active non-expired subscription.
   */
  static async consumeCreditOnPublish(mobileOrCustomerId: string): Promise<{
    consumed: boolean;
    creditType?: "free" | "paid";
  }> {
    let customer = await this.getCustomerById(mobileOrCustomerId);
    if (!customer) {
      customer = await this.getCustomerByMobile(mobileOrCustomerId);
    }
    if (!customer) return { consumed: false };

    const freeRemaining = customer.free_credits_total - customer.free_credits_used;
    if (freeRemaining > 0) {
      await this.updateCustomer(customer.id, {
        free_credits_used: customer.free_credits_used + 1,
      });
      return { consumed: true, creditType: "free" };
    }

    const isSubActive =
      customer.subscription_status === "active" &&
      (!customer.current_period_end || new Date(customer.current_period_end) > new Date());
    const paidRemaining = customer.paid_credits_total - customer.paid_credits_used;

    if (isSubActive && paidRemaining > 0) {
      await this.updateCustomer(customer.id, {
        paid_credits_used: customer.paid_credits_used + 1,
      });
      return { consumed: true, creditType: "paid" };
    }

    return { consumed: false };
  }

  // =========================================================================
  // 3. PAYMENTS & SUBSCRIPTIONS (NO FAKE TRANSACTIONS EVER GENERATED)
  // =========================================================================
  static async getAllPayments(clientId?: string): Promise<PaymentTransaction[]> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        let query = supabase
          .from("payment_transactions")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (clientId) {
          query = query.eq("client_id", clientId);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data.map((tx: any) => ({
            ...tx,
            amount: Number(tx.amount),
          }));
        }
      } catch (err) {
        console.error("Supabase getAllPayments error:", err);
      }
    }

    const list = readJsonFile<PaymentTransaction[]>(PAYMENTS_FILE, []);
    return clientId ? list.filter((p) => p.client_id === clientId) : list;
  }

  static async getAllSubscriptions(clientId?: string): Promise<Subscription[]> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        let query = supabase
          .from("subscriptions")
          .select("*")
          .order("created_at", { ascending: false });

        if (clientId) query = query.eq("client_id", clientId);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data.map((s: any) => ({
            ...s,
            amount: Number(s.amount),
            validity_months: Number(s.validity_months || 1),
            listing_credits: Number(s.listing_credits || 20),
          }));
        }
      } catch (err) {
        console.error("Supabase getAllSubscriptions error:", err);
      }
    }

    const list = readJsonFile<Subscription[]>(SUBSCRIPTIONS_FILE, []);
    return clientId ? list.filter((s) => s.client_id === clientId) : list;
  }

  /**
   * Customer submits a subscription purchase payment for manual verification.
   * Status is ALWAYS 'pending_verification' — NEVER auto-verified or fake-approved.
   */
  static async submitSubscriptionPurchase(params: {
    customerId: string;
    planId: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    proofNotes?: string;
  }): Promise<{ transaction: PaymentTransaction; customer: ClientAccount } | null> {
    const customer = await this.getCustomerById(params.customerId);
    if (!customer) return null;

    const plans = await this.getPlans();
    const plan = plans.find((p) => p.id === params.planId || p.slug === params.planId);
    if (!plan) return null;

    const now = new Date().toISOString();
    const refClean = params.referenceNumber.trim();
    const tx: PaymentTransaction = {
      id: crypto.randomUUID(),
      transaction_id: `TXN_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
      invoice_number: `INV-LP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      client_id: customer.id,
      client_name: customer.name,
      client_mobile: customer.mobile,
      client_email: customer.email,
      plan_id: plan.id,
      plan_name: `${plan.name} (₹${plan.price} · ${plan.listing_credits} Credits)`,
      amount: plan.price,
      status: "pending_verification",
      payment_method: params.paymentMethod,
      reference_number: refClean,
      proof_notes: params.proofNotes?.trim() || undefined,
      submitted_at: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        await supabase.from("payment_transactions").insert({
          id: tx.id,
          transaction_id: tx.transaction_id,
          invoice_number: tx.invoice_number,
          client_id: tx.client_id,
          client_name: tx.client_name,
          client_mobile: tx.client_mobile,
          client_email: tx.client_email || null,
          plan_id: plan.id,
          plan_name: tx.plan_name,
          amount: tx.amount,
          status: "pending_verification",
          payment_method: tx.payment_method,
          reference_number: tx.reference_number,
          proof_notes: tx.proof_notes || null,
          submitted_at: tx.submitted_at,
        });
      } catch (err) {
        console.error("Supabase insert payment error:", err);
      }
    } else {
      const list = readJsonFile<PaymentTransaction[]>(PAYMENTS_FILE, []);
      list.unshift(tx);
      writeJsonFile(PAYMENTS_FILE, list);
    }

    // Mark customer subscription status pending (unless already active with credits)
    const updatedCustomer =
      customer.subscription_status === "active"
        ? customer
        : (await this.updateCustomer(customer.id, {
            subscription_status: "pending",
            current_plan_id: plan.id,
            current_plan_name: plan.name,
          })) || customer;

    return { transaction: tx, customer: updatedCustomer };
  }

  /**
   * Super Admin verifies and approves a customer payment -> activates subscription & adds purchased credits.
   */
  static async approvePayment(
    transactionId: string,
    verifiedBy: string,
    adminNotes?: string
  ): Promise<{ transaction: PaymentTransaction; customer: ClientAccount; subscription: Subscription } | null> {
    const payments = await this.getAllPayments();
    const tx = payments.find((p) => p.id === transactionId || p.transaction_id === transactionId);
    if (!tx || tx.status === "verified") return null;

    const customer = await this.getCustomerById(tx.client_id);
    if (!customer) return null;

    const plans = await this.getPlans();
    const plan = plans.find((p) => p.id === tx.plan_id || p.slug === tx.plan_id) || plans[0];

    const now = new Date();
    const validityMonths = plan.validity_months || (plan.billing_period === "quarterly" ? 3 : 1);
    const creditsToAdd = plan.listing_credits || 20;

    // Extend from current active expiry if renewing early, else start today
    const baseDate =
      customer.subscription_status === "active" &&
      customer.current_period_end &&
      new Date(customer.current_period_end) > now
        ? new Date(customer.current_period_end)
        : now;
    const expiryDate = new Date(baseDate);
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

    const subscription: Subscription = {
      id: crypto.randomUUID(),
      client_id: customer.id,
      client_name: customer.name,
      client_mobile: customer.mobile,
      plan_id: plan.id,
      plan_name: `${plan.name} (${creditsToAdd} Credits / ${validityMonths} ${validityMonths > 1 ? "Months" : "Month"})`,
      amount: tx.amount,
      billing_cycle: plan.billing_period,
      validity_months: validityMonths,
      listing_credits: creditsToAdd,
      status: "active",
      start_date: now.toISOString(),
      end_date: expiryDate.toISOString(),
      payment_method: tx.payment_method,
      payment_reference: tx.reference_number,
      admin_notes: adminNotes || `Verified by ${verifiedBy}`,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const verifiedTx: PaymentTransaction = {
      ...tx,
      status: "verified",
      subscription_id: subscription.id,
      verified_at: now.toISOString(),
      verified_by: verifiedBy,
      admin_notes: adminNotes || `Payment verified and activated by ${verifiedBy}`,
    };

    // Carry over any unused paid credits (from manual grant or previous plan) + add newly purchased credits
    const existingActiveRemaining = Math.max(0, (customer.paid_credits_total || 0) - (customer.paid_credits_used || 0));

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();

        await supabase.from("subscriptions").insert({
          id: subscription.id,
          client_id: subscription.client_id,
          plan_id: subscription.plan_id,
          plan_name: subscription.plan_name,
          status: "active",
          amount: subscription.amount,
          billing_cycle: subscription.billing_cycle,
          validity_months: subscription.validity_months,
          listing_credits: subscription.listing_credits,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          payment_method: subscription.payment_method,
          payment_reference: subscription.payment_reference,
          admin_notes: subscription.admin_notes,
        });

        await supabase
          .from("payment_transactions")
          .update({
            status: "verified",
            subscription_id: subscription.id,
            verified_at: verifiedTx.verified_at,
            verified_by: verifiedTx.verified_by,
            admin_notes: verifiedTx.admin_notes,
          })
          .eq("id", tx.id);
      } catch (err) {
        console.error("Supabase approvePayment error:", err);
      }
    } else {
      const subs = readJsonFile<Subscription[]>(SUBSCRIPTIONS_FILE, []);
      subs.unshift(subscription);
      writeJsonFile(SUBSCRIPTIONS_FILE, subs);

      const allTx = readJsonFile<PaymentTransaction[]>(PAYMENTS_FILE, []);
      const idx = allTx.findIndex((p) => p.id === tx.id);
      if (idx !== -1) {
        allTx[idx] = verifiedTx;
        writeJsonFile(PAYMENTS_FILE, allTx);
      }
    }

    const updatedCustomer =
      (await this.updateCustomer(customer.id, {
        subscription_status: "active",
        current_plan_id: plan.id,
        current_plan_name: subscription.plan_name,
        current_period_start: subscription.start_date,
        current_period_end: subscription.end_date,
        paid_credits_total: existingActiveRemaining + creditsToAdd,
        paid_credits_used: 0,
      })) || customer;

    return { transaction: verifiedTx, customer: updatedCustomer, subscription };
  }

  /**
   * Super Admin rejects a pending payment transaction. Never adds credits.
   */
  static async rejectPayment(
    transactionId: string,
    rejectedBy: string,
    reason: string
  ): Promise<PaymentTransaction | null> {
    const payments = await this.getAllPayments();
    const tx = payments.find((p) => p.id === transactionId || p.transaction_id === transactionId);
    if (!tx) return null;

    const now = new Date().toISOString();
    const rejectedTx: PaymentTransaction = {
      ...tx,
      status: "rejected",
      verified_at: now,
      verified_by: rejectedBy,
      admin_notes: reason || "Payment could not be verified.",
    };

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        await supabase
          .from("payment_transactions")
          .update({
            status: "rejected",
            verified_at: rejectedTx.verified_at,
            verified_by: rejectedTx.verified_by,
            admin_notes: rejectedTx.admin_notes,
          })
          .eq("id", tx.id);
      } catch (err) {
        console.error("Supabase rejectPayment error:", err);
      }
    } else {
      const allTx = readJsonFile<PaymentTransaction[]>(PAYMENTS_FILE, []);
      const idx = allTx.findIndex((p) => p.id === tx.id);
      if (idx !== -1) {
        allTx[idx] = rejectedTx;
        writeJsonFile(PAYMENTS_FILE, allTx);
      }
    }

    const customer = await this.getCustomerById(tx.client_id);
    if (customer && customer.subscription_status === "pending") {
      await this.updateCustomer(customer.id, {
        subscription_status: customer.current_period_end ? "expired" : "none",
      });
    }

    return rejectedTx;
  }

  /**
   * Super Admin manually activates a subscription for a customer after off-platform verification.
   */
  static async manualActivateSubscription(params: {
    customerId: string;
    planId: string;
    validityMonths?: number;
    creditsOverride?: number;
    activatedBy: string;
    notes?: string;
  }): Promise<ClientAccount | null> {
    const customer = await this.getCustomerById(params.customerId);
    if (!customer) return null;

    const plans = await this.getPlans();
    const plan = plans.find((p) => p.id === params.planId || p.slug === params.planId) || plans[0];

    const months = params.validityMonths || plan.validity_months || 1;
    const credits = params.creditsOverride ?? plan.listing_credits ?? 20;
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + months);

    const sub: Subscription = {
      id: crypto.randomUUID(),
      client_id: customer.id,
      client_name: customer.name,
      client_mobile: customer.mobile,
      plan_id: plan.id,
      plan_name: `${plan.name} (${credits} Credits / ${months} ${months > 1 ? "Months" : "Month"})`,
      amount: plan.price,
      billing_cycle: months >= 3 ? "quarterly" : "monthly",
      validity_months: months,
      listing_credits: credits,
      status: "active",
      start_date: now.toISOString(),
      end_date: expiry.toISOString(),
      payment_method: "offline_cash",
      payment_reference: `MANUAL-${Date.now().toString(36).toUpperCase()}`,
      admin_notes: params.notes || `Manually activated by ${params.activatedBy}`,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        await supabase.from("subscriptions").insert({
          id: sub.id,
          client_id: sub.client_id,
          plan_id: sub.plan_id,
          plan_name: sub.plan_name,
          status: "active",
          amount: sub.amount,
          billing_cycle: sub.billing_cycle,
          validity_months: sub.validity_months,
          listing_credits: sub.listing_credits,
          start_date: sub.start_date,
          end_date: sub.end_date,
          payment_method: sub.payment_method,
          payment_reference: sub.payment_reference,
          admin_notes: sub.admin_notes,
        });
      } catch (err) {
        console.error("Supabase manualActivate error:", err);
      }
    } else {
      const subs = readJsonFile<Subscription[]>(SUBSCRIPTIONS_FILE, []);
      subs.unshift(sub);
      writeJsonFile(SUBSCRIPTIONS_FILE, subs);
    }

    return this.updateCustomer(customer.id, {
      subscription_status: "active",
      current_plan_id: plan.id,
      current_plan_name: sub.plan_name,
      current_period_start: sub.start_date,
      current_period_end: sub.end_date,
      paid_credits_total: credits,
      paid_credits_used: 0,
    });
  }

  // =========================================================================
  // 4. REAL LEADS / ENQUIRIES (ZERO DEMO LEADS)
  // =========================================================================
  static async getAllEnquiries(): Promise<(Enquiry & { notes_list?: string[] })[]> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const { data, error } = await supabase
          .from("enquiries")
          .select("*, lead_notes(*)")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map((item: any) => ({
            ...item,
            notes_list: Array.isArray(item.lead_notes)
              ? item.lead_notes.map((n: any) => n.note)
              : [],
          }));
        }
      } catch (err) {
        console.error("Supabase getAllEnquiries error:", err);
      }
    }
    return readJsonFile<(Enquiry & { notes_list?: string[] })[]>(ENQUIRIES_FILE, []);
  }

  static async createEnquiry(data: {
    property_id?: string;
    property_title?: string;
    name: string;
    mobile: string;
    email?: string;
    buyer_type: Enquiry["buyer_type"];
    budget_min?: number;
    budget_max?: number;
    message?: string;
    preferred_contact_time?: string;
    consent: boolean;
    source?: string;
  }): Promise<Enquiry & { notes_list?: string[] }> {
    const now = new Date().toISOString();
    const record: Enquiry & { notes_list?: string[] } = {
      id: crypto.randomUUID(),
      lead_id: generateLeadId(),
      property_id: data.property_id,
      property_title: data.property_title,
      name: data.name,
      mobile: normalizeIndianMobile(data.mobile),
      email: data.email || undefined,
      buyer_type: data.buyer_type,
      budget_min: data.budget_min,
      budget_max: data.budget_max,
      message: data.message,
      preferred_contact_time: data.preferred_contact_time,
      status: "new",
      source: data.source || "website",
      consent: data.consent,
      created_at: now,
      updated_at: now,
      notes_list: [],
    };

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        await supabase.from("enquiries").insert({
          id: record.id,
          lead_id: record.lead_id,
          property_id: record.property_id || null,
          property_title: record.property_title || null,
          name: record.name,
          mobile: record.mobile,
          email: record.email || null,
          buyer_type: record.buyer_type,
          budget_min: record.budget_min || null,
          budget_max: record.budget_max || null,
          message: record.message || null,
          preferred_contact_time: record.preferred_contact_time || null,
          status: "new",
          source: record.source,
          consent: record.consent,
        });
        return record;
      } catch (err) {
        console.error("Supabase createEnquiry error, using server fallback:", err);
      }
    }

    const list = readJsonFile<(Enquiry & { notes_list?: string[] })[]>(ENQUIRIES_FILE, []);
    list.unshift(record);
    writeJsonFile(ENQUIRIES_FILE, list);
    return record;
  }

  static async updateEnquiry(
    id: string,
    updates: { status?: Enquiry["status"]; addNote?: string; createdBy?: string; follow_up_date?: string }
  ): Promise<(Enquiry & { notes_list?: string[]; follow_up_date?: string }) | null> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();

        const patch: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.status) patch.status = updates.status;
        if (updates.follow_up_date !== undefined) patch.follow_up_date = updates.follow_up_date;

        await supabase.from("enquiries").update(patch).eq("id", id);
        if (updates.addNote) {
          await supabase.from("lead_notes").insert({
            enquiry_id: id,
            note: updates.addNote,
            created_by: updates.createdBy || "Aditya Raj",
          });
        }
        const all = await this.getAllEnquiries();
        return all.find((e) => e.id === id) || null;
      } catch (err) {
        console.error("Supabase updateEnquiry error:", err);
      }
    }

    const list = readJsonFile<(Enquiry & { notes_list?: string[]; follow_up_date?: string })[]>(ENQUIRIES_FILE, []);
    const idx = list.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    if (updates.status) {
      list[idx].status = updates.status;
    }
    if (updates.follow_up_date !== undefined) {
      list[idx].follow_up_date = updates.follow_up_date;
    }
    if (updates.addNote) {
      list[idx].notes_list = [...(list[idx].notes_list || []), updates.addNote];
    }
    list[idx].updated_at = new Date().toISOString();
    writeJsonFile(ENQUIRIES_FILE, list);
    return list[idx];
  }
}
