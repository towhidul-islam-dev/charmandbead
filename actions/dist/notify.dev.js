"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerStockNotification = registerStockNotification;
exports.updateProductStock = updateProductStock;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _NotifyMe = _interopRequireDefault(require("@/models/NotifyMe"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _mail = require("@/lib/mail");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// USER ACTION: Register for notification
function registerStockNotification(data) {
  var existing;
  return regeneratorRuntime.async(function registerStockNotification$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_NotifyMe["default"].findOne({
            email: data.email,
            variantKey: data.variantKey,
            status: "Pending"
          }));

        case 5:
          existing = _context.sent;

          if (!existing) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            message: "Already on the list!"
          });

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(_NotifyMe["default"].create(data));

        case 10:
          return _context.abrupt("return", {
            success: true,
            message: "We'll email you when it's back!"
          });

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", {
            success: false,
            message: "Error saving request"
          });

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
} // ADMIN ACTION: Update stock and trigger emails


function updateProductStock(productId, updatedVariants) {
  var _ret;

  return regeneratorRuntime.async(function updateProductStock$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(function _callee3() {
            var product, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, v, moq;

            return regeneratorRuntime.async(function _callee3$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return regeneratorRuntime.awrap((0, _mongodb["default"])());

                  case 2:
                    _context4.next = 4;
                    return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(productId, {
                      variants: updatedVariants
                    }, {
                      "new": true
                    }));

                  case 4:
                    product = _context4.sent;
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context4.prev = 8;
                    _iterator = product.variants[Symbol.iterator]();

                  case 10:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                      _context4.next = 19;
                      break;
                    }

                    v = _step.value;
                    moq = v.minOrderQuantity || product.minOrderQuantity || 1;

                    if (!(v.stock >= moq)) {
                      _context4.next = 16;
                      break;
                    }

                    _context4.next = 16;
                    return regeneratorRuntime.awrap(function _callee2() {
                      var variantKey, waitingUsers;
                      return regeneratorRuntime.async(function _callee2$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              variantKey = "".concat(v.color, "-").concat(v.size);
                              _context3.next = 3;
                              return regeneratorRuntime.awrap(_NotifyMe["default"].find({
                                productId: productId,
                                variantKey: variantKey,
                                status: "Pending"
                              }));

                            case 3:
                              waitingUsers = _context3.sent;

                              if (!(waitingUsers.length > 0)) {
                                _context3.next = 7;
                                break;
                              }

                              _context3.next = 7;
                              return regeneratorRuntime.awrap(Promise.all(waitingUsers.map(function _callee(req) {
                                return regeneratorRuntime.async(function _callee$(_context2) {
                                  while (1) {
                                    switch (_context2.prev = _context2.next) {
                                      case 0:
                                        _context2.next = 2;
                                        return regeneratorRuntime.awrap((0, _mail.sendStockEmail)(req.email, product.name, variantKey, productId));

                                      case 2:
                                        req.status = "Notified";
                                        _context2.next = 5;
                                        return regeneratorRuntime.awrap(req.save());

                                      case 5:
                                      case "end":
                                        return _context2.stop();
                                    }
                                  }
                                });
                              })));

                            case 7:
                            case "end":
                              return _context3.stop();
                          }
                        }
                      });
                    }());

                  case 16:
                    _iteratorNormalCompletion = true;
                    _context4.next = 10;
                    break;

                  case 19:
                    _context4.next = 25;
                    break;

                  case 21:
                    _context4.prev = 21;
                    _context4.t0 = _context4["catch"](8);
                    _didIteratorError = true;
                    _iteratorError = _context4.t0;

                  case 25:
                    _context4.prev = 25;
                    _context4.prev = 26;

                    if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                      _iterator["return"]();
                    }

                  case 28:
                    _context4.prev = 28;

                    if (!_didIteratorError) {
                      _context4.next = 31;
                      break;
                    }

                    throw _iteratorError;

                  case 31:
                    return _context4.finish(28);

                  case 32:
                    return _context4.finish(25);

                  case 33:
                    return _context4.abrupt("return", {
                      v: {
                        success: true
                      }
                    });

                  case 34:
                  case "end":
                    return _context4.stop();
                }
              }
            }, null, null, [[8, 21, 25, 33], [26,, 28, 32]]);
          }());

        case 3:
          _ret = _context5.sent;

          if (!(_typeof(_ret) === "object")) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", _ret.v);

        case 6:
          _context5.next = 11;
          break;

        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          return _context5.abrupt("return", {
            success: false
          });

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 8]]);
}