"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = proxy;
exports.config = void 0;

var _jwt = require("next-auth/jwt");

var _server = require("next/server");

function proxy(req) {
  var pathname, isProduction, token, cookieNames, isAuthPage, isProtectedPage, isAdminPage, loginUrl, redirectUrl;
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
            // When this is true, getToken looks for "__Secure-next-auth.session-token"
            secureCookie: isProduction
          }));

        case 6:
          token = _context.sent;

          // 🔴 DEBUG LOGS: Keep these until we confirm it works!

          /* console.log("--- PROXY DEBUG ---");
          console.log("Path:", pathname);
          console.log("Token Found:", !!token); */
          if (token) {
            console.log("User Role:", token.role);
          } else {
            // This logs all cookies to see if the session cookie is actually being sent
            cookieNames = req.cookies.getAll().map(function (c) {
              return c.name;
            });
            console.log("Cookies Sent by Browser:", cookieNames);
          }

          isAuthPage = pathname === "/login" || pathname === "/register";
          isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname === "/checkout";
          isAdminPage = pathname.startsWith("/admin"); // Logic 1: Redirect unauthenticated users

          if (!(!token && isProtectedPage)) {
            _context.next = 17;
            break;
          }

          if (!(pathname === "/admin/unauthorized")) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.next());

        case 14:
          loginUrl = new URL("/login", req.url);
          loginUrl.searchParams.set("callbackUrl", req.nextUrl.href); // Keep full destination

          return _context.abrupt("return", _server.NextResponse.redirect(loginUrl));

        case 17:
          if (!(token && isAdminPage && token.role !== 'admin')) {
            _context.next = 19;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/admin/unauthorized", req.url)));

        case 19:
          if (!(token && isAuthPage)) {
            _context.next = 22;
            break;
          }

          redirectUrl = token.role === 'admin' ? "/admin/dashboard" : "/dashboard/orders";
          return _context.abrupt("return", _server.NextResponse.redirect(new URL(redirectUrl, req.url)));

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