"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOrder = createOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.syncVIPStatus = syncVIPStatus;
exports.getDashboardStats = getDashboardStats;
exports.getAllOrders = getAllOrders;
exports.getOrderById = getOrderById;
exports.deleteOrder = deleteOrder;
exports.getUserOrders = getUserOrders;
exports.getNewOrdersCount = getNewOrdersCount;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Order = _interopRequireDefault(require("@/models/Order"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _User = _interopRequireDefault(require("@/models/User"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _cache = require("next/cache");

var _mail = require("@/lib/mail");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * 1. CREATE ORDER (Atomic Transaction Logic)
 */
function createOrder(orderData) {
  var session, userId, items, shippingAddress, totalAmount, paidAmount, dueAmount, deliveryCharge, paymentMethod, mobileBankingFee, phone, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, quantityToDeduct, productId, isVariant, filter, update, productUpdate, formattedItems, statusOfPayment, _ref, _ref2, newOrder;

  return regeneratorRuntime.async(function createOrder$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(_mongoose["default"].startSession());

        case 2:
          session = _context.sent;
          session.startTransaction();
          _context.prev = 4;
          _context.next = 7;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 7:
          userId = orderData.userId, items = orderData.items, shippingAddress = orderData.shippingAddress, totalAmount = orderData.totalAmount, paidAmount = orderData.paidAmount, dueAmount = orderData.dueAmount, deliveryCharge = orderData.deliveryCharge, paymentMethod = orderData.paymentMethod, mobileBankingFee = orderData.mobileBankingFee, phone = orderData.phone; // A. Validate and Deduct Stock Atomically

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 11;
          _iterator = items[Symbol.iterator]();

        case 13:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 28;
            break;
          }

          item = _step.value;
          quantityToDeduct = Number(item.quantity);
          productId = item.productId || item._id;
          isVariant = item.color || item.size;
          filter = isVariant ? {
            _id: productId,
            "variants.color": item.color,
            "variants.size": item.size,
            "variants.stock": {
              $gte: quantityToDeduct
            }
          } : {
            _id: productId,
            stock: {
              $gte: quantityToDeduct
            }
          };
          update = isVariant ? {
            $inc: {
              "variants.$.stock": -quantityToDeduct
            }
          } : {
            $inc: {
              stock: -quantityToDeduct
            }
          };
          _context.next = 22;
          return regeneratorRuntime.awrap(_Product["default"].updateOne(filter, update, {
            session: session
          }));

        case 22:
          productUpdate = _context.sent;

          if (!(productUpdate.modifiedCount === 0)) {
            _context.next = 25;
            break;
          }

          throw new Error("Stock error: ".concat(item.name, " (").concat(item.color || '', ") is no longer available."));

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
          // B. Map items
          formattedItems = items.map(function (item) {
            return {
              product: item.productId || item._id,
              productName: item.name,
              variant: {
                name: item.color || "Default",
                image: item.imageUrl || "",
                size: item.size || "N/A"
              },
              quantity: Number(item.quantity),
              price: Number(item.price)
            };
          }); // C. Determine payment status

          statusOfPayment = "Unpaid";

          if (paymentMethod === "Online") {
            statusOfPayment = "Paid";
          } else if (paidAmount > 0) {
            statusOfPayment = "Partially Paid";
          } // D. Create the order


          _context.next = 47;
          return regeneratorRuntime.awrap(_Order["default"].create([{
            user: userId,
            items: formattedItems,
            shippingAddress: _objectSpread({}, shippingAddress, {
              phone: phone
            }),
            totalAmount: Number(totalAmount),
            deliveryCharge: Number(deliveryCharge),
            mobileBankingFee: Number(mobileBankingFee || 0),
            // 🟢 Added this line
            paymentMethod: paymentMethod,
            // 🟢 Added this line
            paidAmount: Number(paidAmount),
            dueAmount: Number(dueAmount),
            // Use the dueAmount from data
            status: "Pending",
            paymentStatus: statusOfPayment
          }], {
            session: session
          }));

        case 47:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 1);
          newOrder = _ref2[0];
          _context.next = 52;
          return regeneratorRuntime.awrap(session.commitTransaction());

        case 52:
          (0, _cache.revalidatePath)("/admin/orders");
          (0, _cache.revalidatePath)("/dashboard/orders");
          (0, _cache.revalidatePath)("/admin/products");
          return _context.abrupt("return", {
            success: true,
            message: "Order placed successfully!",
            orderId: newOrder._id.toString()
          });

        case 58:
          _context.prev = 58;
          _context.t1 = _context["catch"](4);
          _context.next = 62;
          return regeneratorRuntime.awrap(session.abortTransaction());

        case 62:
          console.error("❌ Checkout Error:", _context.t1);
          return _context.abrupt("return", {
            success: false,
            message: _context.t1.message
          });

        case 64:
          _context.prev = 64;
          session.endSession();
          return _context.finish(64);

        case 67:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[4, 58, 64, 67], [11, 30, 34, 42], [35,, 37, 41]]);
}
/**
 * 2. UPDATE ORDER STATUS (Includes Stock Return Logic)
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
      isVariant,
      filter,
      update,
      updateData,
      updatedOrder,
      _args2 = arguments;

  return regeneratorRuntime.async(function updateOrderStatus$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          trackingNumber = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : null;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          _context2.next = 6;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId));

        case 6:
          oldOrder = _context2.sent;

          if (oldOrder) {
            _context2.next = 9;
            break;
          }

          throw new Error("Order not found");

        case 9:
          if (!(newStatus === "Cancelled" && oldOrder.status !== "Cancelled")) {
            _context2.next = 39;
            break;
          }

          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context2.prev = 13;
          _iterator2 = oldOrder.items[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context2.next = 25;
            break;
          }

          item = _step2.value;
          isVariant = item.variant && item.variant.name !== "Default";
          filter = isVariant ? {
            _id: item.product,
            "variants.color": item.variant.name,
            "variants.size": item.variant.size
          } : {
            _id: item.product
          };
          update = isVariant ? {
            $inc: {
              "variants.$.stock": item.quantity
            }
          } : {
            $inc: {
              stock: item.quantity
            }
          };
          _context2.next = 22;
          return regeneratorRuntime.awrap(_Product["default"].updateOne(filter, update));

        case 22:
          _iteratorNormalCompletion2 = true;
          _context2.next = 15;
          break;

        case 25:
          _context2.next = 31;
          break;

        case 27:
          _context2.prev = 27;
          _context2.t0 = _context2["catch"](13);
          _didIteratorError2 = true;
          _iteratorError2 = _context2.t0;

        case 31:
          _context2.prev = 31;
          _context2.prev = 32;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 34:
          _context2.prev = 34;

          if (!_didIteratorError2) {
            _context2.next = 37;
            break;
          }

          throw _iteratorError2;

        case 37:
          return _context2.finish(34);

        case 38:
          return _context2.finish(31);

        case 39:
          updateData = {
            status: newStatus
          };
          if (trackingNumber) updateData.trackingNumber = trackingNumber;

          if (newStatus === "Delivered") {
            updateData.paymentStatus = "Paid";
            updateData.paidAmount = oldOrder.totalAmount;
            updateData.dueAmount = 0;
          }

          _context2.next = 44;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(orderId, updateData, {
            "new": true
          }));

        case 44:
          updatedOrder = _context2.sent;

          if (!(newStatus === "Delivered" && updatedOrder.user)) {
            _context2.next = 48;
            break;
          }

          _context2.next = 48;
          return regeneratorRuntime.awrap(syncVIPStatus(updatedOrder.user));

        case 48:
          if (!(newStatus === "Shipped")) {
            _context2.next = 57;
            break;
          }

          _context2.prev = 49;
          _context2.next = 52;
          return regeneratorRuntime.awrap((0, _mail.sendShippingUpdateEmail)(JSON.parse(JSON.stringify(updatedOrder))));

        case 52:
          _context2.next = 57;
          break;

        case 54:
          _context2.prev = 54;
          _context2.t1 = _context2["catch"](49);
          console.error("Email failed:", _context2.t1);

        case 57:
          (0, _cache.revalidatePath)("/admin/orders");
          return _context2.abrupt("return", {
            success: true,
            order: JSON.parse(JSON.stringify(updatedOrder))
          });

        case 61:
          _context2.prev = 61;
          _context2.t2 = _context2["catch"](1);
          return _context2.abrupt("return", {
            success: false,
            message: _context2.t2.message
          });

        case 64:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 61], [13, 27, 31, 39], [32,, 34, 38], [49, 54]]);
}
/**
 * 3. DASHBOARD & UTILS
 */


function syncVIPStatus(userId) {
  var stats, totalSpent, isVIP;
  return regeneratorRuntime.async(function syncVIPStatus$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context3.next = 5;
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
          stats = _context3.sent;
          totalSpent = stats.length > 0 ? stats[0].total : 0;
          isVIP = totalSpent >= 10000;
          _context3.next = 10;
          return regeneratorRuntime.awrap(_User["default"].findByIdAndUpdate(userId, {
            totalSpent: totalSpent,
            isVIP: isVIP
          }));

        case 10:
          return _context3.abrupt("return", {
            success: true,
            totalSpent: totalSpent,
            isVIP: isVIP
          });

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", {
            success: false
          });

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 13]]);
}

function getDashboardStats() {
  var period,
      startDate,
      now,
      financialData,
      financials,
      netProductRevenue,
      _args4 = arguments;
  return regeneratorRuntime.async(function getDashboardStats$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          period = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : "all";
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          // Calculate Date Filter
          startDate = new Date(0); // Default to beginning of time

          now = new Date();
          if (period === "7days") startDate = new Date(now.setDate(now.getDate() - 7));else if (period === "30days") startDate = new Date(now.setDate(now.getDate() - 30));else if (period === "year") startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          _context4.next = 9;
          return regeneratorRuntime.awrap(_Order["default"].aggregate([{
            $match: {
              status: {
                $ne: "Cancelled"
              },
              createdAt: {
                $gte: startDate
              } // 🟢 Date Filtering added

            }
          }, {
            $group: {
              _id: null,
              grossRevenue: {
                $sum: "$totalAmount"
              },
              totalMfsFees: {
                $sum: {
                  $ifNull: ["$mobileBankingFee", 0]
                }
              },
              totalDeliveryCharges: {
                $sum: {
                  $ifNull: ["$deliveryCharge", 0]
                }
              },
              orderCount: {
                $sum: 1
              }
            }
          }]));

        case 9:
          financialData = _context4.sent;
          financials = financialData[0] || {
            grossRevenue: 0,
            totalMfsFees: 0,
            totalDeliveryCharges: 0,
            orderCount: 0
          }; // Net Product Revenue calculation

          netProductRevenue = financials.grossRevenue - financials.totalMfsFees - financials.totalDeliveryCharges;
          return _context4.abrupt("return", {
            success: true,
            stats: {
              totalRevenue: financials.grossRevenue,
              netRevenue: netProductRevenue,
              gatewayCosts: financials.totalMfsFees,
              deliveryCosts: financials.totalDeliveryCharges,
              orderCount: financials.orderCount
            }
          });

        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](1);
          return _context4.abrupt("return", {
            success: false
          });

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 15]]);
}
/**
 * 4. FETCHING FUNCTIONS
 */


function getAllOrders() {
  var page,
      limit,
      search,
      status,
      query,
      skip,
      _ref3,
      _ref4,
      orders,
      total,
      _args5 = arguments;

  return regeneratorRuntime.async(function getAllOrders$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          page = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : 1;
          limit = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : 10;
          search = _args5.length > 2 && _args5[2] !== undefined ? _args5[2] : "";
          status = _args5.length > 3 && _args5[3] !== undefined ? _args5[3] : "All";
          _context5.prev = 4;
          _context5.next = 7;
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
          _context5.next = 13;
          return regeneratorRuntime.awrap(Promise.all([_Order["default"].find(query).sort({
            createdAt: -1
          }).skip(skip).limit(limit).lean(), _Order["default"].countDocuments(query)]));

        case 13:
          _ref3 = _context5.sent;
          _ref4 = _slicedToArray(_ref3, 2);
          orders = _ref4[0];
          total = _ref4[1];
          return _context5.abrupt("return", {
            success: true,
            orders: JSON.parse(JSON.stringify(orders)),
            totalPages: Math.ceil(total / limit),
            totalOrders: total
          });

        case 20:
          _context5.prev = 20;
          _context5.t0 = _context5["catch"](4);
          return _context5.abrupt("return", {
            success: false,
            orders: [],
            totalPages: 0
          });

        case 23:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[4, 20]]);
}

function getOrderById(orderId) {
  var order;
  return regeneratorRuntime.async(function getOrderById$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context6.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId).lean());

        case 5:
          order = _context6.sent;
          return _context6.abrupt("return", order ? JSON.parse(JSON.stringify(order)) : null);

        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          return _context6.abrupt("return", null);

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 9]]);
}

function deleteOrder(orderId) {
  var order, userId;
  return regeneratorRuntime.async(function deleteOrder$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context7.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId));

        case 5:
          order = _context7.sent;

          if (order) {
            _context7.next = 8;
            break;
          }

          return _context7.abrupt("return", {
            success: false,
            error: "Order not found"
          });

        case 8:
          userId = order.user;
          _context7.next = 11;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndDelete(orderId));

        case 11:
          if (!userId) {
            _context7.next = 14;
            break;
          }

          _context7.next = 14;
          return regeneratorRuntime.awrap(syncVIPStatus(userId));

        case 14:
          (0, _cache.revalidatePath)("/admin/orders");
          return _context7.abrupt("return", {
            success: true
          });

        case 18:
          _context7.prev = 18;
          _context7.t0 = _context7["catch"](0);
          return _context7.abrupt("return", {
            success: false,
            error: "Database error"
          });

        case 21:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 18]]);
}

function getUserOrders(userId) {
  var orders;
  return regeneratorRuntime.async(function getUserOrders$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context8.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].find({
            user: userId
          }).sort({
            createdAt: -1
          }).lean());

        case 5:
          orders = _context8.sent;
          return _context8.abrupt("return", JSON.parse(JSON.stringify(orders)));

        case 9:
          _context8.prev = 9;
          _context8.t0 = _context8["catch"](0);
          return _context8.abrupt("return", []);

        case 12:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 9]]);
}

function getNewOrdersCount() {
  return regeneratorRuntime.async(function getNewOrdersCount$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context9.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].countDocuments({
            status: "Pending"
          }));

        case 5:
          return _context9.abrupt("return", _context9.sent);

        case 8:
          _context9.prev = 8;
          _context9.t0 = _context9["catch"](0);
          return _context9.abrupt("return", 0);

        case 11:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 8]]);
}