"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _server = require("next/server");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Order = _interopRequireDefault(require("@/models/Order"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function POST(req) {
  var _ref, searchParams, orderId, formData, status;

  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          // 1. Extract Order ID from the URL query parameter we set in the success_url
          _ref = new URL(req.url), searchParams = _ref.searchParams;
          orderId = searchParams.get("orderId"); // 2. SSLCommerz sends payment status in the body as Form Data

          _context.next = 7;
          return regeneratorRuntime.awrap(req.formData());

        case 7:
          formData = _context.sent;
          status = formData.get("status"); // 3. Logic for successful payment

          if (!(status === "VALID" || status === "AUTHENTICATED")) {
            _context.next = 16;
            break;
          }

          _context.next = 12;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(orderId, {
            paymentStatus: "Paid",
            status: "Processing",
            // Moves from 'Pending' to 'Processing'
            // Optional: Save transaction details for your records
            paymentDetails: {
              val_id: formData.get("val_id"),
              card_type: formData.get("card_type"),
              bank_tran_id: formData.get("bank_tran_id")
            }
          }));

        case 12:
          console.log("\u2705 Payment successful for Order: ".concat(orderId)); // 4. Redirect to your beautiful Success Page with the Order ID
          // Status 303 ensures the browser switches from POST to GET

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/payment/success?orderId=".concat(orderId), req.url), 303));

        case 16:
          console.log("\u274C Payment failed for Order: ".concat(orderId, ". Status: ").concat(status));
          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/payment/failed?orderId=".concat(orderId), req.url), 303));

        case 18:
          _context.next = 24;
          break;

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](0);
          console.error("CALLBACK_ERROR:", _context.t0); // Fallback redirect if something crashes during DB update

          return _context.abrupt("return", _server.NextResponse.redirect(new URL("/payment/failed", req.url), 303));

        case 24:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 20]]);
}