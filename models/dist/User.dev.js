"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var UserSchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Must use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  phone: {
    type: String,
    "default": ""
  },
  role: {
    type: String,
    "enum": ['user', 'admin'],
    "default": 'user'
  },
  // 🟢 PASSWORD RESET FIELDS
  resetToken: {
    type: String,
    "default": null
  },
  resetTokenExpiry: {
    type: Date,
    "default": null
  },
  // 🟢 2FA / OTP FIELDS
  otpCode: {
    type: String,
    "default": null
  },
  otpExpiry: {
    type: Date,
    "default": null
  },
  wishlist: [{
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Product'
  }],
  addresses: [{
    label: String,
    fullName: String,
    phone: String,
    street: String,
    city: String,
    isDefault: {
      type: Boolean,
      "default": false
    }
  }],
  image: {
    type: String,
    "default": ""
  },
  imagePublicId: {
    type: String,
    "default": ""
  },
  isVIP: {
    type: Boolean,
    "default": false
  },
  vipDiscount: {
    type: Number,
    "default": 5
  }
}, {
  timestamps: true
}); // Pre-save hook (already correct in your code)

UserSchema.pre('save', function _callee() {
  var salt;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified('password')) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return");

        case 2:
          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(_bcryptjs["default"].genSalt(10));

        case 5:
          salt = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(this.password, salt));

        case 8:
          this.password = _context.sent;
          _context.next = 14;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](2);
          throw _context.t0;

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[2, 11]]);
});

UserSchema.methods.comparePassword = function _callee2(candidatePassword) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (this.password) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", false);

        case 2:
          _context2.next = 4;
          return regeneratorRuntime.awrap(_bcryptjs["default"].compare(candidatePassword, this.password));

        case 4:
          return _context2.abrupt("return", _context2.sent);

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};

var User = _mongoose["default"].models.User || _mongoose["default"].model('User', UserSchema);

var _default = User;
exports["default"] = _default;