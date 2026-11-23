import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const offlinePaymentSchema = z.object({
  client_id: z.string().min(1),
  client_name: z.string().min(1),
  client_mobile: z.string().min(10),
  plan_id: z.string().min(1),
  plan_name: z.string().min(1),
  amount: z.number().positive(),
  payment_method: z.enum(["offline_upi", "offline_bank_transfer", "offline_cash"]),
  reference_number: z.string().min(4, "Reference / UTR number is required"),
  proof_notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = offlinePaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment submission details", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Save to Supabase if live credentials exist
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

      // Set subscription status to 'pending'
      await supabase
        .from("client_accounts")
        .update({
          subscription_status: "pending",
          current_plan_id: data.plan_id,
          current_plan_name: data.plan_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.client_id);

      // Create transaction record
      await supabase.from("payment_transactions").insert({
        transaction_id: `TXN_${data.reference_number.slice(-8)}_${Date.now().toString().slice(-4)}`,
        client_id: data.client_id,
        plan_id: data.plan_id,
        amount: data.amount,
        status: "pending_verification",
        payment_method: data.payment_method,
        reference_number: data.reference_number,
        proof_notes: data.proof_notes,
        submitted_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      status: "pending",
      message:
        "Payment reference submitted successfully. Your subscription will be activated upon admin verification.",
      reference_number: data.reference_number,
    });
  } catch (err: any) {
    console.error("Offline payment submission error:", err);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
