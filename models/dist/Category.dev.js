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
    required: [true, "Category name is required"],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  parentId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Category',
    "default": null
  },
  image: {
    type: String
  } // Added this so your Category Manager can display icons/images

}, {
  timestamps: true
}); // 🟢 Pre-save middleware to auto-generate slug from name

CategorySchema.pre('validate', function (next) {
  if (this.isModified('name')) {
    // 🟢 Trigger whenever the name changes
    this.slug = this.name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  }

  next();
});

var _default = _mongoose["default"].models.Category || _mongoose["default"].model("Category", CategorySchema);

exports["default"] = _default;