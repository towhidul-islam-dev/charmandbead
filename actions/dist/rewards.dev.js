"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMyRewards = getMyRewards;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _RewardHistory = _interopRequireDefault(require("@/models/RewardHistory"));

var _nextAuth = require("next-auth");

var _route = require("@/app/api/auth/[...nextauth]/route");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Adjust based on your auth (e.g., Kinde, Clerk, or NextAuth)
function getMyRewards() {
  var session, rewards;
  return regeneratorRuntime.async(function getMyRewards$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap((0, _nextAuth.getServerSession)(_route.authOptions));

        case 5:
          session = _context.sent;

          if (!(!session || !session.user)) {
            _context.next = 8;
            break;
          }

          throw new Error("Unauthorized");

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(_RewardHistory["default"].find({
            userId: session.user.id
          }).sort({
            createdAt: -1
          }).lean());

        case 10:
          rewards = _context.sent;
          return _context.abrupt("return", JSON.parse(JSON.stringify(rewards)));

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error("Reward fetch error:", _context.t0);
          return _context.abrupt("return", []);

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}