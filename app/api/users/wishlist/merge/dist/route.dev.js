"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _User = _interopRequireDefault(require("@/models/User"));

var _nextAuth = require("next-auth");

var _route = require("@/app/api/auth/[...nextauth]/route");

var _server = require("next/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function POST(req) {
  var session, _ref, productIds, updatedUser;

  return regeneratorRuntime.async(function POST$(_context) {
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
          return regeneratorRuntime.awrap(req.json());

        case 10:
          _ref = _context.sent;
          productIds = _ref.productIds;

          if (!(!productIds || !Array.isArray(productIds))) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: "Invalid product data"
          }, {
            status: 400
          }));

        case 14:
          _context.next = 16;
          return regeneratorRuntime.awrap(_User["default"].findOneAndUpdate({
            email: session.user.email
          }, {
            $addToSet: {
              wishlist: {
                $each: productIds
              }
            }
          }, {
            "new": true
          }));

        case 16:
          updatedUser = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json({
            message: "Wishlist merged successfully",
            count: updatedUser.wishlist.length
          }));

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](0);
          console.error("Merge Error:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            message: _context.t0.message
          }, {
            status: 500
          }));

        case 24:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 20]]);
}