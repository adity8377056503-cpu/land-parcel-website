import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "@/lib/server/settings-service";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden. Only Super Admin (Aditya Raj) can modify platform settings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, settings: updates, category } = body;

    if (action === "add_category" && category) {
      const added = await SettingsService.addCategory(category, admin.name);
      return NextResponse.json({
        success: true,
        message: `Category "${added.name}" added successfully.`,
        category: added,
      });
    }

    if (action === "update_category" && category?.id) {
      const updated = await SettingsService.updateCategory(category.id, category, admin.name);
      return NextResponse.json({
        success: true,
        message: `Category updated successfully.`,
        category: updated,
      });
    }

    if (updates && typeof updates === "object") {
      const updated = await SettingsService.updateSettings(updates, admin.name);
      return NextResponse.json({
        success: true,
        message: "Site settings updated successfully.",
        settings: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action or payload." }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH /api/settings error:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
