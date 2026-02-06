"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PUT = PUT;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _User = _interopRequireDefault(require("@/models/User"));

var _server = require("next/server");

var _auth = require("@/lib/auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// app/api/users/route.js (Create this new file)
// 💡 Import the utility to check for Admin status
// --- PUT (Update User Role/Promote) ---
function PUT(request) {
  var _verifyAuthToken, currentUser, authError, _ref, userId, newRole, updatedUser;

  return regeneratorRuntime.async(function PUT$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _verifyAuthToken = verifyAuthToken(), currentUser = _verifyAuthToken.user, authError = _verifyAuthToken.error; // 1. Authorization Check: Only an existing Admin can run this update

          if (!(authError || currentUser.role !== 'admin')) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: 'Access denied. You must be an administrator to perform this action.'
          }, {
            status: 403
          }));

        case 3:
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(request.json());

        case 8:
          _ref = _context.sent;
          userId = _ref.userId;
          newRole = _ref.newRole;

          if (!(!userId || !['user', 'admin'].includes(newRole))) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: 'Invalid user ID or role.'
          }, {
            status: 400
          }));

        case 13:
          _context.next = 15;
          return regeneratorRuntime.awrap(_User["default"].findByIdAndUpdate(userId, {
            role: newRole
          }, {
            "new": true,
            runValidators: true
          } // Return the updated doc and run schema validators
          ).select('-password'));

        case 15:
          updatedUser = _context.sent;

          if (updatedUser) {
            _context.next = 18;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            message: 'User not found.'
          }, {
            status: 404
          }));

        case 18:
          return _context.abrupt("return", _server.NextResponse.json({
            message: "User ".concat(updatedUser.email, " role updated to ").concat(newRole, "."),
            user: updatedUser
          }, {
            status: 200
          }));

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](3);
          console.error("User Update Error:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            message: 'An internal server error occurred during the update.',
            details: _context.t0.message
          }, {
            status: 500
          }));

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 21]]);
}