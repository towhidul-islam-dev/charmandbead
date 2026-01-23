"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveGift = saveGift;
exports.toggleGiftStatus = toggleGiftStatus;
exports.deleteGift = deleteGift;
exports.generateManualGift = generateManualGift;
exports.rollForGift = rollForGift;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Surprise = _interopRequireDefault(require("@/models/Surprise"));

var _cache = require("next/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// CREATE OR UPDATE GIFT
function saveGift(data) {
  return regeneratorRuntime.async(function saveGift$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          if (!data._id) {
            _context.next = 8;
            break;
          }

          _context.next = 6;
          return regeneratorRuntime.awrap(_Surprise["default"].findByIdAndUpdate(data._id, data));

        case 6:
          _context.next = 10;
          break;

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(_Surprise["default"].create(data));

        case 10:
          (0, _cache.revalidatePath)("/admin/gifts");
          return _context.abrupt("return", {
            success: true,
            message: "Gift registry updated!"
          });

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", {
            success: false,
            message: _context.t0.message
          });

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
} // TOGGLE ACTIVE STATUS


function toggleGiftStatus(id) {
  var gift;
  return regeneratorRuntime.async(function toggleGiftStatus$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(_Surprise["default"].findById(id));

        case 5:
          gift = _context2.sent;
          gift.isActive = !gift.isActive;
          _context2.next = 9;
          return regeneratorRuntime.awrap(gift.save());

        case 9:
          (0, _cache.revalidatePath)("/admin/gifts");
          return _context2.abrupt("return", {
            success: true
          });

        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", {
            success: false
          });

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 13]]);
} // DELETE GIFT


function deleteGift(id) {
  return regeneratorRuntime.async(function deleteGift$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(_Surprise["default"].findByIdAndDelete(id));

        case 5:
          (0, _cache.revalidatePath)("/admin/gifts");
          return _context3.abrupt("return", {
            success: true
          });

        case 9:
          _context3.prev = 9;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", {
            success: false
          });

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 9]]);
} // --- NEW: MANUAL OVERRIDE ACTION ---


function generateManualGift(giftId) {
  var gift;
  return regeneratorRuntime.async(function generateManualGift$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(_Surprise["default"].findById(giftId));

        case 5:
          gift = _context4.sent;

          if (gift) {
            _context4.next = 8;
            break;
          }

          throw new Error("Gift not found in registry");

        case 8:
          _context4.next = 10;
          return regeneratorRuntime.awrap(_Surprise["default"].findByIdAndUpdate(giftId, {
            $inc: {
              usageCount: 1
            }
          }));

        case 10:
          (0, _cache.revalidatePath)("/admin/gifts"); // Update usage counts on the dashboard

          return _context4.abrupt("return", {
            success: true,
            gift: JSON.parse(JSON.stringify(gift)),
            generatedAt: new Date().toISOString()
          });

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", {
            success: false,
            message: _context4.t0.message
          });

        case 17:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 14]]);
} // THE "WINNING" LOGIC FOR CUSTOMERS


function rollForGift(orderTotal) {
  var activeGifts, random, cumulative, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, gift;

  return regeneratorRuntime.async(function rollForGift$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context5.next = 5;
          return regeneratorRuntime.awrap(_Surprise["default"].find({
            isActive: true,
            minPurchase: {
              $lte: orderTotal
            }
          }).lean());

        case 5:
          activeGifts = _context5.sent;

          if (activeGifts.length) {
            _context5.next = 8;
            break;
          }

          return _context5.abrupt("return", null);

        case 8:
          random = Math.random() * 100;
          cumulative = 0;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context5.prev = 13;
          _iterator = activeGifts[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context5.next = 25;
            break;
          }

          gift = _step.value;
          cumulative += gift.probability;

          if (!(random <= cumulative)) {
            _context5.next = 22;
            break;
          }

          _context5.next = 21;
          return regeneratorRuntime.awrap(_Surprise["default"].findByIdAndUpdate(gift._id, {
            $inc: {
              usageCount: 1
            }
          }));

        case 21:
          return _context5.abrupt("return", JSON.parse(JSON.stringify(gift)));

        case 22:
          _iteratorNormalCompletion = true;
          _context5.next = 15;
          break;

        case 25:
          _context5.next = 31;
          break;

        case 27:
          _context5.prev = 27;
          _context5.t0 = _context5["catch"](13);
          _didIteratorError = true;
          _iteratorError = _context5.t0;

        case 31:
          _context5.prev = 31;
          _context5.prev = 32;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 34:
          _context5.prev = 34;

          if (!_didIteratorError) {
            _context5.next = 37;
            break;
          }

          throw _iteratorError;

        case 37:
          return _context5.finish(34);

        case 38:
          return _context5.finish(31);

        case 39:
          return _context5.abrupt("return", null);

        case 42:
          _context5.prev = 42;
          _context5.t1 = _context5["catch"](0);
          return _context5.abrupt("return", null);

        case 45:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 42], [13, 27, 31, 39], [32,, 34, 38]]);
}