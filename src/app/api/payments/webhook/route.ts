import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret.includes("placeholder")) {
      return NextResponse.json(
        { error: "Webhook secret not configured on server" },
        { status: 501 }
      );
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured or subscription.charged
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const clientId = notes.client_id;
      const planId = notes.plan_id;

      if (clientId) {
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
              current_plan_id: planId,
              current_period_start: startDate.toISOString(),
              current_period_end: endDate.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", clientId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
