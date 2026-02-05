"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateResetToken = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var generateResetToken = function generateResetToken() {
  return _crypto["default"].randomBytes(32).toString("hex");
};

exports.generateResetToken = generateResetToken;