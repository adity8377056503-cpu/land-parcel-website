import { NextRequest, NextResponse } from "next/server";
import { PropertyService } from "@/lib/server/property-service";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { SettingsService } from "@/lib/server/settings-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to duplicate property." },
        { status: 401 }
      );
    }

    const duplicated = await PropertyService.duplicateProperty(id, session.name);
    if (!duplicated) {
      return NextResponse.json({ error: "Original property not found" }, { status: 404 });
    }

    await SettingsService.recordAudit({
      action: "DUPLICATE_PROPERTY",
      performed_by: session.name,
      target_entity: "property",
      target_id: duplicated.id,
      details: {
        original_id: id,
        new_listing_id: duplicated.listing_id,
        new_title: duplicated.title,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Property successfully duplicated as draft: ${duplicated.listing_id}`,
      property: duplicated,
    });
  } catch (err: any) {
    console.error("POST /api/properties/[id]/duplicate error:", err);
    return NextResponse.json({ error: "Failed to duplicate property" }, { status: 500 });
  }
}
