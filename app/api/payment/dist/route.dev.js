"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
exports.GET = GET;

var _server = require("next/server");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Order = _interopRequireDefault(require("@/models/Order"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// 1. THIS HANDLES THE INITIAL FETCH FROM CHECKOUT PAGE
function POST(req) {
  var _ref, orderData, baseUrl, paymentUrl;

  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(req.json());

        case 3:
          _ref = _context.sent;
          orderData = _ref.orderData;
          _context.next = 7;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 7:
          if (!(!orderData || !orderData.id)) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: "Missing Order ID"
          }, {
            status: 400
          }));

        case 9:
          // --- INTEGRATION POINT ---
          // If you are using SSLCommerz or bKash, you would call their API here.
          // For now, we generate a URL that points back to our own GET handler.
          baseUrl = new URL(req.url).origin;
          paymentUrl = "".concat(baseUrl, "/api/payment?orderId=").concat(orderData.id); // RETURN JSON - This fixes the "Unexpected end of JSON input"

          return _context.abrupt("return", _server.NextResponse.json({
            url: paymentUrl
          }));

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error("Payment Initiation Error:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            error: "Internal Server Error"
          }, {
            status: 500
          }));

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
} // 2. THIS HANDLES THE REDIRECT AFTER THE USER "PAYS"


function GET(req) {
  var _ref2, searchParams, orderId, updatedOrder;

  return regeneratorRuntime.async(function GET$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _ref2 = new URL(req.url), searchParams = _ref2.searchParams;
          orderId = searchParams.get("orderId");
          _context2.next = 5;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 5:
          _context2.next = 7;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(orderId, {
            paymentStatus: "Paid",
            updatedAt: new Date()
          }, {
            "new": true
          }));

        case 7:
          updatedOrder = _context2.sent;

          if (updatedOrder) {
            _context2.next = 10;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.redirect(new URL("/payment/failed", req.url), 303));

        case 10:
          return _context2.abrupt("return", _server.NextResponse.redirect(new URL("/payment/success?orderId=".concat(orderId), req.url), 303));

        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](0);
          console.error("Callback Error:", _context2.t0);
          return _context2.abrupt("return", _server.NextResponse.redirect(new URL("/payment/failed", req.url), 303));

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 13]]);
}