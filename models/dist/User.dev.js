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
    // 💡 Added: Ensures email is always stored in lowercase
    trim: true,
    // 💡 Added: Removes accidental spaces
    match: [/.+@.+\..+/, 'Must use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false // 💡 Correct: This hides password from normal API responses

  },
  role: {
    type: String,
    "enum": ['user', 'admin'],
    "default": 'user'
  },
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
}); // PRE-SAVE HOOK: Hash the password

UserSchema.pre('save', function _callee(next) {
  var salt;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified('password')) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

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
          next();
          _context.next = 15;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](2);
          next(_context.t0);

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[2, 12]]);
}); // Method to compare passwords

UserSchema.methods.comparePassword = function _callee2(candidatePassword) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (this.password) {
            _context2.next = 2;
            break;
          }

          throw new Error("Password field not selected in query");

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

var _default = _mongoose["default"].models.User || _mongoose["default"].model('User', UserSchema);

exports["default"] = _default;