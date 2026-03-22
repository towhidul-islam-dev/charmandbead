"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Policy = exports.FAQ = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// FAQ Schema: Remains the same
var FAQSchema = new _mongoose["default"].Schema({
  question_en: {
    type: String,
    required: true
  },
  question_bn: {
    type: String,
    required: true
  },
  answer_en: {
    type: String,
    required: true
  },
  answer_bn: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    "default": 0
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
}); // Policy & Terms Schema: UPDATED (FAQ-style logic)

var PolicySchema = new _mongoose["default"].Schema({
  type: {
    type: String,
    required: true
  },
  content_en: {
    type: String,
    "default": "" // 🟢 Changed from 'required: true' to 'default: ""'

  },
  content_bn: {
    type: String,
    "default": "" // 🟢 This allows you to save even if a tab is empty

  },
  updatedAt: {
    type: Date,
    "default": Date.now
  }
});

var FAQ = _mongoose["default"].models.FAQ || _mongoose["default"].model('FAQ', FAQSchema);

exports.FAQ = FAQ;

var Policy = _mongoose["default"].models.Policy || _mongoose["default"].model('Policy', PolicySchema);

exports.Policy = Policy;