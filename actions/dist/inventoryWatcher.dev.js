"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkLowStock = checkLowStock;
exports.updateInventoryStock = updateInventoryStock;
exports.processOrderStock = processOrderStock;
exports.getInventoryHistory = getInventoryHistory;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _NotifyMe = _interopRequireDefault(require("@/models/NotifyMe"));

var _Order = _interopRequireDefault(require("@/models/Order"));

var _mail = require("@/lib/mail");

var _cache = require("next/cache");

var _InventoryLog = _interopRequireDefault(require("@/models/InventoryLog"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// ⬅️ ADDED THIS IMPORT

/**
 * 1. THE WATCHER (Sale Trigger)
 */
function checkLowStock(product, variant) {
  var currentStock, moq, threshold;
  return regeneratorRuntime.async(function checkLowStock$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          currentStock = variant.stock;
          moq = variant.minOrderQuantity || product.minOrderQuantity || 1;
          threshold = moq * 2;

          if (!(currentStock <= threshold && currentStock > 0)) {
            _context.next = 7;
            break;
          }

          console.log("\u26A0\uFE0F Low stock detected: ".concat(product.name, " (").concat(variant.color, ")"));
          _context.next = 7;
          return regeneratorRuntime.awrap((0, _mail.sendAdminLowStockAlert)(product.name, "".concat(variant.color, "-").concat(variant.size), currentStock, moq));

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
}
/**
 * 2. THE REFILLER (Admin Trigger)
 */


function updateInventoryStock(productId, variantId, newStockAmount) {
  var adminEmail,
      currentProduct,
      variant,
      oldStock,
      stockDifference,
      variantKey,
      updatedProduct,
      moq,
      notifiedCount,
      waitingUsers,
      _args3 = arguments;
  return regeneratorRuntime.async(function updateInventoryStock$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          adminEmail = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : "Admin";
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(_Product["default"].findById(productId));

        case 6:
          currentProduct = _context3.sent;

          if (currentProduct) {
            _context3.next = 9;
            break;
          }

          return _context3.abrupt("return", {
            success: false,
            message: "Product not found"
          });

        case 9:
          variant = currentProduct.variants.id(variantId);
          oldStock = variant.stock;
          stockDifference = Number(newStockAmount) - oldStock;
          variantKey = "".concat(variant.color, "-").concat(variant.size); // 2. Perform the Update

          _context3.next = 15;
          return regeneratorRuntime.awrap(_Product["default"].findOneAndUpdate({
            _id: productId,
            "variants._id": variantId
          }, {
            $set: {
              "variants.$.stock": Number(newStockAmount)
            }
          }, {
            "new": true
          }));

        case 15:
          updatedProduct = _context3.sent;
          _context3.next = 18;
          return regeneratorRuntime.awrap(_InventoryLog["default"].create({
            productId: productId,
            productName: updatedProduct.name,
            variantKey: variantKey,
            change: stockDifference,
            reason: 'Restock',
            performedBy: adminEmail // Pass the current user's email here if available

          }));

        case 18:
          // 4. BACK-IN-STOCK NOTIFICATIONS
          moq = variant.minOrderQuantity || updatedProduct.minOrderQuantity || 1;
          notifiedCount = 0;

          if (!(Number(newStockAmount) >= moq)) {
            _context3.next = 28;
            break;
          }

          _context3.next = 23;
          return regeneratorRuntime.awrap(_NotifyMe["default"].find({
            productId: productId,
            variantKey: variantKey,
            status: "Pending"
          }));

        case 23:
          waitingUsers = _context3.sent;

          if (!(waitingUsers.length > 0)) {
            _context3.next = 28;
            break;
          }

          notifiedCount = waitingUsers.length;
          _context3.next = 28;
          return regeneratorRuntime.awrap(Promise.all(waitingUsers.map(function _callee(request) {
            return regeneratorRuntime.async(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap((0, _mail.sendStockEmail)(request.email, updatedProduct.name, variantKey, productId));

                  case 2:
                    request.status = "Notified";
                    _context2.next = 5;
                    return regeneratorRuntime.awrap(request.save());

                  case 5:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          })));

        case 28:
          (0, _cache.revalidatePath)("/product/".concat(productId));
          (0, _cache.revalidatePath)("/admin/products");
          return _context3.abrupt("return", {
            success: true,
            notifiedCount: notifiedCount,
            change: stockDifference
          });

        case 33:
          _context3.prev = 33;
          _context3.t0 = _context3["catch"](1);
          console.error("STOCK_UPDATE_ERROR:", _context3.t0);
          return _context3.abrupt("return", {
            success: false,
            message: "Failed to update stock"
          });

        case 37:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 33]]);
}
/**
 * 3. ORDER PROCESSOR (Checkout Trigger)
 */


function processOrderStock(order) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, _ret;

  return regeneratorRuntime.async(function processOrderStock$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context5.prev = 6;

          _loop = function _loop() {
            var item, product, updatedProduct, variant;
            return regeneratorRuntime.async(function _loop$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    item = _step.value;
                    _context4.next = 3;
                    return regeneratorRuntime.awrap(_Product["default"].findById(item.productId));

                  case 3:
                    product = _context4.sent;

                    if (product) {
                      _context4.next = 6;
                      break;
                    }

                    return _context4.abrupt("return", "continue");

                  case 6:
                    _context4.next = 8;
                    return regeneratorRuntime.awrap(_Product["default"].findOneAndUpdate({
                      _id: item.productId,
                      "variants.color": item.color,
                      "variants.size": item.size
                    }, {
                      $inc: {
                        "variants.$.stock": -item.quantity
                      }
                    }, {
                      "new": true
                    }));

                  case 8:
                    updatedProduct = _context4.sent;

                    if (!updatedProduct) {
                      _context4.next = 15;
                      break;
                    }

                    variant = updatedProduct.variants.find(function (v) {
                      return v.color === item.color && v.size === item.size;
                    }); // 3. 🟢 RECORD THE LOG (Sale)
                    // This tracks the deduction in your history log

                    _context4.next = 13;
                    return regeneratorRuntime.awrap(_InventoryLog["default"].create({
                      productId: item.productId,
                      productName: updatedProduct.name,
                      variantKey: "".concat(item.color, "-").concat(item.size),
                      change: -item.quantity,
                      // Negative number representing stock removal
                      reason: 'Sale',
                      performedBy: "Order #".concat(order._id.slice(-6).toUpperCase()) // Ties the log to a specific order

                    }));

                  case 13:
                    _context4.next = 15;
                    return regeneratorRuntime.awrap(checkLowStock(updatedProduct, variant));

                  case 15:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          };

          _iterator = order.items[Symbol.iterator]();

        case 9:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context5.next = 18;
            break;
          }

          _context5.next = 12;
          return regeneratorRuntime.awrap(_loop());

        case 12:
          _ret = _context5.sent;

          if (!(_ret === "continue")) {
            _context5.next = 15;
            break;
          }

          return _context5.abrupt("continue", 15);

        case 15:
          _iteratorNormalCompletion = true;
          _context5.next = 9;
          break;

        case 18:
          _context5.next = 24;
          break;

        case 20:
          _context5.prev = 20;
          _context5.t0 = _context5["catch"](6);
          _didIteratorError = true;
          _iteratorError = _context5.t0;

        case 24:
          _context5.prev = 24;
          _context5.prev = 25;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 27:
          _context5.prev = 27;

          if (!_didIteratorError) {
            _context5.next = 30;
            break;
          }

          throw _iteratorError;

        case 30:
          return _context5.finish(27);

        case 31:
          return _context5.finish(24);

        case 32:
          _context5.next = 34;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(order._id, {
            stockProcessed: true
          }));

        case 34:
          (0, _cache.revalidatePath)("/admin/products");
          return _context5.abrupt("return", {
            success: true
          });

        case 38:
          _context5.prev = 38;
          _context5.t1 = _context5["catch"](0);
          console.error("FAILED_TO_PROCESS_STOCK:", _context5.t1);
          return _context5.abrupt("return", {
            success: false
          });

        case 42:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 38], [6, 20, 24, 32], [25,, 27, 31]]);
}

function getInventoryHistory(productId) {
  var logs;
  return regeneratorRuntime.async(function getInventoryHistory$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context6.next = 5;
          return regeneratorRuntime.awrap(_InventoryLog["default"].find({
            productId: productId
          }).sort({
            createdAt: -1
          }) // Newest first
          .limit(10));

        case 5:
          logs = _context6.sent;
          return _context6.abrupt("return", {
            success: true,
            logs: JSON.parse(JSON.stringify(logs))
          });

        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          return _context6.abrupt("return", {
            success: false,
            logs: []
          });

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 9]]);
}