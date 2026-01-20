"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.POST = POST;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _User = _interopRequireDefault(require("@/models/User"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _nextAuth = require("next-auth");

var _route = require("@/app/api/auth/[...nextauth]/route");

var _server = require("next/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// 👈 CRITICAL: Must be imported to use .populate()
// 1. GET User's Wishlist
function GET() {
  var session, user;
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

          return _context.abrupt("return", _server.NextResponse.json([], {
            status: 200
          }));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: session.user.email
          }).populate("wishlist"));

        case 10:
          user = _context.sent;

          if (user) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: "User not found"
          }, {
            status: 404
          }));

        case 13:
          return _context.abrupt("return", _server.NextResponse.json(user.wishlist || []));

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](0);
          console.error("GET Wishlist Error:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            message: _context.t0.message
          }, {
            status: 500
          }));

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 16]]);
} // 2. TOGGLE Item in Wishlist (Add/Remove)


function POST(req) {
  var session, _ref, productId, user, isWishlisted;

  return regeneratorRuntime.async(function POST$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap((0, _nextAuth.getServerSession)(_route.authOptions));

        case 5:
          session = _context2.sent;

          if (session) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            message: "Unauthorized"
          }, {
            status: 401
          }));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(req.json());

        case 10:
          _ref = _context2.sent;
          productId = _ref.productId;

          if (productId) {
            _context2.next = 14;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            message: "Product ID required"
          }, {
            status: 400
          }));

        case 14:
          _context2.next = 16;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: session.user.email
          }));

        case 16:
          user = _context2.sent;

          if (user) {
            _context2.next = 19;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            message: "User not found"
          }, {
            status: 404
          }));

        case 19:
          // Check if product is already in wishlist
          // Note: Mongoose 'pull' and 'push' handle ObjectId conversion automatically
          isWishlisted = user.wishlist.includes(productId);

          if (isWishlisted) {
            user.wishlist.pull(productId);
          } else {
            user.wishlist.push(productId);
          }

          _context2.next = 23;
          return regeneratorRuntime.awrap(user.save());

        case 23:
          return _context2.abrupt("return", _server.NextResponse.json({
            message: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
            wishlist: user.wishlist
          }));

        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](0);
          console.error("POST Wishlist Error:", _context2.t0);
          return _context2.abrupt("return", _server.NextResponse.json({
            message: _context2.t0.message
          }, {
            status: 500
          }));

        case 30:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 26]]);
}