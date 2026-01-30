"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var VariantSchema = new _mongoose["default"].Schema({
  _id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    auto: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  size: String,
  color: String,
  price: Number,
  stock: {
    type: Number,
    "default": 0,
    min: 0
  },
  // min: 0 prevents logic errors
  imageUrl: String,
  minOrderQuantity: {
    type: Number,
    "default": 1
  }
});
var ProductSchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  subCategory: {
    type: String,
    required: true,
    index: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  // 🟢 Added for non-variant products
  imageUrl: String,
  price: Number,
  stock: {
    type: Number,
    "default": 0,
    min: 0
  },
  minOrderQuantity: {
    type: Number,
    "default": 1
  },
  isNewArrival: {
    type: Boolean,
    "default": false
  },
  hasVariants: {
    type: Boolean,
    "default": false
  },
  variants: [VariantSchema],
  isArchived: {
    type: Boolean,
    "default": false
  }
}, {
  timestamps: true
}); // SKU GENERATOR HELPER

var generateSKU = function generateSKU(name, color, size) {
  var p = name.substring(0, 3).toUpperCase();
  var c = (color || "XX").substring(0, 2).toUpperCase();
  var s = (size || "NA").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return "".concat(p, "-").concat(c, "-").concat(s, "-").concat(Math.floor(100 + Math.random() * 900));
};

ProductSchema.pre('save', function _callee() {
  var _this = this;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Only sync totals if the variants array itself was changed (Admin Edit)
          if (this.isModified('variants') || this.isNew) {
            if (this.hasVariants && this.variants && this.variants.length > 0) {
              this.stock = this.variants.reduce(function (acc, v) {
                return acc + (Number(v.stock) || 0);
              }, 0);
              this.variants.forEach(function (v) {
                if (!v.sku) {
                  v.sku = generateSKU(_this.name, v.color, v.size);
                }
              });
            }
          }

          if (!this.hasVariants && !this.sku) {
            this.sku = generateSKU(this.name, "ST", "ND");
          }

        case 2:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
});

var _default = _mongoose["default"].models.Product || _mongoose["default"].model("Product", ProductSchema);

exports["default"] = _default;