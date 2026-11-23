import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest, OFFICIAL_ADMIN } from "@/lib/server/admin-auth";

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
      email: session.email,
      name: OFFICIAL_ADMIN.name,
      role: "admin",
      expiresAt: session.expiresAt,
    },
  });
}
