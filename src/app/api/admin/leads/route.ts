import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { PlatformService } from "@/lib/server/platform-service";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const leads = await PlatformService.getAllEnquiries();
    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    console.error("GET /api/admin/leads error:", err);
    return NextResponse.json({ error: "Failed to load leads." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, addNote, follow_up_date } = body;
    if (!id) {
      return NextResponse.json({ error: "Lead ID is required." }, { status: 400 });
    }

    const updated = await PlatformService.updateEnquiry(id, {
      status,
      addNote,
      follow_up_date,
      createdBy: admin.name,
    });

    if (!updated) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (err: any) {
    console.error("PATCH /api/admin/leads error:", err);
    return NextResponse.json({ error: "Failed to update lead." }, { status: 500 });
  }
}
