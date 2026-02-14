import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  
  // 1. 🟢 FIX: Skip middleware for Next.js internal pre-fetches
  // This prevents the "flash" of login page during navigation
  if (req.headers.get("next-router-prefetch") || req.headers.get("purpose") === "prefetch") {
    return NextResponse.next();
  }

  const isProduction = process.env.NODE_ENV === "production";

  // 2. 🟢 FIX: Be extra explicit with getToken
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    // This tells NextAuth to handle the __Secure- prefix automatically
    secureCookie: isProduction 
  });

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");

  // 3. Logic for Protected Routes
  if (!token && (isDashboardPage || isAdminPage)) {
    if (pathname === "/admin/unauthorized") return NextResponse.next();
    
    // Construct absolute URL for redirect
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role Authorization
  if (token && isAdminPage && token.role !== 'admin') {
    if (pathname !== "/admin/unauthorized") {
      return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
    }
  }

  // 5. Redirect logged-in users away from Auth pages
  if (token && isAuthPage) {
    const dashboardUrl = token.role === 'admin' ? "/admin/dashboard" : "/dashboard/orders";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads).*)'],
};