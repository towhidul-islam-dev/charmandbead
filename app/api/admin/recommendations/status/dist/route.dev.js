"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PATCH = PATCH;

var _dbConnect = _interopRequireDefault(require("@/lib/dbConnect"));

var _Recommendation = _interopRequireDefault(require("@/models/Recommendation"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function PATCH(req) {
  var _ref, id, status, updated;

  return regeneratorRuntime.async(function PATCH$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(req.json());

        case 3:
          _ref = _context.sent;
          id = _ref.id;
          status = _ref.status;
          _context.next = 8;
          return regeneratorRuntime.awrap((0, _dbConnect["default"])());

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(_Recommendation["default"].findByIdAndUpdate(id, {
            status: status
          }, {
            "new": true
          }));

        case 10:
          updated = _context.sent;
          return _context.abrupt("return", Response.json(updated));

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", Response.json({
            error: "Failed to update status"
          }, {
            status: 500
          }));

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}