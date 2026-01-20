"use strict";
'use server';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDashboardStats = getDashboardStats;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Order = _interopRequireDefault(require("@/models/Order"));

var _User = _interopRequireDefault(require("@/models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getDashboardStats() {
  var revenueData, totalRevenue, activeOrdersCount, totalUsers, conversionRate;
  return regeneratorRuntime.async(function getDashboardStats$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].aggregate([{
            $match: {
              status: {
                $ne: "Cancelled"
              }
            }
          }, {
            $group: {
              _id: null,
              total: {
                $sum: "$totalAmount"
              }
            }
          }]));

        case 5:
          revenueData = _context.sent;
          totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0; // 2. Active Orders (Pending, Processing, or Shipped)

          _context.next = 9;
          return regeneratorRuntime.awrap(_Order["default"].countDocuments({
            status: {
              $in: ["Pending", "Processing", "Shipped"]
            }
          }));

        case 9:
          activeOrdersCount = _context.sent;
          _context.next = 12;
          return regeneratorRuntime.awrap(_User["default"].countDocuments());

        case 12:
          totalUsers = _context.sent;
          // 4. Conversion Rate (Placeholder calculation or actual logic)
          // Example: (Total Orders / Unique Website Visits) - Requires a separate tracking model
          conversionRate = 3.2;
          return _context.abrupt("return", {
            success: true,
            stats: {
              totalRevenue: totalRevenue,
              activeOrders: activeOrdersCount,
              totalUsers: totalUsers,
              conversionRate: conversionRate
            }
          });

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](0);
          console.error("Stats Error:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            error: _context.t0.message
          });

        case 21:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 17]]);
}