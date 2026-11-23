import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      name: session.name,
      mobile: session.mobile,
      email: session.email,
      role: session.role,
      accountType: session.accountType,
      expiresAt: session.expiresAt,
    },
  });
}
