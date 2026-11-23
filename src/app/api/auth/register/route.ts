import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  CUSTOMER_COOKIE_NAME,
  signCustomerSession,
  verifyRegistrationToken,
} from "@/lib/server/customer-auth";
import { PlatformService } from "@/lib/server/platform-service";

const registerSchema = z.object({
  registrationToken: z.string().min(10, "Mobile OTP verification is required before registration."),
  name: z.string().min(2, "Full Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")),
  accountType: z.enum(["owner", "dealer", "agent", "builder", "developer"]),
  companyName: z.string().max(120).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration details.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { registrationToken, name, email, accountType, companyName } = parsed.data;
    const verifiedReg = verifyRegistrationToken(registrationToken);

    if (!verifiedReg) {
      return NextResponse.json(
        { error: "OTP verification expired or invalid. Please verify your mobile number again." },
        { status: 401 }
      );
    }

    // Create normal customer account (strictly system_role: 'customer', 5 lifetime free credits)
    const customer = await PlatformService.createCustomer({
      name,
      mobile: verifiedReg.mobile,
      email: email || undefined,
      accountType,
      companyName: companyName || undefined,
      isMobileVerified: true,
    });

    const token = signCustomerSession({
      customerId: customer.id,
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      accountType: customer.role,
    });

    const eligibility = PlatformService.computeEligibility(customer);

    const response = NextResponse.json(
      {
        success: true,
        customer,
        eligibility,
        message: "Account created! 5 lifetime free listing credits have been added to your account.",
      },
      { status: 201 }
    );

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
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
