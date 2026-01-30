"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.auditStockConsistency = auditStockConsistency;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _cache = require("next/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function auditStockConsistency() {
  var fixIssues,
      products,
      report,
      _iteratorNormalCompletion,
      _didIteratorError,
      _iteratorError,
      _iterator,
      _step,
      product,
      actualSum,
      statedTotal,
      _args = arguments;

  return regeneratorRuntime.async(function auditStockConsistency$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          fixIssues = _args.length > 0 && _args[0] !== undefined ? _args[0] : false;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(_Product["default"].find({
            hasVariants: true
          }));

        case 6:
          products = _context.sent;
          report = {
            scanned: products.length,
            issuesFound: 0,
            fixed: 0,
            details: []
          };
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 11;
          _iterator = products[Symbol.iterator]();

        case 13:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 28;
            break;
          }

          product = _step.value;
          // 1. Calculate the sum of all variant stocks
          actualSum = product.variants.reduce(function (acc, v) {
            return acc + (Number(v.stock) || 0);
          }, 0);
          statedTotal = product.stock || 0;

          if (!(actualSum !== statedTotal)) {
            _context.next = 25;
            break;
          }

          report.issuesFound++;
          report.details.push({
            id: product._id,
            name: product.name,
            sku: product.sku || "No Main SKU",
            stated: statedTotal,
            actual: actualSum,
            diff: actualSum - statedTotal,
            variantCount: product.variants.length
          });

          if (!fixIssues) {
            _context.next = 25;
            break;
          }

          // 2. Sync using .save() instead of findByIdAndUpdate
          // This triggers your pre('save') hook which handles SKU generation and stock sync
          product.stock = actualSum;
          _context.next = 24;
          return regeneratorRuntime.awrap(product.save());

        case 24:
          report.fixed++;

        case 25:
          _iteratorNormalCompletion = true;
          _context.next = 13;
          break;

        case 28:
          _context.next = 34;
          break;

        case 30:
          _context.prev = 30;
          _context.t0 = _context["catch"](11);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 34:
          _context.prev = 34;
          _context.prev = 35;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 37:
          _context.prev = 37;

          if (!_didIteratorError) {
            _context.next = 40;
            break;
          }

          throw _iteratorError;

        case 40:
          return _context.finish(37);

        case 41:
          return _context.finish(34);

        case 42:
          // Refresh the UI cache if we fixed anything
          if (report.fixed > 0) {
            (0, _cache.revalidatePath)("/admin/products");
            (0, _cache.revalidatePath)("/"); // If you show stock on the home page
          }

          return _context.abrupt("return", {
            success: true,
            report: report
          });

        case 46:
          _context.prev = 46;
          _context.t1 = _context["catch"](1);
          console.error("AUDIT_ERROR:", _context.t1);
          return _context.abrupt("return", {
            success: false,
            message: _context.t1.message
          });

        case 50:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 46], [11, 30, 34, 42], [35,, 37, 41]]);
}