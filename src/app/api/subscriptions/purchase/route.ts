import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerSessionFromRequest } from "@/lib/server/customer-auth";
import { PlatformService } from "@/lib/server/platform-service";

const purchaseSchema = z.object({
  planId: z.string().min(1, "Please select a subscription plan."),
  paymentMethod: z.enum(["offline_upi", "offline_bank_transfer", "offline_cash"]),
  referenceNumber: z.string().min(4, "Please provide a valid Transaction Reference / UTR Number."),
  proofNotes: z.string().max(400).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = getCustomerSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: "Please log in with your verified mobile number before purchasing a plan." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment submission details.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await PlatformService.submitSubscriptionPurchase({
      customerId: session.customerId,
      planId: parsed.data.planId,
      paymentMethod: parsed.data.paymentMethod,
      referenceNumber: parsed.data.referenceNumber,
      proofNotes: parsed.data.proofNotes,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Unable to record purchase. Verify your account and selected plan." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: "pending_verification",
        message:
          "Payment submitted for verification. Listing credits and subscription access will activate once verified by Super Admin Aditya Raj.",
        transaction: result.transaction,
        customer: result.customer,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/subscriptions/purchase error:", err);
    return NextResponse.json({ error: "Failed to submit subscription purchase." }, { status: 500 });
  }
}
