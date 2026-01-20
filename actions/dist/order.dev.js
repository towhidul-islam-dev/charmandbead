"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOrder = createOrder;
exports.syncVIPStatus = syncVIPStatus;
exports.getNewOrdersCount = getNewOrdersCount;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.getDashboardStats = getDashboardStats;
exports.getAllOrders = getAllOrders;
exports.deleteOrder = deleteOrder;
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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 1. CREATE ORDER (The missing function)
 */
function createOrder(orderData) {
  var userId, items, shippingAddress, totalAmount, paidAmount, dueAmount, deliveryCharge, paymentMethod, phone, formattedItems, statusOfPayment, newOrder, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item;

  return regeneratorRuntime.async(function createOrder$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          userId = orderData.userId, items = orderData.items, shippingAddress = orderData.shippingAddress, totalAmount = orderData.totalAmount, paidAmount = orderData.paidAmount, dueAmount = orderData.dueAmount, deliveryCharge = orderData.deliveryCharge, paymentMethod = orderData.paymentMethod, phone = orderData.phone; // 1. Map items to match your Schema's variant structure

          formattedItems = items.map(function (item) {
            return {
              product: item._id || item.id,
              productName: item.name,
              variant: {
                name: item.color || "Default",
                // Storing color as variant name
                image: item.imageUrl || "",
                size: item.size || "N/A"
              },
              quantity: Number(item.quantity),
              price: Number(item.price)
            };
          }); // 2. Determine payment status based on your Schema's Enum
          // Options: "Unpaid", "Partially Paid", "Paid"

          statusOfPayment = "Unpaid";

          if (paymentMethod === "Online") {
            statusOfPayment = "Paid";
          } else if (paidAmount > 0) {
            statusOfPayment = "Partially Paid";
          } // 3. Create the order


          _context.next = 9;
          return regeneratorRuntime.awrap(_Order["default"].create({
            user: userId,
            items: formattedItems,
            shippingAddress: _objectSpread({}, shippingAddress, {
              phone: phone // Injected from checkout state

            }),
            totalAmount: Number(totalAmount),
            deliveryCharge: Number(deliveryCharge),
            paidAmount: Number(paidAmount),
            dueAmount: Number(dueAmount),
            status: "Pending",
            paymentStatus: statusOfPayment
          }));

        case 9:
          newOrder = _context.sent;
          // 4. Update product stock
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 13;
          _iterator = formattedItems[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 23;
            break;
          }

          item = _step.value;

          if (!item.product) {
            _context.next = 20;
            break;
          }

          _context.next = 20;
          return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(item.product, {
            $inc: {
              stock: -item.quantity
            }
          }));

        case 20:
          _iteratorNormalCompletion = true;
          _context.next = 15;
          break;

        case 23:
          _context.next = 29;
          break;

        case 25:
          _context.prev = 25;
          _context.t0 = _context["catch"](13);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 29:
          _context.prev = 29;
          _context.prev = 30;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 32:
          _context.prev = 32;

          if (!_didIteratorError) {
            _context.next = 35;
            break;
          }

          throw _iteratorError;

        case 35:
          return _context.finish(32);

        case 36:
          return _context.finish(29);

        case 37:
          (0, _cache.revalidatePath)("/admin/orders");
          (0, _cache.revalidatePath)("/dashboard/orders");
          return _context.abrupt("return", {
            success: true,
            message: "Order placed successfully!",
            orderId: newOrder._id.toString()
          });

        case 42:
          _context.prev = 42;
          _context.t1 = _context["catch"](0);
          console.error("❌ Schema/Database Error:", _context.t1);
          return _context.abrupt("return", {
            success: false,
            message: _context.t1.code === 11000 ? "Order already exists" : _context.t1.message
          });

        case 46:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 42], [13, 25, 29, 37], [30,, 32, 36]]);
}
/**
 * 2. UNIQUE SYNC FUNCTION
 */


function syncVIPStatus(userId) {
  var stats, totalSpent, isVIP;
  return regeneratorRuntime.async(function syncVIPStatus$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
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
          stats = _context2.sent;
          totalSpent = stats.length > 0 ? stats[0].total : 0;
          isVIP = totalSpent >= 10000;
          _context2.next = 10;
          return regeneratorRuntime.awrap(_User["default"].findByIdAndUpdate(userId, {
            totalSpent: totalSpent,
            isVIP: isVIP
          }));

        case 10:
          return _context2.abrupt("return", {
            success: true,
            totalSpent: totalSpent,
            isVIP: isVIP
          });

        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](0);
          console.error("VIP Sync Error:", _context2.t0);
          return _context2.abrupt("return", {
            success: false
          });

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 13]]);
}

function getNewOrdersCount() {
  return regeneratorRuntime.async(function getNewOrdersCount$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].countDocuments({
            status: "Pending"
          }));

        case 5:
          return _context3.abrupt("return", _context3.sent);

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          console.error("Error fetching new orders count:", _context3.t0);
          return _context3.abrupt("return", 0);

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 8]]);
}

function getOrderById(orderId) {
  var order;
  return regeneratorRuntime.async(function getOrderById$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId).lean());

        case 5:
          order = _context4.sent;

          if (order) {
            _context4.next = 8;
            break;
          }

          return _context4.abrupt("return", null);

        case 8:
          return _context4.abrupt("return", JSON.parse(JSON.stringify(order)));

        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", null);

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 11]]);
}
/**
 * 3. UPDATE ORDER STATUS
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
      _args5 = arguments;

  return regeneratorRuntime.async(function updateOrderStatus$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          trackingNumber = _args5.length > 2 && _args5[2] !== undefined ? _args5[2] : null;
          _context5.prev = 1;
          _context5.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          _context5.next = 6;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId));

        case 6:
          oldOrder = _context5.sent;

          if (oldOrder) {
            _context5.next = 9;
            break;
          }

          throw new Error("Order not found");

        case 9:
          if (!(newStatus === "Cancelled" && oldOrder.status !== "Cancelled")) {
            _context5.next = 36;
            break;
          }

          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context5.prev = 13;
          _iterator2 = oldOrder.items[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context5.next = 22;
            break;
          }

          item = _step2.value;
          _context5.next = 19;
          return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(item.product, {
            $inc: {
              stock: item.quantity
            }
          }));

        case 19:
          _iteratorNormalCompletion2 = true;
          _context5.next = 15;
          break;

        case 22:
          _context5.next = 28;
          break;

        case 24:
          _context5.prev = 24;
          _context5.t0 = _context5["catch"](13);
          _didIteratorError2 = true;
          _iteratorError2 = _context5.t0;

        case 28:
          _context5.prev = 28;
          _context5.prev = 29;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 31:
          _context5.prev = 31;

          if (!_didIteratorError2) {
            _context5.next = 34;
            break;
          }

          throw _iteratorError2;

        case 34:
          return _context5.finish(31);

        case 35:
          return _context5.finish(28);

        case 36:
          updateData = {
            status: newStatus
          };
          if (trackingNumber) updateData.trackingNumber = trackingNumber;

          if (newStatus === "Delivered") {
            updateData.paymentStatus = "Paid";
            updateData.paidAmount = oldOrder.totalAmount;
          }

          _context5.next = 41;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(orderId, updateData, {
            "new": true
          }));

        case 41:
          updatedOrder = _context5.sent;

          if (!(newStatus === "Delivered" && updatedOrder.user)) {
            _context5.next = 45;
            break;
          }

          _context5.next = 45;
          return regeneratorRuntime.awrap(syncVIPStatus(updatedOrder.user));

        case 45:
          if (!(newStatus === "Shipped")) {
            _context5.next = 55;
            break;
          }

          _context5.prev = 46;
          emailPayload = JSON.parse(JSON.stringify(updatedOrder.toObject()));
          _context5.next = 50;
          return regeneratorRuntime.awrap((0, _mail.sendShippingUpdateEmail)(emailPayload));

        case 50:
          _context5.next = 55;
          break;

        case 52:
          _context5.prev = 52;
          _context5.t1 = _context5["catch"](46);
          console.error("Email failed:", _context5.t1);

        case 55:
          (0, _cache.revalidatePath)("/admin/orders");
          return _context5.abrupt("return", {
            success: true,
            order: JSON.parse(JSON.stringify(updatedOrder))
          });

        case 59:
          _context5.prev = 59;
          _context5.t2 = _context5["catch"](1);
          return _context5.abrupt("return", {
            success: false,
            message: _context5.t2.message
          });

        case 62:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 59], [13, 24, 28, 36], [29,, 31, 35], [46, 52]]);
}
/**
 * 4. DASHBOARD STATS (Fixed dbConnect typo)
 */


function getDashboardStats() {
  var revenueData, totalRevenue, activeOrders, totalUsers;
  return regeneratorRuntime.async(function getDashboardStats$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context6.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].aggregate([{
            $match: {
              status: {
                $ne: "Cancelled"
              }
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
          revenueData = _context6.sent;
          totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
          _context6.next = 9;
          return regeneratorRuntime.awrap(_Order["default"].countDocuments({
            status: {
              $in: ["Pending", "Processing", "Shipped"]
            }
          }));

        case 9:
          activeOrders = _context6.sent;
          _context6.next = 12;
          return regeneratorRuntime.awrap(_User["default"].countDocuments());

        case 12:
          totalUsers = _context6.sent;
          return _context6.abrupt("return", {
            success: true,
            stats: {
              totalRevenue: totalRevenue,
              activeOrders: activeOrders,
              totalUsers: totalUsers,
              conversionRate: 3.2
            }
          });

        case 16:
          _context6.prev = 16;
          _context6.t0 = _context6["catch"](0);
          console.error("Dashboard Stats Error:", _context6.t0);
          return _context6.abrupt("return", {
            success: false,
            error: "Failed to fetch stats"
          });

        case 20:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 16]]);
}
/**
 * 5. FETCHING FUNCTIONS
 */


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
      _args7 = arguments;

  return regeneratorRuntime.async(function getAllOrders$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          page = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : 1;
          limit = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : 10;
          search = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : "";
          status = _args7.length > 3 && _args7[3] !== undefined ? _args7[3] : "All";
          _context7.prev = 4;
          _context7.next = 7;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 7:
          query = {};
          if (status !== "All") query.status = status;

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

          skip = (page - 1) * limit;
          _context7.next = 13;
          return regeneratorRuntime.awrap(Promise.all([_Order["default"].find(query).sort({
            createdAt: -1
          }).skip(skip).limit(limit).lean(), _Order["default"].countDocuments(query)]));

        case 13:
          _ref = _context7.sent;
          _ref2 = _slicedToArray(_ref, 2);
          orders = _ref2[0];
          total = _ref2[1];
          return _context7.abrupt("return", {
            success: true,
            orders: JSON.parse(JSON.stringify(orders)),
            totalPages: Math.ceil(total / limit),
            totalOrders: total
          });

        case 20:
          _context7.prev = 20;
          _context7.t0 = _context7["catch"](4);
          return _context7.abrupt("return", {
            success: false,
            orders: [],
            totalPages: 0
          });

        case 23:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[4, 20]]);
}

function deleteOrder(orderId) {
  var order, userId;
  return regeneratorRuntime.async(function deleteOrder$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context8.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId));

        case 5:
          order = _context8.sent;

          if (order) {
            _context8.next = 8;
            break;
          }

          return _context8.abrupt("return", {
            success: false,
            error: "Order not found"
          });

        case 8:
          userId = order.user;
          _context8.next = 11;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndDelete(orderId));

        case 11:
          if (!userId) {
            _context8.next = 14;
            break;
          }

          _context8.next = 14;
          return regeneratorRuntime.awrap(syncVIPStatus(userId));

        case 14:
          (0, _cache.revalidatePath)("/admin/orders");
          return _context8.abrupt("return", {
            success: true
          });

        case 18:
          _context8.prev = 18;
          _context8.t0 = _context8["catch"](0);
          return _context8.abrupt("return", {
            success: false,
            error: "Database error"
          });

        case 21:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 18]]);
}

function getUserOrders(userId) {
  var orders;
  return regeneratorRuntime.async(function getUserOrders$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context9.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].find({
            user: userId
          }).sort({
            createdAt: -1
          }).lean());

        case 5:
          orders = _context9.sent;
          return _context9.abrupt("return", JSON.parse(JSON.stringify(orders)));

        case 9:
          _context9.prev = 9;
          _context9.t0 = _context9["catch"](0);
          return _context9.abrupt("return", []);

        case 12:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 9]]);
}