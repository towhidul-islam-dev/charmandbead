"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanupDuplicateLogs = cleanupDuplicateLogs;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _InventoryLog = _interopRequireDefault(require("@/models/InventoryLog"));

var _cache = require("next/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function cleanupDuplicateLogs() {
  var duplicates, deletedCount, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, group, idsToDelete, result;

  return regeneratorRuntime.async(function cleanupDuplicateLogs$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_InventoryLog["default"].aggregate([{
            $group: {
              _id: {
                reason: "$reason",
                sku: "$sku",
                // Groups items created in the same minute to catch the glitch
                time: {
                  $dateToString: {
                    format: "%Y-%m-%d-%H-%M",
                    date: "$createdAt"
                  }
                }
              },
              count: {
                $sum: 1
              },
              ids: {
                $push: "$_id"
              },
              totalMistakenDeduction: {
                $sum: "$change"
              }
            }
          }, {
            $match: {
              count: {
                $gt: 1
              }
            }
          }]));

        case 5:
          duplicates = _context.sent;
          deletedCount = 0;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 10;
          _iterator = duplicates[Symbol.iterator]();

        case 12:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 22;
            break;
          }

          group = _step.value;
          // Keep only the first entry, remove the rest
          idsToDelete = group.ids.slice(1);
          _context.next = 17;
          return regeneratorRuntime.awrap(_InventoryLog["default"].deleteMany({
            _id: {
              $in: idsToDelete
            }
          }));

        case 17:
          result = _context.sent;
          deletedCount += result.deletedCount;

        case 19:
          _iteratorNormalCompletion = true;
          _context.next = 12;
          break;

        case 22:
          _context.next = 28;
          break;

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](10);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 28:
          _context.prev = 28;
          _context.prev = 29;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 31:
          _context.prev = 31;

          if (!_didIteratorError) {
            _context.next = 34;
            break;
          }

          throw _iteratorError;

        case 34:
          return _context.finish(31);

        case 35:
          return _context.finish(28);

        case 36:
          (0, _cache.revalidatePath)("/admin/inventory");
          return _context.abrupt("return", {
            success: true,
            message: "Successfully removed ".concat(deletedCount, " duplicate entries from history.")
          });

        case 40:
          _context.prev = 40;
          _context.t1 = _context["catch"](0);
          console.error("CLEANUP_ERROR:", _context.t1);
          return _context.abrupt("return", {
            success: false,
            message: _context.t1.message
          });

        case 44:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 40], [10, 24, 28, 36], [29,, 31, 35]]);
}