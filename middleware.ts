import { NextRequest, NextResponse } from "next/server";
import { decodeSessionCookie, sessionCookieName } from "./src/lib/session-cookie";

const protectedPrefixes = ["/dashboard", "/projects", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = decodeSessionCookie(
    request.cookies.get(sessionCookieName)?.value,
  );

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/admin/:path*"],
};
