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
            _context.next = 6;
            break;
          }

          _context.next = 6;
          return regeneratorRuntime.awrap((0, _mail.sendAdminLowStockAlert)(product.name, "".concat(variant.color, "-").concat(variant.size), currentStock, moq));

        case 6:
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
      notifiedCount,
      moq,
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
          variantKey = "".concat(variant.color, "-").concat(variant.size);

          if (!(stockDifference === 0)) {
            _context3.next = 15;
            break;
          }

          return _context3.abrupt("return", {
            success: true,
            notifiedCount: 0
          });

        case 15:
          _context3.next = 17;
          return regeneratorRuntime.awrap(_Product["default"].findOneAndUpdate({
            _id: productId
          }, {
            $inc: {
              "variants.$[v].stock": stockDifference,
              stock: stockDifference
            }
          }, {
            arrayFilters: [{
              "v._id": variantId
            }],
            "new": true,
            runValidators: true
          }));

        case 17:
          updatedProduct = _context3.sent;
          _context3.next = 20;
          return regeneratorRuntime.awrap(_InventoryLog["default"].create({
            productId: productId,
            productName: updatedProduct.name,
            variantKey: variantKey,
            change: stockDifference,
            reason: stockDifference > 0 ? "Restock" : "Adjustment",
            performedBy: adminEmail
          }));

        case 20:
          // Back-in-stock logic...
          notifiedCount = 0;
          moq = variant.minOrderQuantity || updatedProduct.minOrderQuantity || 1;

          if (!(Number(newStockAmount) >= moq && oldStock < moq)) {
            _context3.next = 30;
            break;
          }

          _context3.next = 25;
          return regeneratorRuntime.awrap(_NotifyMe["default"].find({
            productId: productId,
            variantKey: variantKey,
            status: "Pending"
          }));

        case 25:
          waitingUsers = _context3.sent;

          if (!(waitingUsers.length > 0)) {
            _context3.next = 30;
            break;
          }

          notifiedCount = waitingUsers.length;
          _context3.next = 30;
          return regeneratorRuntime.awrap(Promise.all(waitingUsers.map(function _callee(req) {
            return regeneratorRuntime.async(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap((0, _mail.sendStockEmail)(req.email, updatedProduct.name, variantKey, productId));

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

        case 30:
          (0, _cache.revalidatePath)("/admin/products");
          return _context3.abrupt("return", {
            success: true,
            notifiedCount: notifiedCount
          });

        case 34:
          _context3.prev = 34;
          _context3.t0 = _context3["catch"](1);
          return _context3.abrupt("return", {
            success: false,
            message: _context3.t0.message
          });

        case 37:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 34]]);
}
/**
 * 3. ORDER PROCESSOR (The Fix for Variant Sync)
 * Using explicit async serialization to ensure each variant is deducted properly.
 */


function processOrderStock(order) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

  return regeneratorRuntime.async(function processOrderStock$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          // 🟢 CRITICAL: We use a standard for loop to ensure "await" 
          // blocks until the DB fully finishes the previous variant.
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context5.prev = 6;

          _loop = function _loop() {
            var item, qtyToDeduct, isVariant, updatedProduct, variant;
            return regeneratorRuntime.async(function _loop$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    item = _step.value;
                    qtyToDeduct = Number(item.quantity);
                    isVariant = item.variant && item.variant.name !== "Default";

                    if (!isVariant) {
                      _context4.next = 15;
                      break;
                    }

                    _context4.next = 6;
                    return regeneratorRuntime.awrap(_Product["default"].findOneAndUpdate({
                      _id: item.product,
                      "variants": {
                        $elemMatch: {
                          color: item.variant.name,
                          size: item.variant.size,
                          stock: {
                            $gte: qtyToDeduct
                          } // 🛑 Prevent negative stock

                        }
                      }
                    }, {
                      $inc: {
                        "variants.$[v].stock": -qtyToDeduct,
                        stock: -qtyToDeduct // Deducts from the main "total" stock too

                      }
                    }, {
                      arrayFilters: [{
                        "v.color": item.variant.name,
                        "v.size": item.variant.size
                      }],
                      "new": true
                    }));

                  case 6:
                    updatedProduct = _context4.sent;

                    if (!updatedProduct) {
                      _context4.next = 13;
                      break;
                    }

                    variant = updatedProduct.variants.find(function (v) {
                      return v.color === item.variant.name && v.size === item.variant.size;
                    });
                    _context4.next = 11;
                    return regeneratorRuntime.awrap(_InventoryLog["default"].create({
                      productId: item.product,
                      productName: updatedProduct.name,
                      variantKey: "".concat(item.variant.name, "-").concat(item.variant.size),
                      change: -qtyToDeduct,
                      reason: "Sale",
                      performedBy: "Order #".concat(order._id.toString().slice(-6).toUpperCase())
                    }));

                  case 11:
                    _context4.next = 13;
                    return regeneratorRuntime.awrap(checkLowStock(updatedProduct, variant));

                  case 13:
                    _context4.next = 17;
                    break;

                  case 15:
                    _context4.next = 17;
                    return regeneratorRuntime.awrap(_Product["default"].findOneAndUpdate({
                      _id: item.product,
                      stock: {
                        $gte: qtyToDeduct
                      }
                    }, {
                      $inc: {
                        stock: -qtyToDeduct
                      }
                    }, {
                      "new": true
                    }));

                  case 17:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          };

          _iterator = order.items[Symbol.iterator]();

        case 9:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context5.next = 15;
            break;
          }

          _context5.next = 12;
          return regeneratorRuntime.awrap(_loop());

        case 12:
          _iteratorNormalCompletion = true;
          _context5.next = 9;
          break;

        case 15:
          _context5.next = 21;
          break;

        case 17:
          _context5.prev = 17;
          _context5.t0 = _context5["catch"](6);
          _didIteratorError = true;
          _iteratorError = _context5.t0;

        case 21:
          _context5.prev = 21;
          _context5.prev = 22;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 24:
          _context5.prev = 24;

          if (!_didIteratorError) {
            _context5.next = 27;
            break;
          }

          throw _iteratorError;

        case 27:
          return _context5.finish(24);

        case 28:
          return _context5.finish(21);

        case 29:
          _context5.next = 31;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(order._id, {
            stockProcessed: true
          }));

        case 31:
          (0, _cache.revalidatePath)("/admin/products");
          return _context5.abrupt("return", {
            success: true
          });

        case 35:
          _context5.prev = 35;
          _context5.t1 = _context5["catch"](0);
          console.error("FAILED_TO_PROCESS_STOCK:", _context5.t1);
          return _context5.abrupt("return", {
            success: false
          });

        case 39:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 35], [6, 17, 21, 29], [22,, 24, 28]]);
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
          }).limit(10));

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