"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateOTP = exports.generateResetToken = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Generates a 64-character secure hex string for legacy/fallback links
 */
var generateResetToken = function generateResetToken() {
  return _crypto["default"].randomBytes(32).toString("hex");
};
/**
 * Generates a 6-digit numeric code for 2FA/Password Reset
 * This is the function the build is looking for!
 */


exports.generateResetToken = generateResetToken;

var generateOTP = function generateOTP() {
  // Generates a cryptographically strong random number between 100000 and 999999
  return _crypto["default"].randomInt(100000, 999999).toString();
};

exports.generateOTP = generateOTP;