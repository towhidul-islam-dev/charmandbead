"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Recommendation = _interopRequireDefault(require("@/models/Recommendation"));

var _headers = require("next/headers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function POST(req) {
  var _ref, id, headerList, ip, updated;

  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(req.json());

        case 3:
          _ref = _context.sent;
          id = _ref.id;
          _context.next = 7;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 7:
          // 1. Get user's IP (Identity)
          headerList = (0, _headers.headers)();
          ip = headerList.get("x-forwarded-for") || "127.0.0.1"; // 2. Find and Update ONLY if IP is not in votedBy
          // $ne means "not equal" - we only proceed if the IP isn't there

          _context.next = 11;
          return regeneratorRuntime.awrap(_Recommendation["default"].findOneAndUpdate({
            _id: id,
            votedBy: {
              $ne: ip
            }
          }, {
            $inc: {
              votes: 1
            },
            $push: {
              votedBy: ip
            }
          }, {
            "new": true
          }));

        case 11:
          updated = _context.sent;

          if (updated) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", Response.json({
            error: "You've already voted for this trend!"
          }, {
            status: 403
          }));

        case 14:
          return _context.abrupt("return", Response.json(updated));

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](0);
          console.error("VOTE_ERROR:", _context.t0);
          return _context.abrupt("return", Response.json({
            error: "Vote failed"
          }, {
            status: 500
          }));

        case 21:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 17]]);
}