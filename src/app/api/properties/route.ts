import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PropertyService } from "@/lib/server/property-service";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { getCustomerSessionFromRequest, normalizeIndianMobile } from "@/lib/server/customer-auth";
import { PlatformService } from "@/lib/server/platform-service";

const propertySubmissionSchema = z.object({
  // Contact (optional if admin)
  seller_name: z.string().optional(),
  seller_mobile: z.string().optional(),
  seller_email: z.string().optional(),
  seller_type: z.enum(["owner", "dealer", "agent", "builder", "developer"]).optional(),

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
  source: z.enum(["admin", "owner", "dealer", "agent", "builder", "developer"]).optional(),
  status: z.enum(["draft", "pending", "published", "rejected", "sold", "rented", "unpublished"]).optional(),
  is_featured: z.boolean().optional(),
  video_url: z.string().optional(),
  images: z.array(z.any()).optional(),
  documents: z.array(z.any()).optional(),

  // Consent (for customer submissions)
  consent: z.boolean().optional(),
  authorization_confirmed: z.boolean().optional(),
});

/**
 * GET /api/properties
 * Public users: returns only published inventory (private documents stripped).
 * Verified Admin / Super Admin: returns full inventory across all lifecycle statuses.
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

    if (!isAdmin) {
      properties = properties.map((p) => ({ ...p, documents: [] }));
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
 * - Super Admin / Admin: Permanent unlimited free uploads; can publish immediately or save draft.
 * - Customers: Server-enforced 5 lifetime free credits + active verified subscription credits; always enters Pending Review.
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
    const adminSession = getAdminSessionFromRequest(request);
    const customerSession = getCustomerSessionFromRequest(request);
    const isAdmin = Boolean(adminSession);
    const requestedSource = data.source || (isAdmin ? "admin" : data.seller_type || "owner");
    const isPublic = requestedSource !== "admin";

    // 1. Guard admin source against spoofing
    if (!isAdmin && requestedSource === "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Verified Super Admin session required for admin listings." },
        { status: 401 }
      );
    }

    // 2. Customer submissions require consent and ownership/authorization declaration
    if (isPublic && (!data.consent || !data.authorization_confirmed)) {
      return NextResponse.json(
        { error: "Consent and legal authorization confirmation are required for customer listings." },
        { status: 400 }
      );
    }

    let linkedCustomerId: string | undefined;
    let sellerName = data.seller_name;
    let sellerMobile = data.seller_mobile;
    let sellerEmail = data.seller_email;
    let sellerType = data.seller_type;

    // 3. Server-side quota & subscription enforcement for customers (Admin is permanently exempt)
    if (isPublic) {
      let customer = customerSession
        ? await PlatformService.getCustomerById(customerSession.customerId)
        : null;

      if (!customer && data.seller_mobile) {
        customer = await PlatformService.getCustomerByMobile(data.seller_mobile);
      }

      if (!customer) {
        const cleanMobile = normalizeIndianMobile(data.seller_mobile || "");
        if (cleanMobile.length !== 10) {
          return NextResponse.json(
            { error: "Please log in with your verified mobile number to submit a property." },
            { status: 400 }
          );
        }
        // Register customer record if submitted with valid mobile
        customer = await PlatformService.createCustomer({
          name: data.seller_name || "Property Seller",
          mobile: cleanMobile,
          email: data.seller_email,
          accountType: data.seller_type || "owner",
          isMobileVerified: Boolean(customerSession),
        });
      }

      linkedCustomerId = customer.id;
      sellerName = sellerName || customer.name;
      sellerMobile = customer.mobile;
      sellerEmail = sellerEmail || customer.email;
      sellerType = sellerType || customer.role;

      const eligibility = PlatformService.computeEligibility(customer);
      if (!eligibility.eligible) {
        return NextResponse.json(
          {
            error: eligibility.reason,
            code: "SUBSCRIPTION_REQUIRED",
            eligibility,
          },
          { status: 403 }
        );
      }
    }

    const finalPrice = data.price !== undefined ? Number(data.price) : Number(data.expected_price || 0);
    const finalStatus = isAdmin ? (data.status || "draft") : "pending";
    const authorLabel = adminSession
      ? `${adminSession.name} (${adminSession.role})`
      : sellerName || sellerMobile || "customer";

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
        documents: isAdmin ? data.documents || [] : [],
        source: requestedSource,
        status: finalStatus,
        is_featured: isAdmin ? (data.is_featured ?? false) : false,
        customer_id: linkedCustomerId,
        seller_name: sellerName,
        seller_mobile: sellerMobile,
        seller_email: sellerEmail,
        seller_type: sellerType,
      },
      authorLabel
    );

    return NextResponse.json(
      {
        success: true,
        message: isAdmin
          ? finalStatus === "published"
            ? "Property published live successfully!"
            : "Property saved as draft successfully!"
          : "Property submitted for admin review. Credit will be deducted only upon approval.",
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
