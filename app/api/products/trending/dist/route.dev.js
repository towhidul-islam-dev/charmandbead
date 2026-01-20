"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _User = _interopRequireDefault(require("@/models/User"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _server = require("next/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function GET() {
  var trendingData, productIds, products;
  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_User["default"].aggregate([{
            $unwind: "$wishlist"
          }, // Flatten the wishlist arrays from all users
          {
            $group: {
              _id: "$wishlist",
              count: {
                $sum: 1
              }
            }
          }, // Count occurrences of each ID
          {
            $sort: {
              count: -1
            }
          }, // Sort by most popular
          {
            $limit: 4
          } // Get top 4
          ]));

        case 5:
          trendingData = _context.sent;
          // Extract IDs and fetch full product details
          productIds = trendingData.map(function (item) {
            return item._id;
          });
          _context.next = 9;
          return regeneratorRuntime.awrap(_Product["default"].find({
            _id: {
              $in: productIds
            }
          }));

        case 9:
          products = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json(products));

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", _server.NextResponse.json({
            message: _context.t0.message
          }, {
            status: 500
          }));

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
}