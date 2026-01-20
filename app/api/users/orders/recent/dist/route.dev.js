"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Order = _interopRequireDefault(require("@/models/Order"));

var _nextAuth = require("next-auth");

var _route = require("@/app/api/auth/[...nextauth]/route");

var _server = require("next/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Ensure you have an Order model
function GET() {
  var session, orders;
  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap((0, _nextAuth.getServerSession)(_route.authOptions));

        case 5:
          session = _context.sent;

          if (session) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: "Unauthorized"
          }, {
            status: 401
          }));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(_Order["default"].find({
            userEmail: session.user.email
          }).sort({
            createdAt: -1
          }).limit(5));

        case 10:
          orders = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json(orders));

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", _server.NextResponse.json({
            message: _context.t0.message
          }, {
            status: 500
          }));

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}