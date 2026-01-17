"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.middleware = middleware;
exports.config = void 0;

var _jwt = require("next-auth/jwt");

var _server = require("next/server");

function middleware(req) {
  var token, pathname, isAuthPage, isDashboardPage, isAdminPage, isUnauthorizedPage, url;
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
          isUnauthorizedPage = pathname === "/admin/unauthorized"; // 1. If user is logged in and tries to access login/register

          if (!(token && isAuthPage)) {
            _context.next = 11;
            break;
          }

          url = token.role === 'admin' ? new URL("/admin/dashboard", req.url) : new URL("/dashboard/orders", req.url);
          return _context.abrupt("return", _server.NextResponse.redirect(url));

        case 11:
          if (!(!token && (isDashboardPage || isAdminPage))) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/login", req.url)));

        case 13:
          if (!(token && isAdminPage && token.role !== 'admin' && !isUnauthorizedPage)) {
            _context.next = 15;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/admin/unauthorized", req.url)));

        case 15:
          return _context.abrupt("return", _server.NextResponse.next());

        case 16:
        case "end":
          return _context.stop();
      }
    }
  });
}

var config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
exports.config = config;