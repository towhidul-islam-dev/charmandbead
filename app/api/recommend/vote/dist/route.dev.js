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
  var _ref, id, choice, headerList, ip, forwarded, updateQuery, updated;

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
          choice = _ref.choice;
          _context.next = 8;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap((0, _headers.headers)());

        case 10:
          headerList = _context.sent;
          ip = "127.0.0.1";

          if (typeof headerList.get === 'function') {
            forwarded = headerList.get("x-forwarded-for");
            ip = forwarded ? forwarded.split(',')[0] : "127.0.0.1";
          } // Prepare the update object based on the user's choice


          updateQuery = {
            $push: {
              votedBy: ip
            } // Always track the IP to prevent double-voting

          }; // Only increment "Marks" if they chose 'yes'

          if (choice === 'yes') {
            updateQuery.$inc = {
              votes: 1
            };
          } // Find and Update ONLY if IP is not in votedBy


          _context.next = 17;
          return regeneratorRuntime.awrap(_Recommendation["default"].findOneAndUpdate({
            _id: id,
            votedBy: {
              $ne: ip
            }
          }, updateQuery, {
            "new": true
          }));

        case 17:
          updated = _context.sent;

          if (updated) {
            _context.next = 20;
            break;
          }

          return _context.abrupt("return", new Response(JSON.stringify({
            error: "Identity already verified for this drop!"
          }), {
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }));

        case 20:
          return _context.abrupt("return", Response.json({
            success: true,
            message: choice === 'yes' ? "Mark registered!" : "Drop skipped",
            data: updated
          }));

        case 23:
          _context.prev = 23;
          _context.t0 = _context["catch"](0);
          console.error("VOTE_ERROR:", _context.t0);
          return _context.abrupt("return", Response.json({
            error: "Verification failed"
          }, {
            status: 500
          }));

        case 27:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 23]]);
}