import { NextRequest, NextResponse } from "next/server";
import { PropertyService } from "@/lib/server/property-service";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = getAdminSessionFromRequest(request);
    const isAdmin = Boolean(session);

    const property = await PropertyService.getPropertyByIdOrSlug(id, isAdmin);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (err: any) {
    console.error("GET /api/properties/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch property details" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to update property." },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const updated = await PropertyService.updateProperty(
      id,
      updates,
      session.email,
      updates.statusNotes || "Admin edited property"
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Property record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Property ${updated.listing_id} updated successfully`,
      property: updated,
    });
  } catch (err: any) {
    console.error("PATCH /api/properties/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to delete property." },
        { status: 401 }
      );
    }

    const deleted = await PropertyService.deleteProperty(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property deleted permanently",
    });
  } catch (err: any) {
    console.error("DELETE /api/properties/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
