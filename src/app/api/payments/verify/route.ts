import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  client_id: z.string().min(1),
  plan_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment verification payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, client_id, plan_id } = parsed.data;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // Strict security rule: Never simulate successful payments.
    // Must have genuine key secret and valid cryptographic signature.
    if (!razorpaySecret || razorpaySecret.includes("placeholder")) {
      return NextResponse.json(
        {
          error:
            "Payment gateway secret is not configured on this server. Subscription activation requires a verified gateway signature or manual admin approval.",
        },
        { status: 403 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature. Verification failed." },
        { status: 400 }
      );
    }

    // Signature verified! If Supabase is active, activate client subscription in DB
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      supabaseUrl &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder") &&
      !serviceRoleKey.includes("placeholder")
    ) {
      const { createAdminClient } = await import("@/lib/supabase/server");
      const supabase = await createAdminClient();

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      await supabase
        .from("client_accounts")
        .update({
          subscription_status: "active",
          current_plan_id: plan_id,
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", client_id);

      await supabase.from("payment_transactions").insert({
        transaction_id: razorpay_payment_id,
        client_id,
        plan_id,
        amount: 0, // Recorded in order
        status: "verified",
        payment_method: "gateway_razorpay",
        reference_number: razorpay_payment_id,
        verified_at: new Date().toISOString(),
        verified_by: "gateway_webhook",
      });
    }

    return NextResponse.json({
      success: true,
      status: "active",
      message: "Payment successfully verified and subscription activated.",
      payment_id: razorpay_payment_id,
    });
  } catch (err: any) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Verification processing failed" }, { status: 500 });
  }
}
