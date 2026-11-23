import { NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "lp_admin_token";
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Primary Super Admin Configuration — Aditya Raj
 * SECURITY: Super Admin access is NEVER granted merely by entering mobile 8377056503.
 * Authentication requires server-side password verification (or Supabase Auth + DB super_admin role check).
 */
export const SUPER_ADMIN = {
  userId: "super-admin-aditya-raj",
  name: process.env.SUPER_ADMIN_NAME || "Aditya Raj",
  mobile: (process.env.SUPER_ADMIN_MOBILE || "8377056503").replace(/\D/g, "").slice(-10),
  email: (process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "acreindiaclub@gmail.com").toLowerCase(),
  role: "super_admin" as const,
  accountType: "Website Owner / Main Administrator",
  defaultPassword:
    process.env.SUPER_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    "AdityaRaj@LandParcel2026",
};

// Backwards-compatible alias
export const OFFICIAL_ADMIN = SUPER_ADMIN;

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "lp_secure_production_super_admin_secret_aditya_raj_2026"
  );
}

export interface AdminSession {
  userId: string;
  name: string;
  mobile: string;
  email: string;
  role: "super_admin" | "admin";
  accountType: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Constant-time string comparison to prevent timing attacks on password or signature checks.
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Creates a cryptographically signed HMAC-SHA256 token for a verified administrator.
 */
export function signAdminSession(params?: {
  userId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  role?: "super_admin" | "admin";
  accountType?: string;
}): string {
  const email = (params?.email || SUPER_ADMIN.email).toLowerCase();
  const mobile = (params?.mobile || SUPER_ADMIN.mobile).replace(/\D/g, "").slice(-10);
  const role = params?.role || "super_admin";

  const session: AdminSession = {
    userId:
      params?.userId ||
      (role === "super_admin"
        ? SUPER_ADMIN.userId
        : "admin-" + crypto.createHash("sha256").update(mobile || email).digest("hex").slice(0, 12)),
    name: params?.name || SUPER_ADMIN.name,
    mobile,
    email,
    role,
    accountType: params?.accountType || (role === "super_admin" ? SUPER_ADMIN.accountType : "Authorized Administrator"),
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRY_MS,
  };

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Cryptographically verifies an administrator session token on the server.
 */
export function verifyAdminToken(token: string | null | undefined): AdminSession | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", getSecretKey())
      .update(payload)
      .digest("base64url");

    if (!safeCompare(signature, expectedSignature)) {
      return null;
    }

    const session: AdminSession = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));

    if (
      !session ||
      (session.role !== "super_admin" && session.role !== "admin") ||
      session.expiresAt < Date.now()
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the admin session from an incoming Next.js request.
 */
export function getAdminSessionFromRequest(request: NextRequest): AdminSession | null {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookie) {
    const verified = verifyAdminToken(cookie);
    if (verified) return verified;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7);
    const verified = verifyAdminToken(bearerToken);
    if (verified) return verified;
  }

  return null;
}

/**
 * Guard utility for API routes requiring verified admin or super_admin authorization.
 */
export function requireAdminAuth(request: NextRequest): AdminSession {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    throw new Error("UNAUTHORIZED_ADMIN_ACCESS");
  }
  return session;
}

/**
 * Guard utility for privileged operations strictly restricted to Super Admin (Aditya Raj).
 */
export function requireSuperAdminAuth(request: NextRequest): AdminSession {
  const session = getAdminSessionFromRequest(request);
  if (!session || session.role !== "super_admin") {
    throw new Error("UNAUTHORIZED_SUPER_ADMIN_ACCESS");
  }
  return session;
}

export { ADMIN_COOKIE_NAME };
