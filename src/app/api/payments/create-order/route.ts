import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OFFICIAL_BUSINESS } from "@/lib/utils";

const createOrderSchema = z.object({
  client_id: z.string().min(1),
  client_name: z.string().min(1),
  client_mobile: z.string().min(10),
  plan_id: z.string().min(1),
  plan_name: z.string().min(1),
  amount: z.number().positive(),
  payment_method: z.enum(["offline_upi", "offline_bank_transfer", "offline_cash", "gateway_razorpay"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment order request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { client_id, client_mobile, plan_id, plan_name, amount, payment_method } = parsed.data;

    // Check if live Razorpay credentials are provided
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (payment_method === "gateway_razorpay") {
      if (
        razorpayKeyId &&
        razorpaySecret &&
        !razorpayKeyId.includes("placeholder") &&
        !razorpaySecret.includes("placeholder")
      ) {
        // Live Razorpay order initiation
        const authHeader = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString("base64");
        const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            amount: amount * 100, // paise
            currency: "INR",
            receipt: `rcpt_${plan_id.slice(-6)}_${Date.now().toString().slice(-6)}`,
            notes: {
              client_id,
              client_mobile,
              plan_name,
            },
          }),
        });

        if (!orderRes.ok) {
          const errData = await orderRes.text();
          return NextResponse.json({ error: "Failed to create Razorpay order", details: errData }, { status: 502 });
        }

        const razorpayOrder = await orderRes.json();
        return NextResponse.json({
          gateway: "razorpay",
          order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key_id: razorpayKeyId,
        });
      } else {
        return NextResponse.json({
          gateway: "offline_ready",
          message:
            "Online payment gateway credentials are not yet configured in production. Please use Instant UPI or Bank Transfer for immediate submission and admin verification.",
          upi_id: process.env.UPI_ID || "8750442235@paytm",
          bank_name: process.env.BANK_NAME || "HDFC Bank Ltd.",
          account_number: process.env.BANK_ACCOUNT_NO || "50200088991122",
          ifsc: process.env.BANK_IFSC || "HDFC0000123",
          account_name: "SURAJ PRAKASH (LAND PARCEL)",
          owner_name: OFFICIAL_BUSINESS.owner_name,
          email: OFFICIAL_BUSINESS.email,
          whatsapp: OFFICIAL_BUSINESS.whatsapp,
        });
      }
    }

    // Default: Offline Payment details
    return NextResponse.json({
      gateway: "offline",
      upi_id: process.env.UPI_ID || "8750442235@paytm",
      bank_name: process.env.BANK_NAME || "HDFC Bank Ltd.",
      account_number: process.env.BANK_ACCOUNT_NO || "50200088991122",
      ifsc: process.env.BANK_IFSC || "HDFC0000123",
      account_name: "SURAJ PRAKASH (LAND PARCEL)",
      owner_name: OFFICIAL_BUSINESS.owner_name,
      email: OFFICIAL_BUSINESS.email,
      whatsapp: OFFICIAL_BUSINESS.whatsapp,
      amount,
      plan_name,
    });
  } catch (err: any) {
    console.error("Payment create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
