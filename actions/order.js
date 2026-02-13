"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import InventoryLog from "@/models/InventoryLog";
import { createInAppNotification } from "@/actions/inAppNotifications";

export async function createOrder(orderData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const { 
      items, phone, totalAmount, userId, shippingAddress, 
      paidAmount, dueAmount, paymentMethod, 
      tran_id, paymentDetails // 🟢 New inputs for ledger tracking
    } = orderData;

    if (!userId) throw new Error("User ID is required.");

    // --- 🟢 FINANCIAL CALCULATIONS (Ledger Support) ---
    // Example: 2% fee for mobile banking, 0 for COD
    let mobileBankingFee = 0;
    if (["bKash", "Nagad", "Rocket", "Upay", "Card"].includes(paymentMethod)) {
      mobileBankingFee = Number((totalAmount * 0.02).toFixed(2)); 
    }

    // 1. Idempotency Check
    const existingOrder = await Order.findOne({
      "shippingAddress.phone": phone,
      totalAmount: totalAmount,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) } 
    }).session(session);

    if (existingOrder) {
      await session.abortTransaction();
      return { success: true, orderId: existingOrder._id.toString() };
    }

    // 2. Create the Order
    const [newOrder] = await Order.create([{
        user: userId, 
        items: items.map(i => ({
          product: i.productId || i.product || i._id,
          productName: i.productName || i.name || "Unnamed Product",
          variant: {
              name: i.variantName || i.color || i.variant?.name || "Default",
              size: i.size || i.variant?.size || "N/A",
              variantId: i.variantId || i.variant?._id
          },
          quantity: Number(i.quantity),
          price: Number(i.price),
          sku: i.sku || "N/A"
        })),
        shippingAddress,
        totalAmount,
        paidAmount,
        dueAmount,
        paymentMethod,
        mobileBankingFee, // 🟢 Saved for Financial Ledger
        tran_id,          // 🟢 Saved for Reference tracking
        paymentDetails: {
          source: phone, // Defaulting to order phone unless specified
          ...paymentDetails
        },
        status: "Pending",
        isStockReduced: false
    }], { session });

    // 3. Inventory logic (Unchanged logic)
    const productDeductions = items.reduce((acc, item) => {
      const pId = (item.productId || item.product || item._id).toString();
      const name = item.productName || item.name || "Product"; 
      if (!acc[pId]) acc[pId] = { totalQty: 0, variants: [], name: name };
      const qty = Number(item.quantity);
      acc[pId].totalQty += qty;
      const vId = item.variantId || item.variant?._id;
      if (vId) acc[pId].variants.push({ vId: vId.toString(), qty });
      return acc;
    }, {});

    const orderRef = `Order #${newOrder._id.toString().slice(-6).toUpperCase()}`;

    for (const [productId, data] of Object.entries(productDeductions)) {
      const product = await Product.findById(productId).session(session);
      if (!product) throw new Error(`Product ${data.name} not found.`);
      if (product.hasVariants) {
        data.variants.forEach(orderedVar => {
          const target = product.variants.id(orderedVar.vId);
          if (!target) throw new Error(`Variant not found for ${data.name}`);
          if (target.stock < orderedVar.qty) throw new Error(`Low stock for ${data.name}`);
          target.stock -= orderedVar.qty;
        });
        product.stock = product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      } else {
        if (product.stock < data.totalQty) throw new Error(`Low stock for ${data.name}`);
        product.stock -= data.totalQty;
      }
      await product.save({ session });
      await InventoryLog.create([{
        productId,
        productName: data.name,
        change: -data.totalQty,
        reason: "Order Placement",
        performedBy: orderRef
      }], { session });
    }

    await Order.updateOne({ _id: newOrder._id }, { isStockReduced: true }, { session });
    
    await createInAppNotification({
      title: "Order Placed! 🎉",
      message: `Your order ${orderRef} has been received and is being processed.`,
      type: "order",
      recipientId: userId,
      link: "/dashboard/orders"
    });

    await session.commitTransaction();
    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");
    return { success: true, orderId: newOrder._id.toString() };

  } catch (error) {
    if (session.transaction.state !== 'TRANSACTION_ABORTED') await session.abortTransaction();
    console.error("CREATE ORDER ERROR:", error);
    return { success: false, message: error.message };
  } finally {
    session.endSession();
  }
}

export async function updateOrderStatus(orderId, newStatus, trackingNumber = "") {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return { success: false, message: "Order not found" };
    }

    const oldStatus = order.status;
    const orderTag = order._id.toString().slice(-6).toUpperCase();

    // 1. Notification Logic
    let notifyTitle = "Order Updated";
    let notifyMessage = `The status of your Order #INV-${orderTag} is now ${newStatus}.`;

    if (newStatus === "Shipped") {
      notifyTitle = "Order Shipped! 🚚";
      notifyMessage = `Good news! Your order #INV-${orderTag} is on the way. ${trackingNumber ? `Track: ${trackingNumber}` : ''}`;
      if (trackingNumber) order.trackingNumber = trackingNumber; // 🟢 Save tracking ID
    } else if (newStatus === "Delivered") {
      notifyTitle = "Package Delivered! ✨";
      notifyMessage = `Your order #INV-${orderTag} has been successfully delivered.`;
      order.paymentStatus = "Paid"; // 🟢 Assume paid on delivery
      order.dueAmount = 0;
      order.paidAmount = order.totalAmount;
    } else if (newStatus === "Cancelled") {
      notifyTitle = "Order Cancelled ❌";
      notifyMessage = `Your order #INV-${orderTag} has been cancelled.`;
    }

    if (order.user) {
        await createInAppNotification({
          title: notifyTitle,
          message: notifyMessage,
          type: "order",
          recipientId: order.user,
          link: "/dashboard/orders"
        });
    }

    // 2. Stock Restoration
    if (newStatus === "Cancelled" && oldStatus !== "Cancelled" && order.isStockReduced) {
      const orderRef = `Cancel #${orderTag}`;
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) continue;
        if (product.hasVariants && item.variant?.variantId) {
          const target = product.variants.id(item.variant.variantId);
          if (target) {
            target.stock += item.quantity;
            product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          }
        } else {
          product.stock += item.quantity;
        }
        await product.save({ session });
        await InventoryLog.create([{
          productId: product._id,
          productName: product.name,
          change: item.quantity,
          reason: "Order Cancellation",
          performedBy: orderRef
        }], { session });
      }
      order.isStockReduced = false;
    }

    order.status = newStatus;
    await order.save({ session });
    await session.commitTransaction();

    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    
    if (newStatus === "Delivered" && order.user) await syncVIPStatus(order.user);

    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    if (session.inAtomicallyExecutableOperation()) await session.abortTransaction();
    return { success: false, message: "Failed to update status: " + error.message };
  } finally {
    session.endSession();
  }
}

export async function syncVIPStatus(userId) {
  try {
    await dbConnect();
    const stats = await Order.aggregate([
      { $match: { user: userId, status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSpent = stats.length > 0 ? stats[0].total : 0;
    const isVIP = totalSpent >= 10000;
    await User.findByIdAndUpdate(userId, { totalSpent, isVIP });
    return { success: true, totalSpent, isVIP };
  } catch (error) { return { success: false }; }
}

export async function getDashboardStats(period = "all") {
  try {
    await dbConnect();
    let startDate = new Date(0);
    const now = new Date();
    if (period === "7days") startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === "30days") startDate = new Date(now.setDate(now.getDate() - 30));
    else if (period === "year") startDate = new Date(now.setFullYear(now.getFullYear() - 1));

    const financialData = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: "$totalAmount" },
          totalMfsFees: { $sum: { $ifNull: ["$mobileBankingFee", 0] } },
          totalDeliveryCharges: { $sum: { $ifNull: ["$deliveryCharge", 0] } },
          orderCount: { $sum: 1 },
        },
      },
    ]);
    const financials = financialData[0] || { grossRevenue: 0, totalMfsFees: 0, totalDeliveryCharges: 0, orderCount: 0 };
    return {
      success: true,
      stats: {
        totalRevenue: financials.grossRevenue,
        netRevenue: financials.grossRevenue - financials.totalMfsFees - financials.totalDeliveryCharges,
        gatewayCosts: financials.totalMfsFees,
        deliveryCosts: financials.totalDeliveryCharges,
        orderCount: financials.orderCount,
      },
    };
  } catch (error) { return { success: false }; }
}

export async function getAllOrders(page = 1, limit = 10, search = "", status = "All") {
  try {
    await dbConnect();
    const query = {};
    
    if (status !== "All") query.status = status;

    if (search) {
      // 🟢 Check if the search string is a valid MongoDB ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

      if (isObjectId) {
        // If it's an ID, match it exactly
        query._id = search;
      } else {
        // If it's not an ID, search other string fields
        query.$or = [
          { "shippingAddress.name": { $regex: search, $options: "i" } },
          { "shippingAddress.phone": { $regex: search, $options: "i" } },
          // You can also search by the "status" text if needed
          { status: { $regex: search, $options: "i" } },
        ];
      }
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'items.product',
          select: 'imageUrl',
          model: Product
        })
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      success: true,
      orders: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    };
  } catch (error) { 
    console.error("Fetch Orders Error:", error);
    return { success: false, orders: [], totalPages: 0 }; 
  }
}

export async function getOrderById(orderId) {
  try {
    await dbConnect();
    // 🟢 Added population to match Admin Registry logic
    const order = await Order.findById(orderId)
      .populate({
        path: 'items.product',
        select: 'imageUrl minOrderQuantity', // Pulling fields needed for Buy Again
        model: Product
      })
      .lean();
      
    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch (error) { 
    console.error("Get Order Error:", error);
    return null; 
  }
}

export async function deleteOrder(orderId) {
  try {
    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) return { success: false, error: "Order not found" };
    const userId = order.user;
    await Order.findByIdAndDelete(orderId);
    if (userId) await syncVIPStatus(userId);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) { return { success: false, error: "Database error" }; }
}

export async function getUserOrders(userId) {
  try {
    await dbConnect();
    // 🟢 Added population here too so the Order History list shows images correctly
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.product',
        select: 'imageUrl',
        model: Product
      })
      .lean();
      
    return JSON.parse(JSON.stringify(orders));
  } catch (error) { 
    console.error("User Orders Error:", error);
    return []; 
  }
}

export async function getNewOrdersCount() {
  try {
    await dbConnect();
    return await Order.countDocuments({ status: "Pending" });
  } catch (error) { return 0; }
}