import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateListingId, generateSlug } from "@/lib/utils";

const propertySubmissionSchema = z.object({
  // Contact (optional if admin)
  seller_name: z.string().optional(),
  seller_mobile: z.string().optional(),
  seller_email: z.string().optional(),
  seller_type: z.enum(["owner", "agent", "developer"]).optional(),

  // Property
  title: z.string().min(5),
  category: z.string().min(1),
  property_type: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  locality: z.string().min(1),
  address: z.string().min(5),
  description: z.string().optional(),
  total_area: z.union([z.string(), z.number()]),
  area_unit: z.string().min(1),
  built_up_area: z.union([z.string(), z.number()]).optional(),
  expected_price: z.union([z.string(), z.number()]),
  road_width: z.union([z.string(), z.number()]).optional(),
  specifications: z.string().optional(),

  // Origin & Status
  source: z.enum(["admin", "owner", "agent", "developer"]).optional(),
  status: z.enum(["draft", "pending", "published", "rejected", "sold", "rented", "unpublished"]).optional(),
  is_featured: z.boolean().optional(),
  video_url: z.string().optional(),

  // Consent (for public submissions)
  consent: z.boolean().optional(),
  authorization_confirmed: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = propertySubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const isPublic = data.source !== "admin";

    // Public submissions require consent and authorization
    if (isPublic && (!data.consent || !data.authorization_confirmed)) {
      return NextResponse.json(
        { error: "Consent and legal authorization confirmation are required for public listings" },
        { status: 400 }
      );
    }

    // Public submissions are ALWAYS pending review
    const finalStatus = isPublic ? "pending" : (data.status || "published");
    const listingId = (body.listing_id as string) || generateListingId();
    const slug = generateSlug(data.title, data.city);

    // Save to Supabase if credentials are live
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

        let sellerId = null;
        if (data.seller_name && data.seller_mobile) {
          const { data: seller } = await supabase
            .from("sellers")
            .insert({
              name: data.seller_name,
              mobile: data.seller_mobile,
              email: data.seller_email || null,
              seller_type: data.seller_type || "owner",
            })
            .select()
            .single();
          sellerId = seller?.id || null;
        }

        await supabase.from("properties").insert({
          listing_id: listingId,
          slug,
          title: data.title,
          category: data.category,
          property_type: data.property_type,
          state: data.state,
          city: data.city,
          locality: data.locality,
          address: data.address,
          description: data.description || "",
          total_area: typeof data.total_area === "string" ? parseFloat(data.total_area) : data.total_area,
          area_unit: data.area_unit,
          built_up_area: data.built_up_area ? (typeof data.built_up_area === "string" ? parseFloat(data.built_up_area) : data.built_up_area) : null,
          price: typeof data.expected_price === "string" ? parseInt(data.expected_price) : data.expected_price,
          road_width: data.road_width ? (typeof data.road_width === "string" ? parseFloat(data.road_width) : data.road_width) : null,
          status: finalStatus,
          availability_status: "available",
          is_featured: data.is_featured || false,
          is_demo: false,
          view_count: 0,
          seller_id: sellerId,
        });
      } catch (dbError) {
        console.error("Supabase replication error (non-fatal):", dbError);
      }
    }

    // Trigger n8n webhook for automated workflows
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && !n8nWebhookUrl.includes("your_n8n")) {
      try {
        await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: isPublic ? "public_seller_submission" : "admin_property_upload",
            listing_id: listingId,
            status: finalStatus,
            ...data,
          }),
        });
      } catch (err) {
        console.error("n8n webhook error:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        listing_id: listingId,
        status: finalStatus,
        message: isPublic ? "Property submitted for review" : "Property saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Property submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
