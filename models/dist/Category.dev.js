"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var CategorySchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  parentId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Category',
    "default": null
  } // Null means it's a top-level category (e.g., "Beads")

}, {
  timestamps: true
});

var _default = _mongoose["default"].models.Category || _mongoose["default"].model("Category", CategorySchema);

exports["default"] = _default;