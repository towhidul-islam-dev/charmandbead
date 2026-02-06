"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _server = require("next/server");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Order = _interopRequireDefault(require("@/models/Order"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var STORE_ID = process.env.SSL_STORE_ID;
var STORE_PASSWORD = process.env.SSL_STORE_PASSWORD;
var IS_SANDBOX = process.env.SSL_IS_SANDBOX === "true";
var GATEWAY_URL = IS_SANDBOX ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php" : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

function POST(req) {
  var body, orderId, amount, customerName, customerEmail, data, response, responseText, result;
  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(req.json());

        case 3:
          body = _context.sent;
          // 🛡️ Destructure exactly what the frontend sends
          orderId = body.orderId, amount = body.amount, customerName = body.customerName, customerEmail = body.customerEmail;

          if (!(!orderId || !amount)) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: "Missing required fields"
          }, {
            status: 400
          }));

        case 7:
          data = {
            store_id: STORE_ID,
            store_passwd: STORE_PASSWORD,
            total_amount: amount,
            currency: "BDT",
            tran_id: orderId,
            success_url: "".concat(process.env.NEXTAUTH_URL, "/api/payment/callback?orderId=").concat(orderId),
            fail_url: "".concat(process.env.NEXTAUTH_URL, "/payment/failed"),
            cancel_url: "".concat(process.env.NEXTAUTH_URL, "/payment/cancel"),
            ipn_url: "".concat(process.env.NEXTAUTH_URL, "/api/payment/ipn"),
            shipping_method: "NO",
            product_name: "Charm & Bead Order",
            product_category: "Jewelry",
            product_profile: "general",
            cus_name: customerName,
            cus_email: customerEmail,
            cus_add1: "Dhaka",
            cus_city: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: "01700000000"
          };
          _context.next = 10;
          return regeneratorRuntime.awrap(fetch(GATEWAY_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(data).toString()
          }));

        case 10:
          response = _context.sent;
          _context.next = 13;
          return regeneratorRuntime.awrap(response.text());

        case 13:
          responseText = _context.sent;
          _context.prev = 14;
          result = JSON.parse(responseText);
          _context.next = 21;
          break;

        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](14);
          return _context.abrupt("return", _server.NextResponse.json({
            error: "Gateway Parse Error",
            raw: responseText
          }, {
            status: 502
          }));

        case 21:
          if (!(result.status === "SUCCESS" && result.GatewayPageURL)) {
            _context.next = 25;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            url: result.GatewayPageURL
          }));

        case 25:
          return _context.abrupt("return", _server.NextResponse.json({
            error: "Gateway Rejected Request",
            details: result.failedreason || "Unknown"
          }, {
            status: 400
          }));

        case 26:
          _context.next = 32;
          break;

        case 28:
          _context.prev = 28;
          _context.t1 = _context["catch"](0);
          console.error("PAYMENT_API_CRASH:", _context.t1);
          return _context.abrupt("return", _server.NextResponse.json({
            error: "Internal Server Error"
          }, {
            status: 500
          }));

        case 32:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 28], [14, 18]]);
}