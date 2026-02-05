"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startPasswordReset = startPasswordReset;
exports.updatePasswordAction = updatePasswordAction;

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _User = _interopRequireDefault(require("@/models/User"));

var _tokens = require("@/lib/tokens");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _resend = require("resend");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var resend = new _resend.Resend(process.env.RESEND_API_KEY);

function startPasswordReset(email) {
  var normalizedEmail, resetToken, expiry, user, resetLink, _ref, error;

  return regeneratorRuntime.async(function startPasswordReset$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          // Normalize email to ensure it matches the DB (prevents "Email not found" bugs)
          normalizedEmail = email.toLowerCase().trim();
          resetToken = (0, _tokens.generateResetToken)();
          expiry = Date.now() + 3600000; // Use normalizedEmail to find the user

          _context.next = 8;
          return regeneratorRuntime.awrap(_User["default"].findOneAndUpdate({
            email: normalizedEmail
          }, {
            resetToken: resetToken,
            resetTokenExpiry: expiry
          }));

        case 8:
          user = _context.sent;

          if (user) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("return", {
            success: true
          });

        case 11:
          resetLink = "".concat(process.env.NEXTAUTH_URL || 'http://localhost:3000', "/reset-password/").concat(resetToken);
          _context.next = 14;
          return regeneratorRuntime.awrap(resend.emails.send({
            from: 'Charm & Bead Security <onboarding@resend.dev>',
            // Keep your current verified sender
            to: [normalizedEmail],
            subject: 'Secure Access Recovery',
            html: "\n        <div style=\"font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 2px solid #FBB6E6; border-radius: 32px; background-color: #ffffff; text-align: center;\">\n          <h2 style=\"color: #3E442B; text-transform: uppercase; letter-spacing: 2px; font-style: italic;\">Recover <span style=\"color: #EA638C;\">Access</span></h2>\n          <p style=\"color: #3E442B; font-size: 14px; font-weight: 600;\">A password reset was requested for your account.</p>\n          <div style=\"margin: 30px 0;\">\n            <a href=\"".concat(resetLink, "\" style=\"background-color: #3E442B; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 11px; display: inline-block; letter-spacing: 2px;\">ESTABLISH NEW KEY</a>\n          </div>\n          <p style=\"color: #EA638C; font-size: 10px; font-weight: 900; letter-spacing: 1px;\">LINK EXPIRES IN 1 HOUR.</p>\n          <hr style=\"border: none; border-top: 1px solid #FBB6E6; margin-top: 30px;\" />\n          <p style=\"font-size: 9px; color: #3E442B; opacity: 0.6; text-transform: uppercase;\">Charm & Bead Official Registry</p>\n        </div>\n      ")
          }));

        case 14:
          _ref = _context.sent;
          error = _ref.error;

          if (!error) {
            _context.next = 18;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            error: "Email service is temporarily busy."
          });

        case 18:
          return _context.abrupt("return", {
            success: true
          });

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](0);
          console.error("Auth Action Error:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            error: "System error. Please try again."
          });

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 21]]);
}

function updatePasswordAction(token, newPassword) {
  var user;
  return regeneratorRuntime.async(function updatePasswordAction$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            resetToken: token,
            resetTokenExpiry: {
              $gt: Date.now()
            }
          }));

        case 5:
          user = _context2.sent;

          if (user) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", {
            success: false,
            error: "Invalid or expired link."
          });

        case 8:
          // Update fields exactly as before
          user.password = newPassword;
          user.resetToken = null;
          user.resetTokenExpiry = null; // This triggers your pre-save hook for hashing - safely preserved.

          _context2.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          return _context2.abrupt("return", {
            success: true
          });

        case 16:
          _context2.prev = 16;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", {
            success: false,
            error: "System update failed."
          });

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 16]]);
}