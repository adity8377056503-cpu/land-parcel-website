import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE_NAME,
  signCustomerSession,
  signRegistrationToken,
  verifyStoredOtp,
} from "@/lib/server/customer-auth";
import { PlatformService } from "@/lib/server/platform-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mobile = (body.mobile || "").toString().trim();
    const otp = (body.otp || "").toString().trim();

    const verification = await verifyStoredOtp(mobile, otp);
    if (!verification.valid || !verification.mobile) {
      return NextResponse.json(
        { error: verification.error || "OTP verification failed." },
        { status: 400 }
      );
    }

    // Check if a customer account already exists for this verified mobile
    const existingCustomer = await PlatformService.getCustomerByMobile(verification.mobile);

    if (!existingCustomer) {
      // New customer: issue short-lived registration token so they can enter Full Name, optional Email, and Account Type
      const registrationToken = signRegistrationToken(verification.mobile);
      return NextResponse.json({
        success: true,
        requiresRegistration: true,
        mobile: verification.mobile,
        registrationToken,
        message: "Mobile verified! Complete your customer profile to claim your 5 lifetime free listing credits.",
      });
    }

    // Existing customer: issue strictly customer-scoped HTTP-only session cookie
    // SECURITY: Customer OTP NEVER grants Admin or Super Admin permissions (even for 8377056503).
    const token = signCustomerSession({
      customerId: existingCustomer.id,
      name: existingCustomer.name,
      mobile: existingCustomer.mobile,
      email: existingCustomer.email,
      accountType: existingCustomer.role,
    });

    const eligibility = PlatformService.computeEligibility(existingCustomer);

    const response = NextResponse.json({
      success: true,
      requiresRegistration: false,
      customer: existingCustomer,
      eligibility,
      message: `Welcome back, ${existingCustomer.name}!`,
    });

    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 14 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("POST /api/auth/verify-otp error:", err);
    return NextResponse.json(
      { error: "OTP verification error." },
      { status: 500 }
    );
  }
}
