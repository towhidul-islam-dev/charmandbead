import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");
  const isUnauthorizedPage = pathname === "/admin/unauthorized";

  // 1. Redirect authenticated users away from Login/Register to their dashboard
  if (token && isAuthPage) {
    const dashboardUrl =
      token.role === "admin" ? "/admin/dashboard" : "/dashboard/orders";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // 2. Redirect unauthenticated users trying to access protected routes to /login
  if (!token && (isDashboardPage || isAdminPage)) {
    if (isUnauthorizedPage) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", req.url);
    // Preserves exact path so user returns after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. STRICT ADMIN GUARD: If logged in user is NOT an admin, block access to /admin
  if (token && isAdminPage && token.role !== "admin" && !isUnauthorizedPage) {
    return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. Static files (images, icons, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads).*)",
  ],
};