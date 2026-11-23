import { NextRequest, NextResponse } from "next/server";
import {
  signAdminSession,
  ADMIN_COOKIE_NAME,
  SUPER_ADMIN,
  safeCompare,
} from "@/lib/server/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawIdentifier = (body.identifier || body.mobile || body.email || "").toString().trim();
    const password = (body.password || "").toString();

    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { error: "Authorized Mobile Number / Email and Password are both required." },
        { status: 400 }
      );
    }

    const normalizedEmail = rawIdentifier.toLowerCase();
    const normalizedMobile = rawIdentifier.replace(/\D/g, "").slice(-10);

    let authenticatedUser: {
      userId?: string;
      name: string;
      mobile: string;
      email: string;
      role: "super_admin" | "admin";
      accountType: string;
    } | null = null;

    // 1. Verify Primary Super Admin (Aditya Raj — 8377056503) strictly with password verification
    // SECURITY: NEVER grant admin access merely from mobile number 8377056503 without verified secret password.
    const matchesSuperAdminIdentifier =
      (normalizedMobile.length === 10 && normalizedMobile === SUPER_ADMIN.mobile) ||
      normalizedEmail === SUPER_ADMIN.email;

    const validPasswords = [
      SUPER_ADMIN.defaultPassword,
      process.env.SUPER_ADMIN_PASSWORD,
      process.env.ADMIN_PASSWORD,
    ].filter((p): p is string => Boolean(p && p.length > 0));

    if (matchesSuperAdminIdentifier && validPasswords.some((expected) => safeCompare(password, expected))) {
      authenticatedUser = {
        userId: SUPER_ADMIN.userId,
        name: SUPER_ADMIN.name,
        mobile: SUPER_ADMIN.mobile,
        email: SUPER_ADMIN.email,
        role: "super_admin",
        accountType: SUPER_ADMIN.accountType,
      };
    }

    // 2. If Supabase is connected, authenticate via Supabase Auth AND verify DB role = super_admin | admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !authenticatedUser &&
      supabaseUrl &&
      anonKey &&
      serviceKey &&
      !supabaseUrl.includes("placeholder") &&
      !serviceKey.includes("placeholder")
    ) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAnon = createClient(supabaseUrl, anonKey);
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabaseAdmin = await createAdminClient();

        // Resolve email if user logged in with mobile number
        let loginEmail = normalizedEmail;
        if (!loginEmail.includes("@") && normalizedMobile.length === 10) {
          const { data: profileByMobile } = await supabaseAdmin
            .from("profiles")
            .select("email")
            .eq("mobile", normalizedMobile)
            .maybeSingle();
          if (profileByMobile?.email) {
            loginEmail = profileByMobile.email;
          }
        }

        if (loginEmail.includes("@")) {
          const { data: authData, error: authErr } = await supabaseAnon.auth.signInWithPassword({
            email: loginEmail,
            password,
          });

          if (authData?.user && !authErr) {
            // Strictly verify role in public.profiles using service_role on the server
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("id, full_name, mobile, email, role")
              .eq("id", authData.user.id)
              .maybeSingle();

            if (profile && (profile.role === "super_admin" || profile.role === "admin")) {
              authenticatedUser = {
                userId: profile.id,
                name: profile.full_name || SUPER_ADMIN.name,
                mobile: profile.mobile || SUPER_ADMIN.mobile,
                email: profile.email || loginEmail,
                role: profile.role,
                accountType:
                  profile.role === "super_admin"
                    ? "Website Owner / Main Administrator"
                    : "Authorized Administrator",
              };
            }
          }
        }
      } catch (authErr) {
        console.error("Supabase admin auth check error:", authErr);
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Invalid administrator credentials. Super Admin verification failed." },
        { status: 401 }
      );
    }

    const token = signAdminSession(authenticatedUser);

    const response = NextResponse.json({
      success: true,
      message: `Authenticated as ${authenticatedUser.name} (${authenticatedUser.role})`,
      user: authenticatedUser,
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("Admin login API error:", err);
    return NextResponse.json(
      { error: "Server authentication error" },
      { status: 500 }
    );
  }
}
