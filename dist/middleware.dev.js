"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.middleware = middleware;
exports.config = void 0;

var _jwt = require("next-auth/jwt");

var _server = require("next/server");

function middleware(req) {
  var token, pathname, isAuthPage, isDashboardPage, isAdminPage, isUnauthorizedPage, url, loginUrl;
  return regeneratorRuntime.async(function middleware$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap((0, _jwt.getToken)({
            req: req
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

          url = token.role === 'admin' ? new URL("/admin/dashboard", req.url) : new URL("/dashboard/orders", req.url);
          return _context.abrupt("return", _server.NextResponse.redirect(url));

        case 11:
          if (!(!token && (isDashboardPage || isAdminPage))) {
            _context.next = 15;
            break;
          }

          loginUrl = new URL("/login", req.url);
          loginUrl.searchParams.set("callbackUrl", pathname);
          return _context.abrupt("return", _server.NextResponse.redirect(loginUrl));

        case 15:
          if (!(token && isAdminPage && token.role !== 'admin' && !isUnauthorizedPage)) {
            _context.next = 17;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/admin/unauthorized", req.url)));

        case 17:
          return _context.abrupt("return", _server.NextResponse.next());

        case 18:
        case "end":
          return _context.stop();
      }
    }
  });
}

var config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public images/assets
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)']
};
exports.config = config;