import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PlatformService } from "@/lib/server/platform-service";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

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
      return NextResponse.json({ error: "Consent is required" }, { status: 400 });
    }

    const created = await PlatformService.createEnquiry({
      property_id: data.property_id,
      property_title: data.property_title,
      name: data.name,
      mobile: data.mobile,
      email: data.email || undefined,
      buyer_type: data.buyer_type,
      budget_min: data.budget_min ? parseInt(data.budget_min, 10) : undefined,
      budget_max: data.budget_max ? parseInt(data.budget_max, 10) : undefined,
      message: data.message,
      preferred_contact_time: data.preferred_contact_time,
      consent: data.consent,
      source: data.source || "website",
    });

    // Optional n8n webhook dispatch
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
            lead_id: created.lead_id,
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
        lead_id: created.lead_id,
        enquiry: created,
        message: "Enquiry submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enquiry API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const admin = getAdminSessionFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await PlatformService.getAllEnquiries();
  return NextResponse.json({ success: true, leads });
}
