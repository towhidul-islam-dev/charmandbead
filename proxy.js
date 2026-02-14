import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Skip pre-fetches to keep logs clean and prevent auth glitches
  if (req.headers.get("next-router-prefetch") || req.headers.get("purpose") === "prefetch") {
    return NextResponse.next();
  }

  // 2. 🟢 THE FIX: Handle the "__Secure-" prefix for Vercel
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    // When this is true, getToken looks for "__Secure-next-auth.session-token"
    secureCookie: isProduction 
  });

  // 🔴 DEBUG LOGS: Keep these until we confirm it works!
  console.log("--- PROXY DEBUG ---");
  console.log("Path:", pathname);
  console.log("Token Found:", !!token);
  if (token) {
    console.log("User Role:", token.role);
  } else {
    // This logs all cookies to see if the session cookie is actually being sent
    const cookieNames = req.cookies.getAll().map(c => c.name);
    console.log("Cookies Sent by Browser:", cookieNames);
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname === "/checkout";
  const isAdminPage = pathname.startsWith("/admin");

  // Logic 1: Redirect unauthenticated users
  if (!token && isProtectedPage) {
    if (pathname === "/admin/unauthorized") return NextResponse.next();
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href); // Keep full destination
    return NextResponse.redirect(loginUrl);
  }

  // Logic 2: Admin Authorization
  if (token && isAdminPage && token.role !== 'admin') {
    return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
  }

  // Logic 3: Logged-in users away from Login/Register
  if (token && isAuthPage) {
    const redirectUrl = token.role === 'admin' ? "/admin/dashboard" : "/dashboard/orders";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads).*)'],
};