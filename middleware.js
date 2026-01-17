import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");
  const isUnauthorizedPage = pathname === "/admin/unauthorized";

  // 1. If user is logged in and tries to access login/register
  if (token && isAuthPage) {
    const url = token.role === 'admin' 
      ? new URL("/admin/dashboard", req.url) 
      : new URL("/dashboard/orders", req.url);
    return NextResponse.redirect(url);
  }

  // 2. If user is NOT logged in and tries to access protected routes
  if (!token && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. 💡 ADMIN PROTECTION LOGIC
  // If user is logged in, trying to access admin pages, 
  // is NOT an admin, and is NOT already on the unauthorized page.
  if (token && isAdminPage && token.role !== 'admin' && !isUnauthorizedPage) {
    return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};