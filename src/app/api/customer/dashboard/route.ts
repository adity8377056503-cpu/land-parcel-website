import { NextRequest, NextResponse } from "next/server";
import { getCustomerSessionFromRequest, normalizeIndianMobile } from "@/lib/server/customer-auth";
import { PlatformService } from "@/lib/server/platform-service";
import { PropertyService } from "@/lib/server/property-service";

export async function GET(request: NextRequest) {
  try {
    const session = getCustomerSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const customer = await PlatformService.getCustomerById(session.customerId);
    if (!customer) {
      return NextResponse.json(
        { authenticated: false, error: "Customer account not found." },
        { status: 401 }
      );
    }

    const [allProperties, payments, subscriptions, plans] = await Promise.all([
      PropertyService.getAllProperties({ onlyPublished: false }),
      PlatformService.getAllPayments(customer.id),
      PlatformService.getAllSubscriptions(customer.id),
      PlatformService.getPlans(),
    ]);

    const normalizedMobile = normalizeIndianMobile(customer.mobile);

    // Strictly return ONLY properties belonging to this authenticated customer (and strip private documents)
    const ownProperties = allProperties
      .filter((p) => {
        if (p.source === "admin") return false;
        if (p.customer_id && p.customer_id === customer.id) return true;
        if (p.seller_mobile && normalizeIndianMobile(p.seller_mobile) === normalizedMobile) return true;
        return false;
      })
      .map((p) => ({
        ...p,
        documents: [],
      }));

    const eligibility = PlatformService.computeEligibility(customer);

    return NextResponse.json({
      authenticated: true,
      customer,
      eligibility,
      properties: ownProperties,
      payments,
      subscriptions,
      plans,
    });
  } catch (err: any) {
    console.error("GET /api/customer/dashboard error:", err);
    return NextResponse.json(
      { error: "Failed to load customer dashboard." },
      { status: 500 }
    );
  }
}
