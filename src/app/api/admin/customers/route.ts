import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { PlatformService } from "@/lib/server/platform-service";
import { UserRole } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const [customers, subscriptions, plans] = await Promise.all([
      PlatformService.getAllCustomers(),
      PlatformService.getAllSubscriptions(),
      PlatformService.getPlans(),
    ]);

    return NextResponse.json({
      success: true,
      customers,
      subscriptions,
      plans,
    });
  } catch (err: any) {
    console.error("GET /api/admin/customers error:", err);
    return NextResponse.json({ error: "Failed to fetch customer accounts." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden. Only Super Admin (Aditya Raj) can manage roles, credits, and subscriptions." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, customerId } = body;

    if (!customerId || !action) {
      return NextResponse.json({ error: "customerId and action are required." }, { status: 400 });
    }

    const existing = await PlatformService.getCustomerById(customerId);
    if (!existing) {
      return NextResponse.json({ error: "Customer account not found." }, { status: 404 });
    }

    switch (action) {
      case "change_role": {
        const nextRole = body.system_role as UserRole;
        if (!["customer", "admin", "super_admin"].includes(nextRole)) {
          return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
        }
        const updated = await PlatformService.updateCustomer(customerId, { system_role: nextRole });
        return NextResponse.json({
          success: true,
          message: `Role updated to ${nextRole} by ${admin.name}.`,
          customer: updated,
        });
      }

      case "adjust_credits": {
        const freeTotal =
          body.free_credits_total !== undefined ? Math.max(0, Number(body.free_credits_total)) : existing.free_credits_total;
        const paidDelta = body.add_paid_credits !== undefined ? Number(body.add_paid_credits) : 0;
        const nextPaidTotal =
          body.paid_credits_total !== undefined
            ? Math.max(0, Number(body.paid_credits_total))
            : Math.max(0, existing.paid_credits_total + paidDelta);

        const updated = await PlatformService.updateCustomer(customerId, {
          free_credits_total: freeTotal,
          paid_credits_total: nextPaidTotal,
        });
        return NextResponse.json({
          success: true,
          message: `Listing credits updated for ${existing.name}.`,
          customer: updated,
        });
      }

      case "activate_subscription": {
        const { planId, validityMonths, creditsOverride, notes } = body;
        const updated = await PlatformService.manualActivateSubscription({
          customerId,
          planId: planId || "plan-monthly-599",
          validityMonths: validityMonths ? Number(validityMonths) : undefined,
          creditsOverride: creditsOverride !== undefined ? Number(creditsOverride) : undefined,
          activatedBy: admin.name,
          notes,
        });
        return NextResponse.json({
          success: true,
          message: `Subscription activated for ${existing.name}.`,
          customer: updated,
        });
      }

      case "deactivate_subscription": {
        const updated = await PlatformService.updateCustomer(customerId, {
          subscription_status: "cancelled",
        });
        return NextResponse.json({
          success: true,
          message: `Subscription deactivated for ${existing.name}. Existing published properties remain visible.`,
          customer: updated,
        });
      }

      case "suspend_customer": {
        const updated = await PlatformService.updateCustomer(customerId, {
          status: "suspended",
        });
        return NextResponse.json({
          success: true,
          message: `Account for ${existing.name} has been suspended.`,
          customer: updated,
        });
      }

      case "reactivate_customer": {
        const updated = await PlatformService.updateCustomer(customerId, {
          status: "active",
        });
        return NextResponse.json({
          success: true,
          message: `Account for ${existing.name} has been reactivated.`,
          customer: updated,
        });
      }

      case "add_internal_note": {
        const note = (body.note as string)?.trim();
        if (!note) {
          return NextResponse.json({ error: "Note content cannot be empty." }, { status: 400 });
        }
        const formattedNote = `[${new Date().toISOString().slice(0, 10)} - ${admin.name}]: ${note}`;
        const existingNotes = existing.internal_notes || [];
        const updated = await PlatformService.updateCustomer(customerId, {
          internal_notes: [formattedNote, ...existingNotes],
        });
        return NextResponse.json({
          success: true,
          message: "Internal note saved successfully.",
          customer: updated,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("PATCH /api/admin/customers error:", err);
    return NextResponse.json({ error: "Failed to update customer account." }, { status: 500 });
  }
}
