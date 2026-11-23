import { NextRequest, NextResponse } from "next/server";
import { getCustomerSessionFromRequest, normalizeIndianMobile } from "@/lib/server/customer-auth";
import { PropertyService } from "@/lib/server/property-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/customer/properties/[id]
 * Allows an authenticated customer to edit ONLY their own eligible property listing
 * (statuses: draft, pending, rejected). Customers can NEVER self-publish or edit another user's listing.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getCustomerSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to edit your listing." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await PropertyService.getPropertyByIdOrSlug(id, true);
    if (!existing) {
      return NextResponse.json({ error: "Property listing not found." }, { status: 404 });
    }

    const customerMobile = normalizeIndianMobile(session.mobile);
    const propertyMobile = existing.seller_mobile ? normalizeIndianMobile(existing.seller_mobile) : "";
    const isOwner =
      existing.source !== "admin" &&
      (existing.customer_id === session.customerId ||
        (propertyMobile.length === 10 && propertyMobile === customerMobile));

    if (!isOwner) {
      return NextResponse.json(
        { error: "Forbidden. You can only edit your own property listings." },
        { status: 403 }
      );
    }

    if (!["draft", "pending", "rejected"].includes(existing.status)) {
      return NextResponse.json(
        {
          error:
            "Only Draft, Pending Review, or Rejected listings can be edited directly by customers. Contact Land Parcel Admin to update a published listing.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Whitelist safe editable fields only — NEVER allow changing status to published, source to admin, or is_featured
    const safeUpdates: Record<string, any> = {};
    if (typeof body.title === "string" && body.title.trim().length >= 3) safeUpdates.title = body.title.trim();
    if (typeof body.description === "string") safeUpdates.description = body.description.trim();
    if (typeof body.address === "string") safeUpdates.address = body.address.trim();
    if (typeof body.locality === "string") safeUpdates.locality = body.locality.trim();
    if (typeof body.city === "string" && body.city.trim()) safeUpdates.city = body.city.trim();
    if (body.price !== undefined && !isNaN(Number(body.price))) safeUpdates.price = Number(body.price);
    if (body.total_area !== undefined && !isNaN(Number(body.total_area))) safeUpdates.total_area = Number(body.total_area);
    if (typeof body.video_url === "string") safeUpdates.video_url = body.video_url.trim();
    if (existing.status === "rejected") {
      // Resubmit rejected listing for fresh admin review
      safeUpdates.status = "pending";
    }

    const updated = await PropertyService.updateProperty(
      existing.id,
      safeUpdates,
      `${session.name} (+91 ${session.mobile})`,
      existing.status === "rejected"
        ? "Customer updated & resubmitted listing for review"
        : "Customer updated property details"
    );

    if (!updated) {
      return NextResponse.json({ error: "Failed to save property updates." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Property listing updated successfully.",
      property: { ...updated, documents: [] },
    });
  } catch (err: any) {
    console.error("PATCH /api/customer/properties/[id] error:", err);
    return NextResponse.json({ error: "Failed to update property." }, { status: 500 });
  }
}
