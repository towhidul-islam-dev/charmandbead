// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // 1. Get the session token
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // 2. Define path types
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");

  // 3. LOGIC: If user is logged in and tries to access login/register
  if (token && isAuthPage) {
    // Check role from token and redirect accordingly
    const url = token.role === 'admin' 
      ? new URL("/admin/dashboard", req.url) 
      : new URL("/dashboard/orders", req.url);
    return NextResponse.redirect(url);
  }

  // 4. LOGIC: If user is NOT logged in and tries to access protected routes
  if (!token && (isDashboardPage || isAdminPage)) {
    // We redirect to login but we DON'T manually append a callbackUrl string 
    // to keep the URL clean if you prefer.
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// 5. MATCHER: This is crucial. It must include all paths you want to control.
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/login", 
    "/register"
  ],
};