"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var RewardHistorySchema = new _mongoose["default"].Schema({
  userId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Optimized for fast lookups

  },
  giftId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Surprise'
  },
  title: String,
  code: String,
  value: Number,
  discountType: String,
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

var _default = _mongoose["default"].models.RewardHistory || _mongoose["default"].model('RewardHistory', RewardHistorySchema);

exports["default"] = _default;