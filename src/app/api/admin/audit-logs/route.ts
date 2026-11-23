import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "@/lib/server/settings-service";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    const logs = await SettingsService.getAuditLogs(limit);
    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (err: any) {
    console.error("GET /api/admin/audit-logs error:", err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
