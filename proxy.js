import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Skip pre-fetches to keep logs clean and prevent auth glitches
  if (req.headers.get("next-router-prefetch") || req.headers.get("purpose") === "prefetch") {
    return NextResponse.next();
  }

  // 2. Attempt to get the token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isProduction 
  });

  // 🔴 DEBUG LOGS: This is what you will look for in Vercel
  console.log("--- PROXY DEBUG START ---");
  console.log("Path:", pathname);
  console.log("Token Found:", !!token);
  if (token) {
    console.log("User Email:", token.email);
    console.log("User Role:", token.role);
  } else {
    // If token is null, we log the cookie names to see if they exist
    const allCookies = req.cookies.getAll().map(c => c.name);
    console.log("Available Cookies:", allCookies);
  }
  console.log("--- PROXY DEBUG END ---");

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");

  // Logic: Redirect to login if no token for protected routes
  if (!token && (isDashboardPage || isAdminPage)) {
    if (pathname === "/admin/unauthorized") return NextResponse.next();
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logic: Admin Authorization
  if (token && isAdminPage && token.role !== 'admin') {
    if (pathname !== "/admin/unauthorized") {
      return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
    }
  }

  // Logic: Logged-in users away from Login
  if (token && isAuthPage) {
    const dashboardUrl = token.role === 'admin' ? "/admin/dashboard" : "/dashboard/orders";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads).*)'],
};