"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startPasswordReset = startPasswordReset;
exports.verifyOTPAction = verifyOTPAction;
exports.updatePasswordAction = updatePasswordAction;

var _User = _interopRequireDefault(require("@/models/User"));

var _tokens = require("@/lib/tokens");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Ensure you have a function that returns a 6-digit string

/**
 * STEP 1: Start Reset (Generate & Send 6-Digit OTP)
 */
function startPasswordReset(email) {
  var normalizedEmail, user, lastSent, cooldown, timeLeft, otp, transporter;
  return regeneratorRuntime.async(function startPasswordReset$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          normalizedEmail = email.toLowerCase().trim();
          _context.next = 6;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: normalizedEmail
          }));

        case 6:
          user = _context.sent;

          if (user) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", {
            success: true
          });

        case 9:
          if (!user.resetTokenSentAt) {
            _context.next = 15;
            break;
          }

          lastSent = new Date(user.resetTokenSentAt).getTime();
          cooldown = 2 * 60 * 1000;

          if (!(Date.now() - lastSent < cooldown)) {
            _context.next = 15;
            break;
          }

          timeLeft = Math.ceil((cooldown - (Date.now() - lastSent)) / 1000);
          return _context.abrupt("return", {
            success: false,
            error: "Wait ".concat(timeLeft, "s before retrying.")
          });

        case 15:
          // 🔢 Generate 6-Digit OTP
          otp = (0, _tokens.generateOTP)(); // e.g., "542910"

          user.otpCode = otp;
          user.otpExpiry = Date.now() + 600000; // 10 Minutes expiry

          user.resetTokenSentAt = new Date();
          _context.next = 21;
          return regeneratorRuntime.awrap(user.save());

        case 21:
          // ✉️ Send OTP Email
          transporter = _nodemailer["default"].createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });
          _context.next = 24;
          return regeneratorRuntime.awrap(transporter.sendMail({
            from: "\"Charm & Bead Security\" <".concat(process.env.EMAIL_USER, ">"),
            to: normalizedEmail,
            subject: "Your Security Code: ".concat(otp),
            html: "\n        <div style=\"font-family: sans-serif; max-width: 450px; margin: auto; padding: 40px; border: 2px solid #FBB6E6; border-radius: 32px; background-color: #ffffff; text-align: center;\">\n          <h2 style=\"color: #3E442B; text-transform: uppercase; font-style: italic;\">Identity <span style=\"color: #EA638C;\">Verification</span></h2>\n          <p style=\"color: #3E442B; font-size: 14px; margin-bottom: 25px;\">Use the following code to authorize your password reset.</p>\n          \n          <div style=\"background-color: #f9f9f9; padding: 20px; border-radius: 20px; border: 1px dashed #3E442B/20;\">\n            <span style=\"font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #3E442B; font-family: monospace;\">".concat(otp, "</span>\n          </div>\n\n          <p style=\"color: #EA638C; font-size: 10px; font-weight: 900; margin-top: 25px; letter-spacing: 1px;\">THIS CODE EXPIRES IN 10 MINUTES.</p>\n          <hr style=\"border: none; border-top: 1px solid #eee; margin: 30px 0;\" />\n          <p style=\"font-size: 9px; color: #3E442B; opacity: 0.6; text-transform: uppercase;\">If you did not request this, please secure your account immediately.</p>\n        </div>\n      ")
          }));

        case 24:
          return _context.abrupt("return", {
            success: true
          });

        case 27:
          _context.prev = 27;
          _context.t0 = _context["catch"](0);
          console.error("Auth Action Error:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            error: "System failure. Try again later."
          });

        case 31:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 27]]);
}
/**
 * STEP 2: Verify OTP & Issue Temporary Reset Token
 */


function verifyOTPAction(email, otp) {
  var normalizedEmail, user, resetToken;
  return regeneratorRuntime.async(function verifyOTPAction$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          normalizedEmail = email.toLowerCase().trim();
          _context2.next = 6;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: normalizedEmail,
            otpCode: otp,
            otpExpiry: {
              $gt: Date.now()
            }
          }));

        case 6:
          user = _context2.sent;

          if (user) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", {
            success: false,
            error: "Invalid or expired security code."
          });

        case 9:
          // Generate a temporary reset token (Big companies use this to "unlock" the reset page)
          resetToken = Math.random().toString(36).substring(2, 15);
          user.resetToken = resetToken;
          user.resetTokenExpiry = Date.now() + 600000; // 10 minutes to finish the password change

          user.otpCode = null; // Clear OTP after use

          _context2.next = 15;
          return regeneratorRuntime.awrap(user.save());

        case 15:
          return _context2.abrupt("return", {
            success: true,
            token: resetToken
          });

        case 18:
          _context2.prev = 18;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", {
            success: false,
            error: "Verification failed."
          });

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 18]]);
}
/**
 * STEP 3: Final Password Update
 */


function updatePasswordAction(token, newPassword) {
  var user;
  return regeneratorRuntime.async(function updatePasswordAction$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            resetToken: token,
            resetTokenExpiry: {
              $gt: Date.now()
            }
          }));

        case 5:
          user = _context3.sent;

          if (user) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", {
            success: false,
            error: "Session expired. Please restart."
          });

        case 8:
          user.password = newPassword; // Hashing happens in user model pre-save hook

          user.resetToken = null;
          user.resetTokenExpiry = null;
          _context3.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          return _context3.abrupt("return", {
            success: true
          });

        case 16:
          _context3.prev = 16;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", {
            success: false,
            error: "Update failed."
          });

        case 19:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 16]]);
}