import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // We use the same secret as defined in your authOptions
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");
  const isUnauthorizedPage = pathname === "/admin/unauthorized";

  // 1. Redirect authenticated users away from Login/Register
  if (token && isAuthPage) {
    const dashboardUrl = token.role === 'admin' 
      ? "/admin/dashboard" 
      : "/dashboard/orders";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // 2. Protect Protected routes (Dashboard & Admin) from Guests
  if (!token && (isDashboardPage || isAdminPage)) {
    // We don't redirect if it's already the unauthorized page to avoid loops
    if (isUnauthorizedPage) return NextResponse.next();

    const loginUrl = new URL("/login", req.url);
    // This ensures that after login, the user lands exactly where they intended
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-Based Access Control (RBAC)
  // Redirect users who are NOT admins away from admin paths
  if (token && isAdminPage && token.role !== 'admin' && !isUnauthorizedPage) {
    return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes (handled by internal API logic)
     * 2. /_next (Next.js internals)
     * 3. Static files (images, icons, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads).*)',
  ],
};