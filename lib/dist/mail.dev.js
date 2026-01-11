"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
exports.sendShippingUpdateEmail = sendShippingUpdateEmail;

var _resend = require("resend");

var resend = new _resend.Resend(process.env.RESEND_API_KEY);

function sendOrderConfirmationEmail(order) {
  var isPartial;
  return regeneratorRuntime.async(function sendOrderConfirmationEmail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          isPartial = order.dueAmount > 0;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(resend.emails.send({
            from: 'Charm Store <onboarding@resend.dev>',
            // Replace with your verified domain later
            to: order.shippingAddress.email,
            subject: "Order Confirmed - #".concat(order._id.toString().slice(-6)),
            html: "\n        <div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 30px; color: #333;\">\n          <h1 style=\"color: #EA638C; margin-bottom: 5px; font-size: 28px; font-weight: 900;\">CHARM STORE</h1>\n          <p style=\"font-size: 16px; color: #666;\">Hi ".concat(order.shippingAddress.name.split(' ')[0], ",</p>\n          <p style=\"font-size: 16px;\">Your order has been placed successfully and is being processed.</p>\n          \n          <div style=\"background: #FFF5F8; padding: 25px; border-radius: 20px; margin: 30px 0; border: 1px solid #FFE4ED;\">\n            <h3 style=\"margin-top: 0; font-size: 12px; text-transform: uppercase; color: #EA638C; letter-spacing: 2px;\">Payment Details</h3>\n            \n            <div style=\"display: flex; justify-content: space-between; margin-bottom: 10px;\">\n              <span style=\"color: #666;\">Total Bill:</span>\n              <strong style=\"color: #333;\">\u09F3").concat(order.totalAmount.toLocaleString(), "</strong>\n            </div>\n\n            <div style=\"display: flex; justify-content: space-between; margin-bottom: 10px;\">\n              <span style=\"color: #666;\">Paid Online:</span>\n              <strong style=\"color: #16a34a;\">\u09F3").concat(order.paidAmount.toLocaleString(), "</strong>\n            </div>\n            \n            ").concat(isPartial ? "\n              <div style=\"border-top: 2px dashed #FFD1E1; margin-top: 15px; padding-top: 15px;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n                  <span style=\"color: #EA638C; font-weight: bold;\">CASH ON DELIVERY:</span>\n                  <span style=\"color: #EA638C; font-size: 24px; font-weight: 900;\">\u09F3".concat(order.dueAmount.toLocaleString(), "</span>\n                </div>\n                <p style=\"font-size: 11px; color: #D14D72; font-style: italic; margin-top: 10px; line-height: 1.4;\">\n                  * Since this is a partial payment, please pay the remaining balance to the delivery agent.\n                </p>\n              </div>\n            ") : "\n              <div style=\"border-top: 2px dashed #D1FAE5; margin-top: 15px; padding-top: 15px;\">\n                <strong style=\"color: #16a34a; text-transform: uppercase; font-size: 12px;\">Paid In Full - No COD Required</strong>\n              </div>\n            ", "\n          </div>\n\n          <div style=\"margin-top: 30px;\">\n            <h3 style=\"font-size: 12px; text-transform: uppercase; color: #999; letter-spacing: 1px;\">Shipping To:</h3>\n            <p style=\"font-size: 14px; color: #555; line-height: 1.5;\">\n              ").concat(order.shippingAddress.name, "<br/>\n              ").concat(order.shippingAddress.phone, "<br/>\n              ").concat(order.shippingAddress.address, "\n            </p>\n          </div>\n          \n          <p style=\"font-size: 11px; color: #BBB; margin-top: 40px; text-align: center;\">Order ID: ").concat(order._id, "</p>\n        </div>\n      ")
          }));

        case 4:
          return _context.abrupt("return", {
            success: true
          });

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](1);
          console.error("Resend Error:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            error: _context.t0
          });

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 7]]);
} // lib/mail.js (Add this below your other function)


function sendShippingUpdateEmail(order) {
  return regeneratorRuntime.async(function sendShippingUpdateEmail$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(resend.emails.send({
            from: 'Charm Store <onboarding@resend.dev>',
            to: order.shippingAddress.email,
            subject: "Your Order #".concat(order._id.toString().slice(-6), " has shipped!"),
            html: "\n        <div style=\"font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 24px; text-align: center;\">\n          <h1 style=\"color: #EA638C;\">On its way! \uD83D\uDE9A</h1>\n          <p style=\"font-size: 16px; color: #555;\">Great news! Your package is officially on the move.</p>\n          \n          <div style=\"background: #f9f9f9; padding: 20px; border-radius: 16px; margin: 20px 0;\">\n            <p style=\"margin: 0; font-size: 12px; text-transform: uppercase; color: #999;\">Tracking Number</p>\n            <p style=\"margin: 5px 0; font-size: 20px; font-weight: bold; color: #333;\">".concat(order.trackingNumber, "</p>\n          </div>\n\n          <a href=\"https://yourstore.com/dashboard/orders/").concat(order._id, "\" \n             style=\"display: inline-block; background: #EA638C; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 20px 0;\">\n             Track Your Order\n          </a>\n\n          <p style=\"font-size: 13px; color: #888;\">\n            If you have a remaining COD balance of <strong>\u09F3").concat(order.dueAmount, "</strong>, please have it ready for the delivery person.\n          </p>\n        </div>\n      ")
          }));

        case 3:
          return _context2.abrupt("return", {
            success: true
          });

        case 6:
          _context2.prev = 6;
          _context2.t0 = _context2["catch"](0);
          console.error("Shipping Email Error:", _context2.t0);
          return _context2.abrupt("return", {
            success: false
          });

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 6]]);
}