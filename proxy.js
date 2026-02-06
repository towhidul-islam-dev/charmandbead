import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// ✅ CHANGE: Renamed from 'middleware' to 'proxy'
export async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");
  const isUnauthorizedPage = pathname === "/admin/unauthorized";

  if (token && isAuthPage) {
    const dashboardUrl = token.role === 'admin' 
      ? "/admin/dashboard" 
      : "/dashboard/orders";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  if (!token && (isDashboardPage || isAdminPage)) {
    if (isUnauthorizedPage) return NextResponse.next();
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAdminPage && token.role !== 'admin' && !isUnauthorizedPage) {
    return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads).*)',
  ],
};