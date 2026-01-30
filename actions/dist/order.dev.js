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

var _InventoryLog = _interopRequireDefault(require("@/models/InventoryLog"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// export async function createOrder(orderData) {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     await dbConnect();
//     // 1. Destructure for clarity
//     const { items, phone, totalAmount, userId, shippingAddress, paidAmount, dueAmount, paymentMethod } = orderData;
//     // 🛡️ User Validation Check
//     if (!userId) {
//       throw new Error("User ID is required. Please log in to complete your order.");
//     }
//     // 2. Double-Order Protection (Idempotency)
//     const existingOrder = await Order.findOne({
//       "shippingAddress.phone": phone,
//       totalAmount: totalAmount,
//       // Check for orders in the last 60 seconds to prevent double-clicks
//       createdAt: { $gte: new Date(Date.now() - 60 * 1000) } 
//     }).session(session);
//     if (existingOrder) {
//       await session.abortTransaction();
//       return { success: true, orderId: existingOrder._id };
//     }
//     // 3. Create Order Doc 
//     // 🟢 FIXED: Explicitly mapping 'userId' to the 'user' field required by your Schema
//     const [newOrder] = await Order.create([{
//        user: userId, 
//        items: items.map(i => ({
//          product: i.productId || i.product || i._id,
//          productName: i.name,
//          variant: {
//             name: i.color || "Default",
//             size: i.size || "N/A",
//             variantId: i.variantId
//          },
//          quantity: Number(i.quantity),
//          price: Number(i.price),
//          sku: i.sku || "N/A"
//        })),
//        shippingAddress,
//        totalAmount,
//        paidAmount,
//        dueAmount,
//        paymentMethod,
//        status: "Pending",
//        isStockReduced: false
//     }], { session });
//     // 4. Group deductions by Product ID 
//     const productDeductions = items.reduce((acc, item) => {
//       const pId = (item.productId || item.product || item._id).toString();
//       if (!acc[pId]) acc[pId] = { totalQty: 0, variants: [], name: item.name };
//       const qty = Number(item.quantity);
//       acc[pId].totalQty += qty;
//       if (item.variantId) {
//         acc[pId].variants.push({ vId: item.variantId.toString(), qty });
//       }
//       return acc;
//     }, {});
//     // 5. Atomic Inventory Update
//     const orderRef = `Order #${newOrder._id.toString().slice(-6).toUpperCase()}`;
//     for (const [productId, data] of Object.entries(productDeductions)) {
//       const updateDoc = { $inc: { stock: -data.totalQty } };
//       const arrayFilters = [];
//       data.variants.forEach((v, idx) => {
//         const fName = `var${idx}`;
//         updateDoc.$inc[`variants.$[${fName}].stock`] = -v.qty;
//         arrayFilters.push({ [`${fName}._id`]: new mongoose.Types.ObjectId(v.vId) });
//       });
//       const productUpdate = await Product.findOneAndUpdate(
//         { _id: productId, stock: { $gte: data.totalQty } },
//         updateDoc,
//         { 
//           session, 
//           arrayFilters: arrayFilters.length > 0 ? arrayFilters : undefined, 
//           new: true 
//         }
//       );
//       if (!productUpdate) {
//         throw new Error(`Insufficient stock for ${data.name}.`);
//       }
//       // Log the inventory change
//       await InventoryLog.create([{
//         productId,
//         productName: data.name,
//         change: -data.totalQty,
//         reason: "Order Placement",
//         performedBy: orderRef
//       }], { session });
//     }
//     // 6. Finalize Order Status
//     await Order.updateOne({ _id: newOrder._id }, { isStockReduced: true }, { session });
//     await session.commitTransaction();
//     revalidatePath("/admin/products");
//     revalidatePath("/admin/orders");
//     revalidatePath("/products");
//     return { success: true, orderId: newOrder._id };
//   } catch (error) {
//     if (session.transaction.state !== 'TRANSACTION_ABORTED') {
//       await session.abortTransaction();
//     }
//     console.error("ORDER_ERROR:", error.message);
//     return { success: false, message: error.message };
//   } finally {
//     session.endSession();
//   }
// }
function createOrder(orderData) {
  var session, items, phone, totalAmount, userId, shippingAddress, paidAmount, dueAmount, paymentMethod, existingOrder, _ref, _ref2, newOrder, productDeductions, orderRef, _loop, _i2, _Object$entries;

  return regeneratorRuntime.async(function createOrder$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(_mongoose["default"].startSession());

        case 2:
          session = _context2.sent;
          session.startTransaction();
          _context2.prev = 4;
          _context2.next = 7;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 7:
          items = orderData.items, phone = orderData.phone, totalAmount = orderData.totalAmount, userId = orderData.userId, shippingAddress = orderData.shippingAddress, paidAmount = orderData.paidAmount, dueAmount = orderData.dueAmount, paymentMethod = orderData.paymentMethod;

          if (userId) {
            _context2.next = 10;
            break;
          }

          throw new Error("User ID is required.");

        case 10:
          _context2.next = 12;
          return regeneratorRuntime.awrap(_Order["default"].findOne({
            "shippingAddress.phone": phone,
            totalAmount: totalAmount,
            createdAt: {
              $gte: new Date(Date.now() - 60 * 1000)
            }
          }).session(session));

        case 12:
          existingOrder = _context2.sent;

          if (!existingOrder) {
            _context2.next = 17;
            break;
          }

          _context2.next = 16;
          return regeneratorRuntime.awrap(session.abortTransaction());

        case 16:
          return _context2.abrupt("return", {
            success: true,
            orderId: existingOrder._id
          });

        case 17:
          _context2.next = 19;
          return regeneratorRuntime.awrap(_Order["default"].create([{
            user: userId,
            items: items.map(function (i) {
              return {
                product: i.productId || i.product || i._id,
                productName: i.name,
                variant: {
                  name: i.color || "Default",
                  size: i.size || "N/A",
                  variantId: i.variantId
                },
                quantity: Number(i.quantity),
                price: Number(i.price),
                sku: i.sku || "N/A"
              };
            }),
            shippingAddress: shippingAddress,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            dueAmount: dueAmount,
            paymentMethod: paymentMethod,
            status: "Pending",
            isStockReduced: false
          }], {
            session: session
          }));

        case 19:
          _ref = _context2.sent;
          _ref2 = _slicedToArray(_ref, 1);
          newOrder = _ref2[0];
          // 3. Group deductions by Product
          productDeductions = items.reduce(function (acc, item) {
            var pId = (item.productId || item.product || item._id).toString();

            if (!acc[pId]) acc[pId] = {
              totalQty: 0,
              variants: [],
              name: item.name
            };
            var qty = Number(item.quantity);
            acc[pId].totalQty += qty;

            if (item.variantId) {
              acc[pId].variants.push({
                vId: item.variantId.toString(),
                qty: qty
              });
            }

            return acc;
          }, {}); // 4. Atomic Inventory Sync Loop

          orderRef = "Order #".concat(newOrder._id.toString().slice(-6).toUpperCase());

          _loop = function _loop() {
            var _Object$entries$_i, productId, data, product;

            return regeneratorRuntime.async(function _loop$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2), productId = _Object$entries$_i[0], data = _Object$entries$_i[1];
                    _context.next = 3;
                    return regeneratorRuntime.awrap(_Product["default"].findById(productId).session(session));

                  case 3:
                    product = _context.sent;

                    if (product) {
                      _context.next = 6;
                      break;
                    }

                    throw new Error("Product ".concat(data.name, " not found."));

                  case 6:
                    if (!product.hasVariants) {
                      _context.next = 11;
                      break;
                    }

                    data.variants.forEach(function (orderedVar) {
                      var target = product.variants.id(orderedVar.vId);
                      if (!target) throw new Error("Variant not found for ".concat(data.name));
                      if (target.stock < orderedVar.qty) throw new Error("Low stock for ".concat(data.name, " (").concat(target.color, ")"));
                      target.stock -= orderedVar.qty; // Subtract variant stock
                    }); // Step C: 🟢 THE HEALER - Set parent stock as sum of new variant stocks

                    product.stock = product.variants.reduce(function (sum, v) {
                      return sum + (v.stock || 0);
                    }, 0);
                    _context.next = 14;
                    break;

                  case 11:
                    if (!(product.stock < data.totalQty)) {
                      _context.next = 13;
                      break;
                    }

                    throw new Error("Low stock for ".concat(data.name));

                  case 13:
                    product.stock -= data.totalQty;

                  case 14:
                    _context.next = 16;
                    return regeneratorRuntime.awrap(product.save({
                      session: session
                    }));

                  case 16:
                    _context.next = 18;
                    return regeneratorRuntime.awrap(_InventoryLog["default"].create([{
                      productId: productId,
                      productName: data.name,
                      change: -data.totalQty,
                      reason: "Order Placement",
                      performedBy: orderRef
                    }], {
                      session: session
                    }));

                  case 18:
                  case "end":
                    return _context.stop();
                }
              }
            });
          };

          _i2 = 0, _Object$entries = Object.entries(productDeductions);

        case 26:
          if (!(_i2 < _Object$entries.length)) {
            _context2.next = 32;
            break;
          }

          _context2.next = 29;
          return regeneratorRuntime.awrap(_loop());

        case 29:
          _i2++;
          _context2.next = 26;
          break;

        case 32:
          _context2.next = 34;
          return regeneratorRuntime.awrap(_Order["default"].updateOne({
            _id: newOrder._id
          }, {
            isStockReduced: true
          }, {
            session: session
          }));

        case 34:
          _context2.next = 36;
          return regeneratorRuntime.awrap(session.commitTransaction());

        case 36:
          (0, _cache.revalidatePath)("/admin/products");
          (0, _cache.revalidatePath)("/admin/orders");
          (0, _cache.revalidatePath)("/products");
          return _context2.abrupt("return", {
            success: true,
            orderId: newOrder._id
          });

        case 42:
          _context2.prev = 42;
          _context2.t0 = _context2["catch"](4);

          if (!(session.transaction.state !== 'TRANSACTION_ABORTED')) {
            _context2.next = 47;
            break;
          }

          _context2.next = 47;
          return regeneratorRuntime.awrap(session.abortTransaction());

        case 47:
          console.error("ORDER_ERROR:", _context2.t0.message);
          return _context2.abrupt("return", {
            success: false,
            message: _context2.t0.message
          });

        case 49:
          _context2.prev = 49;
          session.endSession();
          return _context2.finish(49);

        case 52:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[4, 42, 49, 52]]);
} // --- STATS & HELPER FUNCTIONS ---


function updateOrderStatus(orderId, newStatus) {
  var updatedOrder;
  return regeneratorRuntime.async(function updateOrderStatus$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findByIdAndUpdate(orderId, {
            status: newStatus
          }, {
            "new": true
          }));

        case 5:
          updatedOrder = _context3.sent;

          if (updatedOrder) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", {
            success: false,
            message: "Order not found"
          });

        case 8:
          // Trigger Next.js to refresh the data on these pages
          (0, _cache.revalidatePath)("/admin/orders");
          (0, _cache.revalidatePath)("/dashboard/orders"); // If the order is marked as delivered, update the user's VIP status

          if (!(newStatus === "Delivered" && updatedOrder.user)) {
            _context3.next = 13;
            break;
          }

          _context3.next = 13;
          return regeneratorRuntime.awrap(syncVIPStatus(updatedOrder.user));

        case 13:
          return _context3.abrupt("return", {
            success: true,
            order: JSON.parse(JSON.stringify(updatedOrder))
          });

        case 16:
          _context3.prev = 16;
          _context3.t0 = _context3["catch"](0);
          console.error("UPDATE_STATUS_FAILED:", _context3.t0.message);
          return _context3.abrupt("return", {
            success: false,
            message: "Failed to update status"
          });

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 16]]);
}

function syncVIPStatus(userId) {
  var stats, totalSpent, isVIP;
  return regeneratorRuntime.async(function syncVIPStatus$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context4.next = 5;
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
          stats = _context4.sent;
          totalSpent = stats.length > 0 ? stats[0].total : 0;
          isVIP = totalSpent >= 10000;
          _context4.next = 10;
          return regeneratorRuntime.awrap(_User["default"].findByIdAndUpdate(userId, {
            totalSpent: totalSpent,
            isVIP: isVIP
          }));

        case 10:
          return _context4.abrupt("return", {
            success: true,
            totalSpent: totalSpent,
            isVIP: isVIP
          });

        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", {
            success: false
          });

        case 16:
        case "end":
          return _context4.stop();
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
      _args5 = arguments;
  return regeneratorRuntime.async(function getDashboardStats$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          period = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : "all";
          _context5.prev = 1;
          _context5.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          startDate = new Date(0);
          now = new Date();
          if (period === "7days") startDate = new Date(now.setDate(now.getDate() - 7));else if (period === "30days") startDate = new Date(now.setDate(now.getDate() - 30));else if (period === "year") startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          _context5.next = 9;
          return regeneratorRuntime.awrap(_Order["default"].aggregate([{
            $match: {
              status: {
                $ne: "Cancelled"
              },
              createdAt: {
                $gte: startDate
              }
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
          financialData = _context5.sent;
          financials = financialData[0] || {
            grossRevenue: 0,
            totalMfsFees: 0,
            totalDeliveryCharges: 0,
            orderCount: 0
          };
          return _context5.abrupt("return", {
            success: true,
            stats: {
              totalRevenue: financials.grossRevenue,
              netRevenue: financials.grossRevenue - financials.totalMfsFees - financials.totalDeliveryCharges,
              gatewayCosts: financials.totalMfsFees,
              deliveryCosts: financials.totalDeliveryCharges,
              orderCount: financials.orderCount
            }
          });

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](1);
          return _context5.abrupt("return", {
            success: false
          });

        case 17:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 14]]);
}

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
          query = {};
          if (status !== "All") query.status = status;

          if (search) {
            query.$or = [{
              _id: {
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
          _context6.next = 13;
          return regeneratorRuntime.awrap(Promise.all([_Order["default"].find(query).sort({
            createdAt: -1
          }).skip(skip).limit(limit).lean(), _Order["default"].countDocuments(query)]));

        case 13:
          _ref3 = _context6.sent;
          _ref4 = _slicedToArray(_ref3, 2);
          orders = _ref4[0];
          total = _ref4[1];
          return _context6.abrupt("return", {
            success: true,
            orders: JSON.parse(JSON.stringify(orders)),
            totalPages: Math.ceil(total / limit),
            totalOrders: total
          });

        case 20:
          _context6.prev = 20;
          _context6.t0 = _context6["catch"](4);
          return _context6.abrupt("return", {
            success: false,
            orders: [],
            totalPages: 0
          });

        case 23:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[4, 20]]);
}

function getOrderById(orderId) {
  var order;
  return regeneratorRuntime.async(function getOrderById$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context7.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].findById(orderId).lean());

        case 5:
          order = _context7.sent;
          return _context7.abrupt("return", order ? JSON.parse(JSON.stringify(order)) : null);

        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          return _context7.abrupt("return", null);

        case 12:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 9]]);
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

function getNewOrdersCount() {
  return regeneratorRuntime.async(function getNewOrdersCount$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _context10.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context10.next = 5;
          return regeneratorRuntime.awrap(_Order["default"].countDocuments({
            status: "Pending"
          }));

        case 5:
          return _context10.abrupt("return", _context10.sent);

        case 8:
          _context10.prev = 8;
          _context10.t0 = _context10["catch"](0);
          return _context10.abrupt("return", 0);

        case 11:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[0, 8]]);
}