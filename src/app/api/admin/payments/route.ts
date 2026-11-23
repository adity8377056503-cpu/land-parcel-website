import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { PlatformService } from "@/lib/server/platform-service";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const payments = await PlatformService.getAllPayments();
    return NextResponse.json({ success: true, payments });
  } catch (err: any) {
    console.error("GET /api/admin/payments error:", err);
    return NextResponse.json({ error: "Failed to load payment records." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);
    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden. Only Super Admin (Aditya Raj) can verify, approve, or reject customer payments." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { transactionId, action, adminNotes } = body;

    if (!transactionId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "transactionId and valid action (approve/reject) are required." }, { status: 400 });
    }

    if (action === "approve") {
      const result = await PlatformService.approvePayment(
        transactionId,
        `${admin.name} (Super Admin)`,
        adminNotes
      );
      if (!result) {
        return NextResponse.json({ error: "Transaction not found or already verified." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Payment verified and subscription activated for ${result.customer.name}.`,
        transaction: result.transaction,
        customer: result.customer,
        subscription: result.subscription,
      });
    } else {
      const rejected = await PlatformService.rejectPayment(
        transactionId,
        `${admin.name} (Super Admin)`,
        adminNotes || "Payment could not be verified."
      );
      if (!rejected) {
        return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Payment transaction rejected. No credits were added.",
        transaction: rejected,
      });
    }
  } catch (err: any) {
    console.error("PATCH /api/admin/payments error:", err);
    return NextResponse.json({ error: "Failed to process payment decision." }, { status: 500 });
  }
}
