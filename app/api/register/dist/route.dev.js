"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _User = _interopRequireDefault(require("@/models/User"));

var _server = require("next/server");

var _resend = require("resend");

var _Notification = _interopRequireDefault(require("@/models/Notification"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var resend = new _resend.Resend(process.env.RESEND_API_KEY);

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
          name = body.name, email = body.email, password = body.password; // 1. Enhanced Validation

          if (!(!name || !email || !password)) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: "Please fill in all fields."
          }, {
            status: 400
          }));

        case 9:
          if (!(password.length < 8)) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: "Password must be at least 8 characters."
          }, {
            status: 400
          }));

        case 11:
          cleanEmail = email.toLowerCase().trim(); // 2. Check for existing user

          _context.next = 14;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: cleanEmail
          }));

        case 14:
          existingUser = _context.sent;

          if (!existingUser) {
            _context.next = 17;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: "This email is already registered."
          }, {
            status: 409
          }));

        case 17:
          _context.next = 19;
          return regeneratorRuntime.awrap(_User["default"].create({
            name: name.trim(),
            email: cleanEmail,
            password: password,
            role: "user" // Explicitly set default role

          }));

        case 19:
          newUser = _context.sent;
          _context.prev = 20;
          _context.next = 23;
          return regeneratorRuntime.awrap(_Notification["default"].create({
            title: "New Partner Joined",
            message: "".concat(name, " (").concat(cleanEmail, ") just registered for wholesale access."),
            type: "REGISTRATION"
          }));

        case 23:
          _context.next = 28;
          break;

        case 25:
          _context.prev = 25;
          _context.t0 = _context["catch"](20);
          console.error("NOTIFICATION_DB_ERROR:", _context.t0);

        case 28:
          _context.prev = 28;
          _context.next = 31;
          return regeneratorRuntime.awrap(resend.emails.send({
            from: "Charm & Bead Registry <onboarding@resend.dev>",
            to: ["towhidulislam12@gmail.com"],
            // Using your super admin email
            subject: "New Partner Registration: " + name.trim(),
            html: "\n          <div style=\"font-family: sans-serif; border: 1px solid #FBB6E6; border-radius: 30px; padding: 40px; max-width: 500px; margin: auto;\">\n            <h2 style=\"color: #3E442B; font-style: italic;\">New <span style=\"color: #EA638C;\">Wholesale</span> Lead</h2>\n            <p style=\"font-size: 14px; color: #3E442B;\">A new partner has registered on the <strong>Charm & Bead Registry</strong>.</p>\n            \n            <div style=\"background: #FAFAFA; padding: 20px; border-radius: 15px; border-left: 5px solid #EA638C; margin: 20px 0;\">\n              <p style=\"margin: 5px 0;\"><strong>Name:</strong> ".concat(name.trim(), "</p>\n              <p style=\"margin: 5px 0;\"><strong>Email:</strong> ").concat(cleanEmail, "</p>\n              <p style=\"margin: 5px 0;\"><strong>Date:</strong> ").concat(new Date().toLocaleDateString(), "</p>\n            </div>\n            \n            <p style=\"font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;\">Manage permissions in the admin dashboard.</p>\n          </div>\n        ")
          }));

        case 31:
          _context.next = 36;
          break;

        case 33:
          _context.prev = 33;
          _context.t1 = _context["catch"](28);
          console.error("ADMIN_NOTIFY_ERROR:", _context.t1);

        case 36:
          return _context.abrupt("return", _server.NextResponse.json({
            message: "Account created successfully!",
            user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email
            }
          }, {
            status: 201
          }));

        case 39:
          _context.prev = 39;
          _context.t2 = _context["catch"](0);
          console.error("CRITICAL_REGISTRATION_ERROR:", _context.t2);
          return _context.abrupt("return", _server.NextResponse.json({
            message: "An unexpected error occurred."
          }, {
            status: 500
          }));

        case 43:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 39], [20, 25], [28, 33]]);
}