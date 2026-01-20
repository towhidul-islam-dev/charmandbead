"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.auth = exports.authOptions = void 0;

var _nextAuth = _interopRequireDefault(require("next-auth"));

var _google = _interopRequireDefault(require("next-auth/providers/google"));

var _next = require("next-auth/next");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _User = _interopRequireDefault(require("@/models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var SUPER_ADMIN_EMAILS = ["towhidulislam12@gmail.com", "dev@admin.com"];
var authOptions = {
  providers: [(0, _google["default"])({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  })],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    signIn: function signIn(_ref) {
      var user, existingUser;
      return regeneratorRuntime.async(function signIn$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              user = _ref.user;
              _context.prev = 1;
              _context.next = 4;
              return regeneratorRuntime.awrap((0, _mongodb["default"])());

            case 4:
              _context.next = 6;
              return regeneratorRuntime.awrap(_User["default"].findOne({
                email: user.email
              }));

            case 6:
              existingUser = _context.sent;

              if (existingUser) {
                _context.next = 10;
                break;
              }

              _context.next = 10;
              return regeneratorRuntime.awrap(_User["default"].create({
                name: user.name,
                email: user.email,
                image: user.image,
                role: SUPER_ADMIN_EMAILS.includes(user.email) ? "admin" : "user"
              }));

            case 10:
              return _context.abrupt("return", true);

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](1);
              return _context.abrupt("return", false);

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, null, null, [[1, 13]]);
    },
    jwt: function jwt(_ref2) {
      var token, trigger, session, user, dbUser;
      return regeneratorRuntime.async(function jwt$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              token = _ref2.token, trigger = _ref2.trigger, session = _ref2.session, user = _ref2.user;
              _context2.prev = 1;
              _context2.next = 4;
              return regeneratorRuntime.awrap((0, _mongodb["default"])());

            case 4:
              if (!user) {
                _context2.next = 9;
                break;
              }

              _context2.next = 7;
              return regeneratorRuntime.awrap(_User["default"].findOne({
                email: user.email
              }).lean());

            case 7:
              dbUser = _context2.sent;

              if (dbUser) {
                token.role = SUPER_ADMIN_EMAILS.includes(dbUser.email) ? "admin" : dbUser.role || "user";
                token.sub = dbUser._id.toString();
                token.picture = dbUser.image;
                token.name = dbUser.name;
              }

            case 9:
              // 🟢 HANDLE REAL-TIME UPDATES FROM CLIENT
              if (trigger === "update" && session) {
                if (session.image) token.picture = session.image;
                if (session.name) token.name = session.name;
              }

              _context2.next = 15;
              break;

            case 12:
              _context2.prev = 12;
              _context2.t0 = _context2["catch"](1);
              console.error("JWT Error:", _context2.t0);

            case 15:
              return _context2.abrupt("return", token);

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, null, null, [[1, 12]]);
    },
    session: function session(_ref3) {
      var _session, token;

      return regeneratorRuntime.async(function session$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _session = _ref3.session, token = _ref3.token;

              if (_session.user) {
                _session.user.id = token.sub;
                _session.user.role = token.role;
                _session.user.image = token.picture; // Synchronizes Navbar image

                _session.user.name = token.name; // Synchronizes Navbar name
              }

              return _context3.abrupt("return", _session);

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      });
    }
  },
  pages: {
    signIn: '/login'
  }
};
exports.authOptions = authOptions;

var auth = function auth() {
  return (0, _next.getServerSession)(authOptions);
};

exports.auth = auth;

var _default = (0, _nextAuth["default"])(authOptions);

exports["default"] = _default;