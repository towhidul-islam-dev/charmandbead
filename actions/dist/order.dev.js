"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAdjacentOrderIds = getAdjacentOrderIds;
exports.getNewOrdersCount = getNewOrdersCount;
exports.createOrder = createOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.getOrderById = getOrderById;
exports.getUserOrders = getUserOrders;
exports.getAllOrders = getAllOrders;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Order = _interopRequireDefault(require("@/models/Order"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _cache = require("next/cache");

var _mail = require("@/lib/mail");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * GET ADJACENT ORDER IDs
 * Used for navigation inside the Order Details page.
 */
function getAdjacentOrderIds(userId, currentOrderId) {
  var allOrders, currentIndex;
  return regeneratorRuntime.async(function getAdjacentOrderIds$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].find({
            user: userId
          }).sort({
            createdAt: -1
          }).select("_id").lean());

        case 5:
          allOrders = _context.sent;
          currentIndex = allOrders.findIndex(function (o) {
            return o._id.toString() === currentOrderId;
          });
          return _context.abrupt("return", {
            prev: currentIndex > 0 ? allOrders[currentIndex - 1]._id.toString() : null,
            next: currentIndex < allOrders.length - 1 ? allOrders[currentIndex + 1]._id.toString() : null,
            total: allOrders.length,
            currentPos: currentIndex + 1
          });

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.error("Error fetching adjacent orders:", _context.t0);
          return _context.abrupt("return", {
            prev: null,
            next: null,
            total: 0,
            currentPos: 0
          });

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
}
/**
 * GET NEW ORDERS COUNT (Admin Dashboard)
 */


function getNewOrdersCount() {
  return regeneratorRuntime.async(function getNewOrdersCount$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].countDocuments({
            status: "Pending"
          }));

        case 5:
          return _context2.abrupt("return", _context2.sent);

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          console.error("Error fetching new orders count:", _context2.t0);
          return _context2.abrupt("return", 0);

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 8]]);
}
/**
 * 1. CREATE ORDER
 * Handles Stock deduction, Partial Payment logic, and Confirmation Email.
 */


function createOrder(orderData) {
  var formattedItems, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, product, totalAmount, deliveryCharge, paidAmount, dueAmount, paymentStatus, newOrder, emailPayload;

  return regeneratorRuntime.async(function createOrder$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          // Format Items for Schema
          formattedItems = orderData.items.map(function (item) {
            return {
              product: item.productId,
              productName: item.name,
              variant: {
                name: "".concat(item.name, " (").concat(item.color, " / ").concat(item.size, ")"),
                image: item.imageUrl,
                size: item.size
              },
              quantity: item.quantity,
              price: item.price
            };
          }); // Stock Validation & Update

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context3.prev = 7;
          _iterator = orderData.items[Symbol.iterator]();

        case 9:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context3.next = 23;
            break;
          }

          item = _step.value;
          _context3.next = 13;
          return regeneratorRuntime.awrap(_Product["default"].findById(item.productId));

        case 13:
          product = _context3.sent;

          if (product) {
            _context3.next = 16;
            break;
          }

          throw new Error("Product ".concat(item.name, " not found."));

        case 16:
          if (!(product.stock < item.quantity)) {
            _context3.next = 18;
            break;
          }

          throw new Error("Insufficient stock for ".concat(item.name, ". Available: ").concat(product.stock));

        case 18:
          _context3.next = 20;
          return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(item.productId, {
            $inc: {
              stock: -item.quantity
            }
          }));

        case 20:
          _iteratorNormalCompletion = true;
          _context3.next = 9;
          break;

        case 23:
          _context3.next = 29;
          break;

        case 25:
          _context3.prev = 25;
          _context3.t0 = _context3["catch"](7);
          _didIteratorError = true;
          _iteratorError = _context3.t0;

        case 29:
          _context3.prev = 29;
          _context3.prev = 30;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 32:
          _context3.prev = 32;

          if (!_didIteratorError) {
            _context3.next = 35;
            break;
          }

          throw _iteratorError;

        case 35:
          return _context3.finish(32);

        case 36:
          return _context3.finish(29);

        case 37:
          // 💡 Logic updated to handle dynamic delivery charge
          totalAmount = Number(orderData.totalAmount); // Total including shipping

          deliveryCharge = Number(orderData.deliveryCharge) || 0; // The fee based on location

          paidAmount = Number(orderData.paidAmount) || 0;
          dueAmount = totalAmount - paidAmount;
          paymentStatus = "Unpaid";

          if (dueAmount <= 0) {
            paymentStatus = "Paid";
          } else if (paidAmount > 0) {
            paymentStatus = "Partially Paid";
          }

          _context3.next = 45;
          return regeneratorRuntime.awrap(_Order["default"].create({
            user: orderData.userId,
            items: formattedItems,
            totalAmount: totalAmount,
            deliveryCharge: deliveryCharge,
            // 💡 Now saving to DB for the Success Page invoice
            paidAmount: paidAmount,
            dueAmount: dueAmount > 0 ? dueAmount : 0,
            shippingAddress: orderData.shippingAddress,
            // Using the object we sent from checkout
            status: "Pending",
            paymentStatus: paymentStatus,
            trackingNumber: ""
          }));

        case 45:
          newOrder = _context3.sent;
          _context3.prev = 46;
          emailPayload = JSON.parse(JSON.stringify(newOrder.toObject()));
          _context3.next = 50;
          return regeneratorRuntime.awrap((0, _mail.sendOrderConfirmationEmail)(emailPayload));

        case 50:
          _context3.next = 55;
          break;

        case 52:
          _context3.prev = 52;
          _context3.t1 = _context3["catch"](46);
          console.error("Order created, but confirmation email failed:", _context3.t1);

        case 55:
          (0, _cache.revalidatePath)("/admin", "layout");
          (0, _cache.revalidatePath)("/dashboard/orders");
          return _context3.abrupt("return", _objectSpread({
            success: true,
            orderId: newOrder._id.toString()
          }, JSON.parse(JSON.stringify(newOrder.toObject()))));

        case 60:
          _context3.prev = 60;
          _context3.t2 = _context3["catch"](0);
          console.error("Order Creation Error:", _context3.t2.message);
          return _context3.abrupt("return", {
            success: false,
            message: _context3.t2.message
          });

        case 64:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 60], [7, 25, 29, 37], [30,, 32, 36], [46, 52]]);
}
/**
 * 2. UPDATE STATUS & TRACKING
 * Handles stock return on cancellation and shipping update emails.
 */


function updateOrderStatus(orderId, newStatus) {
  var trackingNumber,
      oldOrder,
      _iteratorNormalCompletion2,
      _didIteratorError2,
      _iteratorError2,
      _iterator2,
      _step2,
      item,
      updateData,
      updatedOrder,
      emailPayload,
      _args4 = arguments;

  return regeneratorRuntime.async(function updateOrderStatus$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          trackingNumber = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : null;
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          _context4.next = 6;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId));

        case 6:
          oldOrder = _context4.sent;

          if (oldOrder) {
            _context4.next = 9;
            break;
          }

          throw new Error("Order not found");

        case 9:
          if (!(newStatus === "Cancelled" && oldOrder.status !== "Cancelled")) {
            _context4.next = 36;
            break;
          }

          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context4.prev = 13;
          _iterator2 = oldOrder.items[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context4.next = 22;
            break;
          }

          item = _step2.value;
          _context4.next = 19;
          return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(item.product, {
            $inc: {
              stock: item.quantity
            }
          }));

        case 19:
          _iteratorNormalCompletion2 = true;
          _context4.next = 15;
          break;

        case 22:
          _context4.next = 28;
          break;

        case 24:
          _context4.prev = 24;
          _context4.t0 = _context4["catch"](13);
          _didIteratorError2 = true;
          _iteratorError2 = _context4.t0;

        case 28:
          _context4.prev = 28;
          _context4.prev = 29;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 31:
          _context4.prev = 31;

          if (!_didIteratorError2) {
            _context4.next = 34;
            break;
          }

          throw _iteratorError2;

        case 34:
          return _context4.finish(31);

        case 35:
          return _context4.finish(28);

        case 36:
          updateData = {
            status: newStatus
          };
          if (trackingNumber) updateData.trackingNumber = trackingNumber; // Auto-mark as paid when delivered

          if (newStatus === "Delivered") {
            updateData.paymentStatus = "Paid";
            updateData.dueAmount = 0;
            updateData.paidAmount = oldOrder.totalAmount;
          }

          _context4.next = 41;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(orderId, updateData, {
            "new": true
          }));

        case 41:
          updatedOrder = _context4.sent;

          if (!(newStatus === "Shipped")) {
            _context4.next = 52;
            break;
          }

          _context4.prev = 43;
          emailPayload = JSON.parse(JSON.stringify(updatedOrder.toObject()));
          _context4.next = 47;
          return regeneratorRuntime.awrap((0, _mail.sendShippingUpdateEmail)(emailPayload));

        case 47:
          _context4.next = 52;
          break;

        case 49:
          _context4.prev = 49;
          _context4.t1 = _context4["catch"](43);
          console.error("Shipping update email failed:", _context4.t1);

        case 52:
          (0, _cache.revalidatePath)("/admin", "layout");
          (0, _cache.revalidatePath)("/admin/orders/".concat(orderId));
          (0, _cache.revalidatePath)("/dashboard/orders");
          (0, _cache.revalidatePath)("/dashboard/orders/".concat(orderId));
          return _context4.abrupt("return", {
            success: true,
            order: JSON.parse(JSON.stringify(updatedOrder))
          });

        case 59:
          _context4.prev = 59;
          _context4.t2 = _context4["catch"](1);
          return _context4.abrupt("return", {
            success: false,
            message: _context4.t2.message
          });

        case 62:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 59], [13, 24, 28, 36], [29,, 31, 35], [43, 49]]);
}
/**
 * 3. GETTERS
 */


function getOrderById(orderId) {
  var order;
  return regeneratorRuntime.async(function getOrderById$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context5.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId).lean());

        case 5:
          order = _context5.sent;

          if (order) {
            _context5.next = 8;
            break;
          }

          return _context5.abrupt("return", null);

        case 8:
          return _context5.abrupt("return", JSON.parse(JSON.stringify(order)));

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          return _context5.abrupt("return", null);

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
}

function getUserOrders(userId) {
  var orders;
  return regeneratorRuntime.async(function getUserOrders$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context6.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].find({
            user: userId
          }).sort({
            createdAt: -1
          }).lean());

        case 5:
          orders = _context6.sent;
          return _context6.abrupt("return", JSON.parse(JSON.stringify(orders)));

        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          return _context6.abrupt("return", []);

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 9]]);
}

function getAllOrders() {
  var orders;
  return regeneratorRuntime.async(function getAllOrders$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context7.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].find({}).sort({
            createdAt: -1
          }).lean());

        case 5:
          orders = _context7.sent;
          return _context7.abrupt("return", JSON.parse(JSON.stringify(orders)));

        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          return _context7.abrupt("return", []);

        case 12:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 9]]);
}