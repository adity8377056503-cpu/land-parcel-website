import { NextRequest, NextResponse } from "next/server";
import { signAdminSession, ADMIN_COOKIE_NAME, OFFICIAL_ADMIN } from "@/lib/server/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const validEmails = [
      OFFICIAL_ADMIN.email,
      "acreindiaclub@gmail.com",
      "admin@landparcel.in",
    ];

    let isAuthenticated = false;

    // 1. Check official administrative master credentials
    if (
      validEmails.includes(normalizedEmail) &&
      (password === OFFICIAL_ADMIN.defaultPassword || password === process.env.ADMIN_PASSWORD)
    ) {
      isAuthenticated = true;
    }

    // 2. If Supabase is connected, check Supabase Auth for admin account
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (
      !isAuthenticated &&
      supabaseUrl &&
      anonKey &&
      !supabaseUrl.includes("placeholder")
    ) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, anonKey);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (data?.user && !error) {
          isAuthenticated = true;
        }
      } catch (authErr) {
        console.error("Supabase auth check error:", authErr);
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Invalid admin credentials. Access denied." },
        { status: 401 }
      );
    }

    // Sign permanent administrative session token
    const token = signAdminSession(normalizedEmail);

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: {
        email: normalizedEmail,
        name: OFFICIAL_ADMIN.name,
        role: "admin",
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
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
