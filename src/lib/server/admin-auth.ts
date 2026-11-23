import { NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "lp_admin_token";
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Official Land Parcel Administrator credentials
export const OFFICIAL_ADMIN = {
  email: (process.env.ADMIN_EMAIL || "acreindiaclub@gmail.com").toLowerCase(),
  name: "Suraj Prakash",
  phone: "8750442235",
  defaultPassword: "Admin@LandParcel2026",
};

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "lp_secure_production_admin_secret_key_suraj_prakash_2026_land_parcel"
  );
}

export interface AdminSession {
  userId: string;
  email: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates a cryptographically signed HMAC token for the administrator.
 */
export function signAdminSession(email: string = OFFICIAL_ADMIN.email): string {
  const session: AdminSession = {
    userId: "admin-" + crypto.createHash("sha256").update(email).digest("hex").slice(0, 12),
    email: email.toLowerCase(),
    role: "admin",
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
 * Cryptographically verifies an administrator session token.
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

    if (signature !== expectedSignature) {
      return null;
    }

    const session: AdminSession = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));

    if (!session || session.role !== "admin" || session.expiresAt < Date.now()) {
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
  // 1. Check HTTP-only cookie
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookie) {
    const verified = verifyAdminToken(cookie);
    if (verified) return verified;
  }

  // 2. Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7);
    const verified = verifyAdminToken(bearerToken);
    if (verified) return verified;
  }

  return null;
}

/**
 * Guard utility for API routes that strictly require verified admin authorization.
 */
export function requireAdminAuth(request: NextRequest): AdminSession {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    throw new Error("UNAUTHORIZED_ADMIN_ACCESS");
  }
  return session;
}

export { ADMIN_COOKIE_NAME };
