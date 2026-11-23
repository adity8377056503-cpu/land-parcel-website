import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateLeadId } from "@/lib/utils";

const enquirySchema = z.object({
  property_id: z.string().optional(),
  property_title: z.string().optional(),
  name: z.string().min(2),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  buyer_type: z.enum(["individual", "investor", "company", "developer", "broker"]),
  budget_min: z.string().optional(),
  budget_max: z.string().optional(),
  message: z.string().optional(),
  preferred_contact_time: z.string().optional(),
  consent: z.boolean(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!data.consent) {
      return NextResponse.json(
        { error: "Consent is required" },
        { status: 400 }
      );
    }

    const leadId = generateLeadId();

    // Try to save to Supabase if credentials are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      supabaseUrl &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder") &&
      !serviceRoleKey.includes("placeholder")
    ) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();

        await supabase.from("enquiries").insert({
          lead_id: leadId,
          property_id: data.property_id || null,
          property_title: data.property_title || null,
          name: data.name,
          mobile: data.mobile,
          email: data.email || null,
          buyer_type: data.buyer_type,
          budget_min: data.budget_min ? parseInt(data.budget_min) : null,
          budget_max: data.budget_max ? parseInt(data.budget_max) : null,
          message: data.message || null,
          preferred_contact_time: data.preferred_contact_time || null,
          status: "new",
          source: data.source || "website",
          consent: data.consent,
        });
      } catch (dbError) {
        console.error("DB error (non-critical):", dbError);
        // Continue - don't fail the user experience if DB is not configured
      }
    }

    // Trigger n8n webhook if configured
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && !n8nWebhookUrl.includes("your_n8n")) {
      try {
        await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.N8N_WEBHOOK_SECRET || ""}`,
          },
          body: JSON.stringify({
            type: "enquiry",
            lead_id: leadId,
            ...data,
          }),
        });
      } catch (webhookError) {
        console.error("n8n webhook error:", webhookError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        lead_id: leadId,
        message: "Enquiry submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // This endpoint is protected - only for admin use
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
