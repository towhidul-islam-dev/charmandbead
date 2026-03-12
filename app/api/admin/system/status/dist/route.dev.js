"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.dynamic = void 0;

var _server = require("next/server");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _SystemLog = _interopRequireDefault(require("@/models/SystemLog"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Set dynamic to 'force-dynamic' so Next.js doesn't cache the timestamp
var dynamic = 'force-dynamic';
exports.dynamic = dynamic;

function GET() {
  var log;
  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_SystemLog["default"].findOne({
            key: "last_smart_merge"
          }));

        case 5:
          log = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            lastSync: log ? log.value : null,
            details: log ? log.details : "No merges recorded yet."
          }, {
            headers: {
              'Cache-Control': 'no-store, max-age=0'
            }
          }));

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.error("System Status Error:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            error: "Failed to fetch system status"
          }, {
            status: 500
          }));

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
}