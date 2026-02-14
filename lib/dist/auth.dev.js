"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = proxy;
exports.config = void 0;

var _jwt = require("next-auth/jwt");

var _server = require("next/server");

function proxy(req) {
  var pathname, isProduction, token, allCookies, isAuthPage, isDashboardPage, isAdminPage, loginUrl, dashboardUrl;
  return regeneratorRuntime.async(function proxy$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          pathname = req.nextUrl.pathname;
          isProduction = process.env.NODE_ENV === "production"; // 1. Skip pre-fetches to keep logs clean and prevent auth glitches

          if (!(req.headers.get("next-router-prefetch") || req.headers.get("purpose") === "prefetch")) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.next());

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _jwt.getToken)({
            req: req,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: isProduction
          }));

        case 6:
          token = _context.sent;
          // 🔴 DEBUG LOGS: This is what you will look for in Vercel
          console.log("--- PROXY DEBUG START ---");
          console.log("Path:", pathname);
          console.log("Token Found:", !!token);

          if (token) {
            console.log("User Email:", token.email);
            console.log("User Role:", token.role);
          } else {
            // If token is null, we log the cookie names to see if they exist
            allCookies = req.cookies.getAll().map(function (c) {
              return c.name;
            });
            console.log("Available Cookies:", allCookies);
          }

          console.log("--- PROXY DEBUG END ---");
          isAuthPage = pathname === "/login" || pathname === "/register";
          isDashboardPage = pathname.startsWith("/dashboard");
          isAdminPage = pathname.startsWith("/admin"); // Logic: Redirect to login if no token for protected routes

          if (!(!token && (isDashboardPage || isAdminPage))) {
            _context.next = 21;
            break;
          }

          if (!(pathname === "/admin/unauthorized")) {
            _context.next = 18;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.next());

        case 18:
          loginUrl = new URL("/login", req.url);
          loginUrl.searchParams.set("callbackUrl", pathname);
          return _context.abrupt("return", _server.NextResponse.redirect(loginUrl));

        case 21:
          if (!(token && isAdminPage && token.role !== 'admin')) {
            _context.next = 24;
            break;
          }

          if (!(pathname !== "/admin/unauthorized")) {
            _context.next = 24;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/admin/unauthorized", req.url)));

        case 24:
          if (!(token && isAuthPage)) {
            _context.next = 27;
            break;
          }

          dashboardUrl = token.role === 'admin' ? "/admin/dashboard" : "/dashboard/orders";
          return _context.abrupt("return", _server.NextResponse.redirect(new URL(dashboardUrl, req.url)));

        case 27:
          return _context.abrupt("return", _server.NextResponse.next());

        case 28:
        case "end":
          return _context.stop();
      }
    }
  });
}

var config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads).*)']
};
exports.config = config;