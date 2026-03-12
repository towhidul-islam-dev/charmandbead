"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.dynamic = void 0;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Recommendation = _interopRequireDefault(require("@/models/Recommendation"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Force Next.js to always fetch fresh data, avoiding stale cache
var dynamic = 'force-dynamic';
exports.dynamic = dynamic;

function GET() {
  var topTrends, sanitizedTrends;
  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_Recommendation["default"].find({}).sort({
            votes: -1
          }).limit(10).lean());

        case 5:
          topTrends = _context.sent;
          // .lean() makes the query faster by returning plain JS objects
          // 2. Safety Check: Ensure every item has the expected fields for the UI
          sanitizedTrends = topTrends.map(function (trend) {
            return _objectSpread({}, trend, {
              status: trend.status || "Pending",
              // Fallback so status badges don't break
              votes: trend.votes || 0,
              aiAnalysis: trend.aiAnalysis || {
                category: "Trend",
                style: "New"
              }
            });
          });
          return _context.abrupt("return", Response.json(sanitizedTrends));

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.error("TRENDS_FETCH_ERROR:", _context.t0); // Return an empty array instead of a 500 error to keep the frontend from crashing

          return _context.abrupt("return", Response.json([], {
            status: 500
          }));

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
}