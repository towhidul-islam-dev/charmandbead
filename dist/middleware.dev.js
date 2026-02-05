"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.middleware = middleware;
exports.config = void 0;

var _jwt = require("next-auth/jwt");

var _server = require("next/server");

function middleware(req) {
  var token, pathname, isAuthPage, isDashboardPage, isAdminPage, isUnauthorizedPage, dashboardUrl, loginUrl;
  return regeneratorRuntime.async(function middleware$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap((0, _jwt.getToken)({
            req: req,
            secret: process.env.NEXTAUTH_SECRET
          }));

        case 2:
          token = _context.sent;
          pathname = req.nextUrl.pathname;
          isAuthPage = pathname === "/login" || pathname === "/register";
          isDashboardPage = pathname.startsWith("/dashboard");
          isAdminPage = pathname.startsWith("/admin");
          isUnauthorizedPage = pathname === "/admin/unauthorized"; // 1. Redirect authenticated users away from Login/Register

          if (!(token && isAuthPage)) {
            _context.next = 11;
            break;
          }

          dashboardUrl = token.role === 'admin' ? "/admin/dashboard" : "/dashboard/orders";
          return _context.abrupt("return", _server.NextResponse.redirect(new URL(dashboardUrl, req.url)));

        case 11:
          if (!(!token && (isDashboardPage || isAdminPage))) {
            _context.next = 17;
            break;
          }

          if (!isUnauthorizedPage) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.next());

        case 14:
          loginUrl = new URL("/login", req.url); // This ensures that after login, the user lands exactly where they intended

          loginUrl.searchParams.set("callbackUrl", pathname);
          return _context.abrupt("return", _server.NextResponse.redirect(loginUrl));

        case 17:
          if (!(token && isAdminPage && token.role !== 'admin' && !isUnauthorizedPage)) {
            _context.next = 19;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/admin/unauthorized", req.url)));

        case 19:
          return _context.abrupt("return", _server.NextResponse.next());

        case 20:
        case "end":
          return _context.stop();
      }
    }
  });
}

var config = {
  matcher: [
  /*
   * Match all request paths except for:
   * 1. /api routes (handled by internal API logic)
   * 2. /_next (Next.js internals)
   * 3. Static files (images, icons, etc.)
   */
  '/((?!api|_next/static|_next/image|favicon.ico|images|assets|uploads).*)']
};
exports.config = config;