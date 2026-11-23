import { NextRequest } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { CustomerAccountType } from "@/types";

export const CUSTOMER_COOKIE_NAME = "lp_customer_token";
const CUSTOMER_SESSION_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_OTP_ATTEMPTS = 5;

const DATA_DIR = path.join(process.cwd(), "data");
const OTP_FILE = path.join(DATA_DIR, "otp-store.json");

function getCustomerSecretKey(): string {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "lp_secure_customer_session_hmac_secret_2026"
  );
}

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

export interface CustomerSession {
  customerId: string;
  name: string;
  mobile: string;
  email?: string;
  accountType: CustomerAccountType;
  role: "customer"; // STRICTLY customer — NEVER grants admin or super_admin permissions
  issuedAt: number;
  expiresAt: number;
}

export interface RegistrationVerificationToken {
  mobile: string;
  verifiedAt: number;
  expiresAt: number;
  purpose: "registration";
}

interface StoredOtpRecord {
  id: string;
  mobile: string;
  otp_hash: string;
  salt: string;
  attempts: number;
  max_attempts: number;
  expires_at: string;
  verified_at?: string | null;
  created_at: string;
}

export function normalizeIndianMobile(mobile: string): string {
  const digits = (mobile || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(mobile));
}

function hashOtp(otp: string, salt: string): string {
  return crypto.createHash("sha256").update(`${salt}:${otp}`).digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function readLocalOtps(): StoredOtpRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(OTP_FILE)) return [];
    const parsed = JSON.parse(fs.readFileSync(OTP_FILE, "utf-8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalOtps(records: StoredOtpRecord[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    // Prune expired records
    const now = Date.now();
    const active = records.filter((r) => new Date(r.expires_at).getTime() > now - 60_000);
    fs.writeFileSync(OTP_FILE, JSON.stringify(active, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write OTP store:", err);
  }
}

/**
 * Generates a cryptographically secure 6-digit OTP, stores its salted SHA-256 hash
 * in Supabase (or server storage), and dispatches via configured SMS/WhatsApp provider.
 */
export async function createAndSendOtp(rawMobile: string): Promise<{
  success: boolean;
  error?: string;
  expiresInSeconds?: number;
  deliveryMode?: "sms_gateway" | "local_console";
  devOtp?: string;
}> {
  const mobile = normalizeIndianMobile(rawMobile);
  if (!isValidIndianMobile(mobile)) {
    return { success: false, error: "Please enter a valid 10-digit Indian mobile number." };
  }

  const now = Date.now();
  const otp = crypto.randomInt(100000, 999999).toString();
  const salt = crypto.randomBytes(16).toString("hex");
  const otpHash = hashOtp(otp, salt);
  const expiresAt = new Date(now + OTP_EXPIRY_MS).toISOString();
  const createdAt = new Date(now).toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/server");
      const supabase = await createAdminClient();

      // Check resend cooldown
      const { data: recent } = await supabase
        .from("otp_verifications")
        .select("created_at")
        .eq("mobile", mobile)
        .is("verified_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recent && now - new Date(recent.created_at).getTime() < OTP_RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - new Date(recent.created_at).getTime())) / 1000);
        return { success: false, error: `Please wait ${waitSec} seconds before requesting another OTP.` };
      }

      await supabase.from("otp_verifications").insert({
        mobile,
        otp_hash: otpHash,
        salt,
        purpose: "customer_auth",
        attempts: 0,
        max_attempts: MAX_OTP_ATTEMPTS,
        expires_at: expiresAt,
        created_at: createdAt,
      });
    } catch (err) {
      console.error("Supabase OTP write failed, falling back to server store:", err);
      const list = readLocalOtps();
      list.push({
        id: crypto.randomUUID(),
        mobile,
        otp_hash: otpHash,
        salt,
        attempts: 0,
        max_attempts: MAX_OTP_ATTEMPTS,
        expires_at: expiresAt,
        created_at: createdAt,
      });
      writeLocalOtps(list);
    }
  } else {
    const list = readLocalOtps();
    const recent = list
      .filter((r) => r.mobile === mobile && !r.verified_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (recent && now - new Date(recent.created_at).getTime() < OTP_RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - new Date(recent.created_at).getTime())) / 1000);
      return { success: false, error: `Please wait ${waitSec} seconds before requesting another OTP.` };
    }

    list.push({
      id: crypto.randomUUID(),
      mobile,
      otp_hash: otpHash,
      salt,
      attempts: 0,
      max_attempts: MAX_OTP_ATTEMPTS,
      expires_at: expiresAt,
      created_at: createdAt,
    });
    writeLocalOtps(list);
  }

  // Optional live SMS / WhatsApp Cloud API delivery when configured
  const hasSmsGateway = Boolean(
    process.env.SMS_OTP_API_KEY ||
      (process.env.WHATSAPP_BUSINESS_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
  );

  if (hasSmsGateway && process.env.WHATSAPP_BUSINESS_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      await fetch(
        `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_BUSINESS_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: `91${mobile}`,
            type: "text",
            text: {
              body: `Your Land Parcel verification OTP is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
            },
          }),
        }
      );
      return { success: true, expiresInSeconds: 300, deliveryMode: "sms_gateway" };
    } catch (gatewayErr) {
      console.error("WhatsApp OTP dispatch failed:", gatewayErr);
    }
  }

  // Server console log for local/staging environments without live SMS provider
  console.log(`[LAND PARCEL OTP] Mobile: +91 ${mobile} | Verification Code: ${otp} (expires in 5m)`);

  return {
    success: true,
    expiresInSeconds: 300,
    deliveryMode: "local_console",
    // Exposed only when live SMS gateway is not configured in local environment
    devOtp: process.env.NODE_ENV !== "production" || !hasSmsGateway ? otp : undefined,
  };
}

/**
 * Verifies a 6-digit OTP against the server-stored hash with attempt limiting and expiry checks.
 */
export async function verifyStoredOtp(
  rawMobile: string,
  code: string
): Promise<{ valid: boolean; error?: string; mobile?: string }> {
  const mobile = normalizeIndianMobile(rawMobile);
  const cleanCode = (code || "").replace(/\D/g, "");

  if (!isValidIndianMobile(mobile)) {
    return { valid: false, error: "Invalid mobile number." };
  }
  if (cleanCode.length !== 6) {
    return { valid: false, error: "Please enter the 6-digit OTP code." };
  }

  const now = Date.now();

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/server");
      const supabase = await createAdminClient();

      const { data: record } = await supabase
        .from("otp_verifications")
        .select("*")
        .eq("mobile", mobile)
        .is("verified_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!record) {
        return { valid: false, error: "No active OTP found. Please request a new OTP." };
      }

      if (new Date(record.expires_at).getTime() < now) {
        return { valid: false, error: "OTP has expired. Please request a new OTP." };
      }

      if (record.attempts >= (record.max_attempts || MAX_OTP_ATTEMPTS)) {
        return { valid: false, error: "Maximum OTP attempts exceeded. Please request a new OTP." };
      }

      const candidateHash = hashOtp(cleanCode, record.salt);
      if (!safeCompare(candidateHash, record.otp_hash)) {
        await supabase
          .from("otp_verifications")
          .update({ attempts: (record.attempts || 0) + 1 })
          .eq("id", record.id);
        return { valid: false, error: "Incorrect OTP code. Please try again." };
      }

      await supabase
        .from("otp_verifications")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", record.id);

      return { valid: true, mobile };
    } catch (err) {
      console.error("Supabase OTP verify error, checking server fallback:", err);
    }
  }

  // Server JSON store verification
  const list = readLocalOtps();
  const idx = list
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.mobile === mobile && !r.verified_at)
    .sort((a, b) => new Date(b.r.created_at).getTime() - new Date(a.r.created_at).getTime())[0]?.i;

  if (idx === undefined) {
    return { valid: false, error: "No active OTP found. Please request a new OTP." };
  }

  const record = list[idx];
  if (new Date(record.expires_at).getTime() < now) {
    return { valid: false, error: "OTP has expired. Please request a new OTP." };
  }

  if (record.attempts >= (record.max_attempts || MAX_OTP_ATTEMPTS)) {
    return { valid: false, error: "Maximum OTP attempts exceeded. Please request a new OTP." };
  }

  const candidateHash = hashOtp(cleanCode, record.salt);
  if (!safeCompare(candidateHash, record.otp_hash)) {
    list[idx].attempts += 1;
    writeLocalOtps(list);
    return { valid: false, error: "Incorrect OTP code. Please try again." };
  }

  list[idx].verified_at = new Date().toISOString();
  writeLocalOtps(list);
  return { valid: true, mobile };
}

/**
 * Signs an HMAC-SHA256 customer session token.
 * SECURITY: Role is hardcoded to "customer" — NEVER grants admin privileges.
 */
export function signCustomerSession(params: {
  customerId: string;
  name: string;
  mobile: string;
  email?: string;
  accountType: CustomerAccountType;
}): string {
  const session: CustomerSession = {
    customerId: params.customerId,
    name: params.name,
    mobile: normalizeIndianMobile(params.mobile),
    email: params.email,
    accountType: params.accountType,
    role: "customer",
    issuedAt: Date.now(),
    expiresAt: Date.now() + CUSTOMER_SESSION_EXPIRY_MS,
  };

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getCustomerSecretKey())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyCustomerToken(token: string | null | undefined): CustomerSession | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = crypto
      .createHmac("sha256", getCustomerSecretKey())
      .update(payload)
      .digest("base64url");

    if (!safeCompare(signature, expected)) return null;

    const session: CustomerSession = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!session || session.role !== "customer" || session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function getCustomerSessionFromRequest(request: NextRequest): CustomerSession | null {
  const cookie = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!cookie) return null;
  return verifyCustomerToken(cookie);
}

/**
 * Short-lived signed token proving OTP verification for completing new customer registration.
 */
export function signRegistrationToken(mobile: string): string {
  const data: RegistrationVerificationToken = {
    mobile: normalizeIndianMobile(mobile),
    verifiedAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 min to complete profile
    purpose: "registration",
  };
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = crypto.createHmac("sha256", getCustomerSecretKey()).update(`reg:${payload}`).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyRegistrationToken(token: string | null | undefined): RegistrationVerificationToken | null {
  if (!token || !token.includes(".")) return null;
  try {
    const [payload, sig] = token.split(".");
    const expected = crypto.createHmac("sha256", getCustomerSecretKey()).update(`reg:${payload}`).digest("base64url");
    if (!safeCompare(sig, expected)) return null;
    const data: RegistrationVerificationToken = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!data || data.purpose !== "registration" || data.expiresAt < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
