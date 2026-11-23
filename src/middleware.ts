import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const token = request.cookies.get("lp_admin_token")?.value;

    let isValid = false;
    if (token && token.includes(".")) {
      try {
        const [payload, signature] = token.split(".");
        if (payload && signature && signature.length >= 32) {
          // Edge-compatible base64url decoding (full HMAC signature verification occurs in every server API)
          const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
          const jsonStr = atob(base64);
          const session = JSON.parse(jsonStr);

          if (
            session &&
            (session.role === "super_admin" || session.role === "admin") &&
            typeof session.expiresAt === "number" &&
            session.expiresAt > Date.now()
          ) {
            isValid = true;
          }
        }
      } catch {
        isValid = false;
      }
    }

    if (!isValid && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isValid && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
