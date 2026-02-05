"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;

var _server = require("next/server");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import { dbConnect } from "@/lib/db"; // Adjust this based on your Prisma/DB setup
function GET() {
  var totalOrders, districts;
  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(_mongodb["default"].order.count({
            where: {
              status: "COMPLETED"
            }
          }));

        case 3:
          totalOrders = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(db.order.findMany({
            where: {
              status: "COMPLETED"
            },
            select: {
              district: true
            },
            distinct: ["district"]
          }));

        case 6:
          districts = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json({
            totalOrders: totalOrders || 0,
            activeStates: districts.length || 0,
            establishedYear: 2026 // 👈 Update this value to your new year

          }, {
            status: 200
          }));

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.error("Failed to fetch live stats:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            error: "Internal Server Error"
          }, {
            status: 500
          }));

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
}