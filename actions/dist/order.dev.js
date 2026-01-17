"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syncVIPStatus = syncVIPStatus;
exports.getNewOrdersCount = getNewOrdersCount;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.deleteOrder = deleteOrder;
exports.getAllOrders = getAllOrders;
exports.getUserOrders = getUserOrders;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Order = _interopRequireDefault(require("@/models/Order"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _User = _interopRequireDefault(require("@/models/User"));

var _cache = require("next/cache");

var _mail = require("@/lib/mail");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// 1. UNIQUE SYNC FUNCTION
function syncVIPStatus(userId) {
  var stats, totalSpent, isVIP;
  return regeneratorRuntime.async(function syncVIPStatus$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].aggregate([{
            $match: {
              user: userId,
              status: "Delivered"
            }
          }, {
            $group: {
              _id: null,
              total: {
                $sum: "$totalAmount"
              }
            }
          }]));

        case 5:
          stats = _context.sent;
          totalSpent = stats.length > 0 ? stats[0].total : 0;
          isVIP = totalSpent >= 10000;
          _context.next = 10;
          return regeneratorRuntime.awrap(_User["default"].findByIdAndUpdate(userId, {
            totalSpent: totalSpent,
            isVIP: isVIP
          }));

        case 10:
          return _context.abrupt("return", {
            success: true,
            totalSpent: totalSpent,
            isVIP: isVIP
          });

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);
          console.error("VIP Sync Error:", _context.t0);
          return _context.abrupt("return", {
            success: false
          });

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
}

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

function getOrderById(orderId) {
  var order;
  return regeneratorRuntime.async(function getOrderById$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId).lean());

        case 5:
          order = _context3.sent;

          if (order) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", null);

        case 8:
          return _context3.abrupt("return", JSON.parse(JSON.stringify(order)));

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", null);

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 11]]);
} // 2. UNIQUE STATUS UPDATE FUNCTION (Merged Logic)


function updateOrderStatus(orderId, newStatus) {
  var trackingNumber,
      oldOrder,
      _iteratorNormalCompletion,
      _didIteratorError,
      _iteratorError,
      _iterator,
      _step,
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

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context4.prev = 13;
          _iterator = oldOrder.items[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context4.next = 22;
            break;
          }

          item = _step.value;
          _context4.next = 19;
          return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(item.product, {
            $inc: {
              stock: item.quantity
            }
          }));

        case 19:
          _iteratorNormalCompletion = true;
          _context4.next = 15;
          break;

        case 22:
          _context4.next = 28;
          break;

        case 24:
          _context4.prev = 24;
          _context4.t0 = _context4["catch"](13);
          _didIteratorError = true;
          _iteratorError = _context4.t0;

        case 28:
          _context4.prev = 28;
          _context4.prev = 29;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 31:
          _context4.prev = 31;

          if (!_didIteratorError) {
            _context4.next = 34;
            break;
          }

          throw _iteratorError;

        case 34:
          return _context4.finish(31);

        case 35:
          return _context4.finish(28);

        case 36:
          updateData = {
            status: newStatus
          };
          if (trackingNumber) updateData.trackingNumber = trackingNumber;

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

          if (!(newStatus === "Delivered" && updatedOrder.user)) {
            _context4.next = 45;
            break;
          }

          _context4.next = 45;
          return regeneratorRuntime.awrap(syncVIPStatus(updatedOrder.user));

        case 45:
          if (!(newStatus === "Shipped")) {
            _context4.next = 55;
            break;
          }

          _context4.prev = 46;
          emailPayload = JSON.parse(JSON.stringify(updatedOrder.toObject()));
          _context4.next = 50;
          return regeneratorRuntime.awrap((0, _mail.sendShippingUpdateEmail)(emailPayload));

        case 50:
          _context4.next = 55;
          break;

        case 52:
          _context4.prev = 52;
          _context4.t1 = _context4["catch"](46);
          console.error("Email failed:", _context4.t1);

        case 55:
          (0, _cache.revalidatePath)("/admin/orders");
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
  }, null, null, [[1, 59], [13, 24, 28, 36], [29,, 31, 35], [46, 52]]);
} // 3. DELETE ORDER FUNCTION


function deleteOrder(orderId) {
  var order, userId;
  return regeneratorRuntime.async(function deleteOrder$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context5.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId));

        case 5:
          order = _context5.sent;

          if (order) {
            _context5.next = 8;
            break;
          }

          return _context5.abrupt("return", {
            success: false,
            error: "Order not found"
          });

        case 8:
          userId = order.user;
          _context5.next = 11;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndDelete(orderId));

        case 11:
          if (!userId) {
            _context5.next = 14;
            break;
          }

          _context5.next = 14;
          return regeneratorRuntime.awrap(syncVIPStatus(userId));

        case 14:
          (0, _cache.revalidatePath)("/admin/orders");
          return _context5.abrupt("return", {
            success: true
          });

        case 18:
          _context5.prev = 18;
          _context5.t0 = _context5["catch"](0);
          return _context5.abrupt("return", {
            success: false,
            error: "Database error"
          });

        case 21:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 18]]);
} // 4. FETCHING FUNCTIONS


function getAllOrders() {
  var page,
      limit,
      search,
      status,
      query,
      skip,
      _ref,
      _ref2,
      orders,
      total,
      _args6 = arguments;

  return regeneratorRuntime.async(function getAllOrders$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          page = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : 1;
          limit = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : 10;
          search = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : "";
          status = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : "All";
          _context6.prev = 4;
          _context6.next = 7;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 7:
          // 1. Build Query for MongoDB (Faster than filtering in Javascript)
          query = {};

          if (status !== "All") {
            query.status = status;
          }

          if (search) {
            query.$or = [{
              "_id": {
                $regex: search,
                $options: "i"
              }
            }, {
              "shippingAddress.name": {
                $regex: search,
                $options: "i"
              }
            }, {
              "shippingAddress.phone": {
                $regex: search,
                $options: "i"
              }
            }];
          }

          skip = (page - 1) * limit; // 2. Execute queries in parallel for speed

          _context6.next = 13;
          return regeneratorRuntime.awrap(Promise.all([_Order["default"].find(query).sort({
            createdAt: -1
          }).skip(skip).limit(limit).lean(), _Order["default"].countDocuments(query)]));

        case 13:
          _ref = _context6.sent;
          _ref2 = _slicedToArray(_ref, 2);
          orders = _ref2[0];
          total = _ref2[1];
          return _context6.abrupt("return", {
            success: true,
            orders: JSON.parse(JSON.stringify(orders)),
            totalPages: Math.ceil(total / limit),
            totalOrders: total
          });

        case 20:
          _context6.prev = 20;
          _context6.t0 = _context6["catch"](4);
          console.error("Database Error:", _context6.t0);
          return _context6.abrupt("return", {
            success: false,
            orders: [],
            totalPages: 0
          });

        case 24:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[4, 20]]);
}

function getUserOrders(userId) {
  var orders;
  return regeneratorRuntime.async(function getUserOrders$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context7.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].find({
            user: userId
          }).sort({
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