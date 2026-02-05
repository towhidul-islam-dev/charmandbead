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

function updateInventoryStock(productId, variantId, newStockAmount) {
  var adminEmail,
      currentProduct,
      stockDifference,
      variantKey,
      updatedProduct,
      oldStock,
      variant,
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
          stockDifference = 0;
          variantKey = "Standard";
          oldStock = 0; // 🟢 CASE A: The product has variants

          if (!(variantId && variantId !== "undefined")) {
            _context3.next = 26;
            break;
          }

          variant = currentProduct.variants.id(variantId);

          if (variant) {
            _context3.next = 16;
            break;
          }

          return _context3.abrupt("return", {
            success: false,
            message: "Variant not found"
          });

        case 16:
          oldStock = variant.stock;
          stockDifference = Number(newStockAmount) - oldStock;
          variantKey = "".concat(variant.color, "-").concat(variant.size);

          if (!(stockDifference === 0)) {
            _context3.next = 21;
            break;
          }

          return _context3.abrupt("return", {
            success: true,
            notifiedCount: 0
          });

        case 21:
          _context3.next = 23;
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

        case 23:
          updatedProduct = _context3.sent;
          _context3.next = 33;
          break;

        case 26:
          oldStock = currentProduct.stock;
          stockDifference = Number(newStockAmount) - oldStock;

          if (!(stockDifference === 0)) {
            _context3.next = 30;
            break;
          }

          return _context3.abrupt("return", {
            success: true,
            notifiedCount: 0
          });

        case 30:
          _context3.next = 32;
          return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(productId, {
            $inc: {
              stock: stockDifference
            }
          }, {
            "new": true,
            runValidators: true
          }));

        case 32:
          updatedProduct = _context3.sent;

        case 33:
          _context3.next = 35;
          return regeneratorRuntime.awrap(_InventoryLog["default"].create({
            productId: productId,
            productName: updatedProduct.name,
            variantKey: variantKey,
            change: stockDifference,
            reason: stockDifference > 0 ? "Restock" : "Adjustment",
            performedBy: adminEmail
          }));

        case 35:
          // 4. Back-in-stock logic
          notifiedCount = 0;
          moq = updatedProduct.minOrderQuantity || 1;

          if (!(Number(newStockAmount) >= moq && oldStock < moq)) {
            _context3.next = 45;
            break;
          }

          _context3.next = 40;
          return regeneratorRuntime.awrap(_NotifyMe["default"].find({
            productId: productId,
            variantKey: variantKey,
            status: "Pending"
          }));

        case 40:
          waitingUsers = _context3.sent;

          if (!(waitingUsers.length > 0)) {
            _context3.next = 45;
            break;
          }

          notifiedCount = waitingUsers.length;
          _context3.next = 45;
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

        case 45:
          (0, _cache.revalidatePath)("/admin/products");
          return _context3.abrupt("return", {
            success: true,
            notifiedCount: notifiedCount
          });

        case 49:
          _context3.prev = 49;
          _context3.t0 = _context3["catch"](1);
          console.error("RESTOCK_ERROR:", _context3.t0);
          return _context3.abrupt("return", {
            success: false,
            message: _context3.t0.message
          });

        case 53:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 49]]);
}

function processOrderStock(order) {
  var lockResult, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

  return regeneratorRuntime.async(function processOrderStock$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context5.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findOneAndUpdate({
            _id: order._id,
            stockProcessed: {
              $ne: true
            }
          }, {
            $set: {
              stockProcessed: true
            }
          }, {
            "new": true
          }));

        case 5:
          lockResult = _context5.sent;

          if (lockResult) {
            _context5.next = 9;
            break;
          }

          console.log("Order already processed or lock acquired by another process. Skipping.");
          return _context5.abrupt("return", {
            success: true
          });

        case 9:
          // 2. THE DEDUCTION LOGIC: (Your original logic stays here)
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context5.prev = 12;

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
                      variants: {
                        $elemMatch: {
                          color: item.variant.name,
                          size: item.variant.size,
                          stock: {
                            $gte: qtyToDeduct
                          }
                        }
                      }
                    }, {
                      $inc: {
                        "variants.$[v].stock": -qtyToDeduct,
                        stock: -qtyToDeduct
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

        case 15:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context5.next = 21;
            break;
          }

          _context5.next = 18;
          return regeneratorRuntime.awrap(_loop());

        case 18:
          _iteratorNormalCompletion = true;
          _context5.next = 15;
          break;

        case 21:
          _context5.next = 27;
          break;

        case 23:
          _context5.prev = 23;
          _context5.t0 = _context5["catch"](12);
          _didIteratorError = true;
          _iteratorError = _context5.t0;

        case 27:
          _context5.prev = 27;
          _context5.prev = 28;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 30:
          _context5.prev = 30;

          if (!_didIteratorError) {
            _context5.next = 33;
            break;
          }

          throw _iteratorError;

        case 33:
          return _context5.finish(30);

        case 34:
          return _context5.finish(27);

        case 35:
          // No need for the final 'findByIdAndUpdate' anymore because we did it at the top!
          (0, _cache.revalidatePath)("/admin/products");
          return _context5.abrupt("return", {
            success: true
          });

        case 39:
          _context5.prev = 39;
          _context5.t1 = _context5["catch"](0);
          // RECOVERY: If a crash happens mid-process, we unlock the order so it can be retried.
          console.error("FAILED_TO_PROCESS_STOCK:", _context5.t1);
          _context5.next = 44;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(order._id, {
            stockProcessed: false
          }));

        case 44:
          return _context5.abrupt("return", {
            success: false
          });

        case 45:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 39], [12, 23, 27, 35], [28,, 30, 34]]);
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