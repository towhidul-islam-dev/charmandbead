"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
exports.sendShippingUpdateEmail = sendShippingUpdateEmail;
exports.sendStockEmail = sendStockEmail;
exports.sendAdminLowStockAlert = sendAdminLowStockAlert;

var _resend = require("resend");

var resend = new _resend.Resend(process.env.RESEND_API_KEY); // --- 1. ORDER CONFIRMATION ---

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
            to: order.shippingAddress.email,
            subject: "Order Confirmed - #".concat(order._id.toString().slice(-6)),
            html: "\n        <div style=\"font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 30px; color: #333;\">\n          <h1 style=\"color: #EA638C; font-size: 28px; font-weight: 900;\">CHARM STORE</h1>\n          <p>Hi ".concat(order.shippingAddress.name.split(' ')[0], ", your order is placed!</p>\n          <div style=\"background: #FFF5F8; padding: 25px; border-radius: 20px; margin: 20px 0; border: 1px solid #FFE4ED;\">\n            <div style=\"display: flex; justify-content: space-between;\">\n              <span>Total Bill:</span> <strong>\u09F3").concat(order.totalAmount, "</strong>\n            </div>\n            <div style=\"display: flex; justify-content: space-between; margin-top: 10px;\">\n              <span>Paid Online:</span> <strong style=\"color: #16a34a;\">\u09F3").concat(order.paidAmount, "</strong>\n            </div>\n            ").concat(isPartial ? "<div style=\"margin-top: 15px; border-top: 1px dashed #FFD1E1; pt: 15px;\">\n              <span style=\"color: #EA638C;\">COD BALANCE:</span> <strong style=\"font-size: 20px;\">\u09F3".concat(order.dueAmount, "</strong>\n            </div>") : '', "\n          </div>\n        </div>")
          }));

        case 4:
          return _context.abrupt("return", {
            success: true
          });

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](1);
          return _context.abrupt("return", {
            success: false
          });

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 7]]);
} // --- 2. SHIPPING UPDATE ---


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
            subject: "Shipped! #".concat(order._id.toString().slice(-6)),
            html: "<div style=\"text-align: center; font-family: sans-serif; padding: 40px;\">\n        <h1 style=\"color: #EA638C;\">On its way! \uD83D\uDE9A</h1>\n        <p>Tracking Number: <strong>".concat(order.trackingNumber, "</strong></p>\n        <a href=\"").concat(process.env.NEXT_PUBLIC_BASE_URL, "/dashboard/orders/").concat(order._id, "\" style=\"background: #EA638C; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none;\">Track Order</a>\n      </div>")
          }));

        case 3:
          return _context2.abrupt("return", {
            success: true
          });

        case 6:
          _context2.prev = 6;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", {
            success: false
          });

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 6]]);
} // --- 3. BACK IN STOCK ALERT ---


function sendStockEmail(email, productName, variantKey, productId) {
  return regeneratorRuntime.async(function sendStockEmail$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(resend.emails.send({
            from: 'Charm Store <onboarding@resend.dev>',
            to: email,
            subject: "Restocked: ".concat(productName, "! \u2728"),
            html: "\n        <div style=\"font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 30px; text-align: center;\">\n          <h1 style=\"color: #EA638C; font-weight: 900;\">CHARM STORE</h1>\n          <p style=\"font-size: 18px;\">It's Back!</p>\n          <p>The <strong>".concat(productName, "</strong> (").concat(variantKey, ") you wanted is back in stock.</p>\n          <div style=\"margin: 30px 0;\">\n            <a href=\"").concat(process.env.NEXT_PUBLIC_BASE_URL, "/product/").concat(productId, "\" \n               style=\"background: #EA638C; color: white; padding: 18px 35px; border-radius: 20px; text-decoration: none; font-weight: bold;\">\n               Buy It Now\n            </a>\n          </div>\n          <p style=\"font-size: 11px; color: #999;\">* High wholesale demand. Grab it before it sells out again!</p>\n        </div>")
          }));

        case 3:
          return _context3.abrupt("return", {
            success: true
          });

        case 6:
          _context3.prev = 6;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", {
            success: false
          });

        case 9:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 6]]);
} // Add this to your lib/mail.js


function sendAdminLowStockAlert(productName, variantKey, currentStock, moq) {
  return regeneratorRuntime.async(function sendAdminLowStockAlert$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(resend.emails.send({
            from: 'Charm Store System <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL,
            // Add your email in .env
            subject: "\uD83D\uDEA8 URGENT: Low Stock Alert - ".concat(productName),
            html: "\n        <div style=\"font-family: sans-serif; max-width: 600px; margin: auto; border: 2px solid #FF5F5F; padding: 40px; border-radius: 30px;\">\n          <h1 style=\"color: #FF5F5F; font-size: 20px; font-weight: 900; text-transform: uppercase;\">Inventory Warning</h1>\n          <p style=\"font-size: 16px; color: #333;\">The following product is almost sold out and may affect wholesale orders:</p>\n          \n          <div style=\"background: #FFF0F0; padding: 20px; border-radius: 20px; margin: 20px 0;\">\n            <p style=\"margin: 0; font-size: 18px; font-weight: bold;\">".concat(productName, "</p>\n            <p style=\"margin: 5px 0; color: #666; font-size: 14px;\">Variant: <strong>").concat(variantKey, "</strong></p>\n            <hr style=\"border: none; border-top: 1px solid #FFD6D6; margin: 15px 0;\"/>\n            <div style=\"display: flex; justify-content: space-between;\">\n              <span style=\"color: #FF5F5F; font-weight: 900;\">Current Stock: ").concat(currentStock, "</span>\n              <span style=\"color: #666;\">Min. Order (MOQ): ").concat(moq, "</span>\n            </div>\n          </div>\n\n          <a href=\"").concat(process.env.NEXT_PUBLIC_BASE_URL, "/admin/products\" \n             style=\"display: block; text-align: center; background: #333; color: white; padding: 15px; border-radius: 15px; text-decoration: none; font-weight: bold;\">\n             Go to Inventory Manager\n          </a>\n        </div>\n      ")
          }));

        case 3:
          return _context4.abrupt("return", {
            success: true
          });

        case 6:
          _context4.prev = 6;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", {
            success: false
          });

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 6]]);
}