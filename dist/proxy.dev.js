"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = proxy;
exports.config = void 0;

var _jwt = require("next-auth/jwt");

var _server = require("next/server");

function proxy(req) {
  var pathname, isProduction, token, isAuthPage, isDashboardPage, isAdminPage, loginUrl, dashboardUrl;
  return regeneratorRuntime.async(function proxy$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          pathname = req.nextUrl.pathname; // 1. 🟢 FIX: Skip middleware for Next.js internal pre-fetches
          // This prevents the "flash" of login page during navigation

          if (!(req.headers.get("next-router-prefetch") || req.headers.get("purpose") === "prefetch")) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.next());

        case 3:
          isProduction = process.env.NODE_ENV === "production"; // 2. 🟢 FIX: Be extra explicit with getToken

          _context.next = 6;
          return regeneratorRuntime.awrap((0, _jwt.getToken)({
            req: req,
            secret: process.env.NEXTAUTH_SECRET,
            // This tells NextAuth to handle the __Secure- prefix automatically
            secureCookie: isProduction
          }));

        case 6:
          token = _context.sent;
          isAuthPage = pathname === "/login" || pathname === "/register";
          isDashboardPage = pathname.startsWith("/dashboard");
          isAdminPage = pathname.startsWith("/admin"); // 3. Logic for Protected Routes

          if (!(!token && (isDashboardPage || isAdminPage))) {
            _context.next = 16;
            break;
          }

          if (!(pathname === "/admin/unauthorized")) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.next());

        case 13:
          // Construct absolute URL for redirect
          loginUrl = new URL("/login", req.url);
          loginUrl.searchParams.set("callbackUrl", pathname);
          return _context.abrupt("return", _server.NextResponse.redirect(loginUrl));

        case 16:
          if (!(token && isAdminPage && token.role !== 'admin')) {
            _context.next = 19;
            break;
          }

          if (!(pathname !== "/admin/unauthorized")) {
            _context.next = 19;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/admin/unauthorized", req.url)));

        case 19:
          if (!(token && isAuthPage)) {
            _context.next = 22;
            break;
          }

          dashboardUrl = token.role === 'admin' ? "/admin/dashboard" : "/dashboard/orders";
          return _context.abrupt("return", _server.NextResponse.redirect(new URL(dashboardUrl, req.url)));

        case 22:
          return _context.abrupt("return", _server.NextResponse.next());

        case 23:
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