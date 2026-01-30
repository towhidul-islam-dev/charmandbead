import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");
  const isUnauthorizedPage = pathname === "/admin/unauthorized";

  // 1. Redirect authenticated users away from Login/Register
  if (token && isAuthPage) {
    const url = token.role === 'admin' 
      ? new URL("/admin/dashboard", req.url) 
      : new URL("/dashboard/orders", req.url);
    return NextResponse.redirect(url);
  }

  // 2. Protect Protected routes from Guests
  if (!token && (isDashboardPage || isAdminPage)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Admin-Only Guard: Redirect non-admins trying to access admin pages
  if (token && isAdminPage && token.role !== 'admin' && !isUnauthorizedPage) {
    return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public images/assets
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
};