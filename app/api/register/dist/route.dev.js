"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _User = _interopRequireDefault(require("@/models/User"));

var _server = require("next/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function POST(request) {
  var body, name, email, password, cleanEmail, existingUser, newUser;
  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(request.json());

        case 5:
          body = _context.sent;
          name = body.name, email = body.email, password = body.password; // Validation

          if (!(!name || !email || !password)) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: 'All fields are required.'
          }, {
            status: 400
          }));

        case 9:
          cleanEmail = email.toLowerCase().trim(); // Check if user exists

          _context.next = 12;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: cleanEmail
          }));

        case 12:
          existingUser = _context.sent;

          if (!existingUser) {
            _context.next = 15;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: 'Email already in use.'
          }, {
            status: 409
          }));

        case 15:
          _context.next = 17;
          return regeneratorRuntime.awrap(_User["default"].create({
            name: name.trim(),
            email: cleanEmail,
            password: password
          }));

        case 17:
          newUser = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json({
            message: 'Registration successful!',
            user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email
            }
          }, {
            status: 201
          }));

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](0);
          console.error("CRITICAL_REGISTRATION_ERROR:", _context.t0); // Specific MongoDB Error Handling

          if (!(_context.t0.name === 'MongoServerError' && _context.t0.code === 11000)) {
            _context.next = 26;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: 'Email already exists in database.'
          }, {
            status: 409
          }));

        case 26:
          return _context.abrupt("return", _server.NextResponse.json({
            message: 'Server Error',
            details: _context.t0.message // 💡 This will show the real error in the browser console

          }, {
            status: 500
          }));

        case 27:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 21]]);
}