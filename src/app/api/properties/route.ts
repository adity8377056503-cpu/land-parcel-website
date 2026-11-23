import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PropertyService } from "@/lib/server/property-service";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

const propertySubmissionSchema = z.object({
  // Contact (optional if admin)
  seller_name: z.string().optional(),
  seller_mobile: z.string().optional(),
  seller_email: z.string().optional(),
  seller_type: z.enum(["owner", "agent", "developer"]).optional(),

  // Property
  title: z.string().min(3),
  category: z.string().min(1),
  property_type: z.string().min(1),
  state: z.string().optional(),
  city: z.string().min(1),
  locality: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  total_area: z.union([z.string(), z.number()]),
  area_unit: z.string().min(1),
  built_up_area: z.union([z.string(), z.number()]).optional(),
  carpet_area: z.union([z.string(), z.number()]).optional(),
  covered_area: z.union([z.string(), z.number()]).optional(),
  expected_price: z.union([z.string(), z.number()]).optional(),
  price: z.union([z.string(), z.number()]).optional(),
  price_negotiable: z.boolean().optional(),
  road_width: z.union([z.string(), z.number()]).optional(),
  specifications: z.string().optional(),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
  landmarks: z.string().optional(),
  nearby_landmarks: z.string().optional(),
  road_connectivity: z.string().optional(),
  bedrooms: z.union([z.string(), z.number()]).optional(),
  bathrooms: z.union([z.string(), z.number()]).optional(),
  furnishing: z.string().optional(),
  highlights: z.array(z.string()).optional(),

  // Origin & Status
  source: z.enum(["admin", "owner", "agent", "developer"]).optional(),
  status: z.enum(["draft", "pending", "published", "rejected", "sold", "rented", "unpublished"]).optional(),
  is_featured: z.boolean().optional(),
  video_url: z.string().optional(),
  images: z.array(z.any()).optional(),
  documents: z.array(z.any()).optional(),

  // Consent (for public submissions)
  consent: z.boolean().optional(),
  authorization_confirmed: z.boolean().optional(),
});

/**
 * GET /api/properties
 * Public users: returns only published inventory.
 * Admin: returns full inventory across all lifecycle statuses.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = getAdminSessionFromRequest(request);
    const isAdmin = Boolean(session);

    const category = searchParams.get("category") || undefined;
    const city = searchParams.get("city") || undefined;
    const source = searchParams.get("source") || undefined;
    const status = searchParams.get("status") || undefined;

    let properties = await PropertyService.getAllProperties({
      onlyPublished: !isAdmin,
      category,
      city,
      source,
    });

    if (isAdmin && status) {
      properties = properties.filter((p) => p.status === status);
    }

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (err: any) {
    console.error("GET /api/properties error:", err);
    return NextResponse.json(
      { error: "Failed to fetch properties", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * Creates a new property listing.
 * Admin uploads: Permanent unlimited quota, status draft or published.
 * Public uploads: Enforces 5 lifetime free credits and moves to pending review.
 */
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
    const session = getAdminSessionFromRequest(request);
    const isAdmin = Boolean(session);
    const requestedSource = data.source || (isAdmin ? "admin" : "owner");
    const isPublic = requestedSource !== "admin";

    // 1. Guard admin source against unauthorized spoofing
    if (!isAdmin && requestedSource === "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to publish admin listings." },
        { status: 401 }
      );
    }

    // 2. Public submissions require consent and declaration
    if (isPublic && (!data.consent || !data.authorization_confirmed)) {
      return NextResponse.json(
        { error: "Consent and legal authorization confirmation are required for public listings." },
        { status: 400 }
      );
    }

    // 3. Server-side quota check for public submissions (5 lifetime free listings)
    if (isPublic) {
      if (!data.seller_mobile) {
        return NextResponse.json(
          { error: "A valid mobile number is required to verify listing quota eligibility." },
          { status: 400 }
        );
      }

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

          const normalizedMobile = data.seller_mobile.replace(/\D/g, "").slice(-10);

          const { data: client } = await supabase
            .from("client_accounts")
            .select("free_credits_total, free_credits_used, subscription_status, current_period_end")
            .eq("mobile", normalizedMobile)
            .maybeSingle();

          if (client) {
            const hasActiveSubscription =
              client.subscription_status === "active" &&
              (!client.current_period_end || new Date(client.current_period_end) > new Date());

            if (!hasActiveSubscription && client.free_credits_used >= (client.free_credits_total || 5)) {
              return NextResponse.json(
                {
                  error:
                    "Free listing quota (5 properties) has been exhausted. An active monthly subscription is required to submit additional properties.",
                  code: "SUBSCRIPTION_REQUIRED",
                  free_credits_used: client.free_credits_used,
                  free_credits_total: client.free_credits_total,
                  subscription_status: client.subscription_status,
                },
                { status: 403 }
              );
            }
          }
        } catch (quotaErr) {
          console.warn("Server quota check warning:", quotaErr);
        }
      }
    }

    // Determine price and status
    const finalPrice = data.price !== undefined ? Number(data.price) : Number(data.expected_price || 0);
    const finalStatus = isAdmin ? (data.status || "draft") : "pending";
    const authorEmail = session?.email || data.seller_email || "public_submitter";

    const created = await PropertyService.createProperty(
      {
        title: data.title,
        description: data.description || "",
        category: data.category as any,
        property_type: data.property_type as any,
        price: finalPrice,
        price_negotiable: data.price_negotiable ?? true,
        total_area: Number(data.total_area),
        area_unit: data.area_unit as any,
        built_up_area: data.built_up_area ? Number(data.built_up_area) : undefined,
        carpet_area: data.carpet_area ? Number(data.carpet_area) : undefined,
        covered_area: data.covered_area ? Number(data.covered_area) : undefined,
        road_width: data.road_width ? Number(data.road_width) : undefined,
        state: data.state || "Delhi",
        city: data.city,
        locality: data.locality || data.city,
        address: data.address || `${data.locality || data.city}, Delhi NCR`,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        nearby_landmarks: data.nearby_landmarks || data.landmarks,
        road_connectivity: data.road_connectivity,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        furnishing: data.furnishing as any,
        highlights: data.highlights || [],
        video_url: data.video_url,
        images: data.images || [],
        documents: data.documents || [],
        source: requestedSource,
        status: finalStatus,
        is_featured: data.is_featured ?? false,
        seller_name: data.seller_name,
        seller_mobile: data.seller_mobile,
        seller_email: data.seller_email,
        seller_type: data.seller_type,
      },
      authorEmail
    );

    return NextResponse.json(
      {
        success: true,
        message: isAdmin
          ? (finalStatus === "published" ? "Property published live successfully!" : "Property saved as draft successfully!")
          : "Property submitted for verification. Tracking ID generated.",
        property: created,
        listing_id: created.listing_id,
        slug: created.slug,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/properties error:", err);
    return NextResponse.json(
      { error: "Failed to create property listing", details: err?.message },
      { status: 500 }
    );
  }
}
