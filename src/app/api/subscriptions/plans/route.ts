import { NextRequest, NextResponse } from "next/server";
import { PlatformService } from "@/lib/server/platform-service";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

export async function GET() {
  try {
    const plans = await PlatformService.getPlans();
    return NextResponse.json({ success: true, plans });
  } catch (err: any) {
    console.error("GET /api/subscriptions/plans error:", err);
    return NextResponse.json({ error: "Failed to load subscription plans." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden. Only Super Admin (Aditya Raj) can modify subscription pricing and credits." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { planId, name, description, price, listing_credits, validity_months, is_active } = body;

    if (!planId) {
      return NextResponse.json({ error: "planId is required." }, { status: 400 });
    }

    const updated = await PlatformService.updatePlan(planId, {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(listing_credits !== undefined ? { listing_credits: Number(listing_credits) } : {}),
      ...(validity_months !== undefined ? { validity_months: Number(validity_months) } : {}),
      ...(is_active !== undefined ? { is_active: Boolean(is_active) } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan: updated });
  } catch (err: any) {
    console.error("PATCH /api/subscriptions/plans error:", err);
    return NextResponse.json({ error: "Failed to update subscription plan." }, { status: 500 });
  }
}
