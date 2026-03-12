"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var SystemLogSchema = new _mongoose["default"].Schema({
  key: {
    type: String,
    unique: true
  },
  // e.g., "last_smart_merge"
  value: String,
  // The ISO timestamp
  details: String // e.g., "Merged 5 items"

});

var _default = _mongoose["default"].models.SystemLog || _mongoose["default"].model("SystemLog", SystemLogSchema);

exports["default"] = _default;