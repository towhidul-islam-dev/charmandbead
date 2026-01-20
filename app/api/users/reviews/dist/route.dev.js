"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Review = _interopRequireDefault(require("@/models/Review"));

var _nextAuth = require("next-auth");

var _route = require("@/app/api/auth/[...nextauth]/route");

var _server = require("next/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function POST(req) {
  var session, body, description, imageUrl, rating, newReview;
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
            message: "You must be logged in"
          }, {
            status: 401
          }));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(req.json());

        case 10:
          body = _context.sent;
          description = body.description, imageUrl = body.imageUrl, rating = body.rating; // 💡 We only create fields that exist in your Review Schema

          _context.next = 14;
          return regeneratorRuntime.awrap(_Review["default"].create({
            description: description,
            // The comment
            imageUrl: imageUrl,
            // The product image URL
            rating: rating,
            // Make sure you added this to your models/Review.js
            isFeatured: false // Default for admin approval

          }));

        case 14:
          newReview = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json(newReview, {
            status: 201
          }));

        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](0);
          console.error("Review Save Error:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            message: _context.t0.message || "Internal Server Error"
          }, {
            status: 500
          }));

        case 22:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 18]]);
}