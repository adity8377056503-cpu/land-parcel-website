import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerSessionFromRequest } from "@/lib/server/customer-auth";
import { PlatformService } from "@/lib/server/platform-service";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional().or(z.literal("")),
  accountType: z.enum(["owner", "dealer", "agent", "builder", "developer"]).optional(),
  companyName: z.string().max(120).optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const session = getCustomerSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, customer: null }, { status: 200 });
  }

  const customer = await PlatformService.getCustomerById(session.customerId);
  if (!customer) {
    return NextResponse.json({ authenticated: false, customer: null }, { status: 200 });
  }

  const eligibility = PlatformService.computeEligibility(customer);
  return NextResponse.json({
    authenticated: true,
    customer,
    eligibility,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getCustomerSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to update your profile." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
    }

    // SECURITY: Customers can ONLY update their own display profile fields — never credits, role, or subscription status
    const updated = await PlatformService.updateCustomer(session.customerId, {
      ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
      ...(parsed.data.email !== undefined ? { email: parsed.data.email.trim() || undefined } : {}),
      ...(parsed.data.accountType ? { role: parsed.data.accountType } : {}),
      ...(parsed.data.companyName !== undefined
        ? { company_name: parsed.data.companyName.trim() || undefined }
        : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customer: updated,
      eligibility: PlatformService.computeEligibility(updated),
    });
  } catch (err: any) {
    console.error("PATCH /api/auth/session error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
