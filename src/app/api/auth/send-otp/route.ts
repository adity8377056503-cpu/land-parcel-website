import { NextRequest, NextResponse } from "next/server";
import { createAndSendOtp } from "@/lib/server/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mobile = (body.mobile || "").toString().trim();

    const result = await createAndSendOtp(mobile);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Unable to send OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        result.deliveryMode === "sms_gateway"
          ? "Verification OTP sent to your mobile number."
          : "OTP generated securely. Enter the 6-digit verification code to continue.",
      expiresInSeconds: result.expiresInSeconds,
      deliveryMode: result.deliveryMode,
      devOtp: result.devOtp,
    });
  } catch (err: any) {
    console.error("POST /api/auth/send-otp error:", err);
    return NextResponse.json(
      { error: "Failed to initiate OTP verification." },
      { status: 500 }
    );
  }
}
