"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import InventoryLog from "@/models/InventoryLog";
import { createInAppNotification } from "@/actions/inAppNotifications";

// Helper to safely escape regex search strings to avoid MongoDB query crashes
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export async function createOrder(orderData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const { 
      items, 
      phone, 
      totalAmount, 
      userId, 
      shippingAddress, 
      paidAmount, 
      dueAmount, 
      paymentMethod, 
      deliveryCharge,
      mobileBankingFee: frontendFee,
      tran_id, 
      paymentDetails 
    } = orderData;

    if (!userId) throw new Error("User ID is required.");
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Cannot create an order with empty items.");
    }

    // --- FINANCIAL CALCULATIONS ---
    let finalMobileBankingFee = frontendFee || 0;
    if (!finalMobileBankingFee && paymentMethod !== "COD") {
      finalMobileBankingFee = Number((totalAmount * 0.015).toFixed(2)); 
    }

    const normalizedTotal = Number(Number(totalAmount).toFixed(2));

    // 1. Idempotency Check (Prevents duplicate accidental submissions)
    const existingOrder = await Order.findOne({
      user: userId,
      totalAmount: normalizedTotal,
      createdAt: { $gte: new Date(Date.now() - 30 * 1000) }
    }).session(session);

    if (existingOrder) {
      await session.abortTransaction();
      return { success: true, orderId: existingOrder._id.toString() };
    }

    // 2. Extract Payment Identifiers safely
    const extractedTxnId = paymentDetails?.transactionId || tran_id || orderData.transactionId || "";
    const extractedSenderPhone = paymentDetails?.sourcePhone || orderData.senderPhone || "";

    // 3. Create the Order Document
    const [newOrder] = await Order.create([{
        user: userId, 
        items: items.map(i => ({
          product: i.productId || i.product || i._id,
          productName: i.productName || i.name || "Unnamed Product",
          variant: {
            name: i.variant?.name || i.color || "Default",
            size: i.size || i.variant?.size || "N/A",
            variantId: i.variantId || i.variant?._id || i.variant?.variantId || null,
            image: i.variant?.image || i.image || null
          },
          quantity: Math.max(1, Number(i.quantity) || 1),
          price: Number(i.price) || 0,
          sku: i.sku || "N/A"
        })),
        shippingAddress,
        totalAmount: normalizedTotal,
        paidAmount,
        dueAmount,
        paymentMethod,
        deliveryCharge: Number(deliveryCharge || 0),
        mobileBankingFee: Number(finalMobileBankingFee), 
        tran_id: extractedTxnId,
        paymentDetails: {
          sourcePhone: extractedSenderPhone,
          transactionId: extractedTxnId,
          deliveryPhone: phone,
          gatewayStatus: paymentDetails?.gatewayStatus || "MANUAL_VERIFICATION"
        },
        status: "Pending",
        isStockReduced: false
    }], { session });

    // 4. Group Deductions per Product & Variant
    const productDeductions = items.reduce((acc, item) => {
      const rawProductId = item.productId || item.product || item._id;
      if (!rawProductId) return acc;
      
      const pId = rawProductId.toString();
      const name = item.productName || item.name || "Product"; 
      if (!acc[pId]) acc[pId] = { totalQty: 0, variants: {}, name: name };
      
      const qty = Math.max(1, Number(item.quantity) || 1);
      acc[pId].totalQty += qty;
      
      const vId = item.variantId || item.variant?._id || item.variant?.variantId;
      const key = vId ? vId.toString() : (item.sku || "default");
      
      if (!acc[pId].variants[key]) {
        acc[pId].variants[key] = { vId: vId ? vId.toString() : null, qty: 0, sku: item.sku };
      }
      acc[pId].variants[key].qty += qty;
      
      return acc;
    }, {});

    const orderRef = `Order #${newOrder._id.toString().slice(-6).toUpperCase()}`;

    // 5. Process Stock Deductions
    for (const [productId, data] of Object.entries(productDeductions)) {
      const product = await Product.findById(productId).session(session);
      if (!product) throw new Error(`Product "${data.name}" not found.`);

      // Server-Side Minimum Order Quantity (MOQ) Validation
      const minQty = Number(product.minOrderQuantity) || 1;
      if (data.totalQty < minQty) {
        throw new Error(`Order quantity for ${data.name} (${data.totalQty}) is below Minimum Order Quantity (${minQty}).`);
      }

      if (product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0) {
        for (const orderedVar of Object.values(data.variants)) {
          const searchId = orderedVar.vId;
          
          let target = product.variants.find((v) => {
            const idMatch = v._id && v._id.toString() === searchId;
            const skuMatch = orderedVar.sku && v.sku && v.sku === orderedVar.sku;
            return idMatch || skuMatch;
          });

          if (!target && searchId && typeof product.variants.id === "function") {
            target = product.variants.id(searchId);
          }

          if (!target && product.variants.length === 1) {
            target = product.variants[0];
          }

          if (!target) {
            throw new Error(`Variant selection not found for product "${data.name}".`);
          }

          const currentVariantStock = Number(target.stock) || 0;
          if (currentVariantStock < orderedVar.qty) {
            throw new Error(`Insufficient stock for ${data.name} (${target.name || target.color || target.size || "Variant"}): Only ${currentVariantStock} left.`);
          }

          // Atomic deduction on variant stock
          await Product.updateOne(
            { _id: productId, "variants._id": target._id, "variants.stock": { $gte: orderedVar.qty } },
            { $inc: { "variants.$.stock": -orderedVar.qty } },
            { session }
          );
        }

        // Re-fetch product to update overall stock
        const updatedProd = await Product.findById(productId).session(session);
        updatedProd.stock = updatedProd.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
        await updatedProd.save({ session });

      } else {
        const currentStock = Number(product.stock) || 0;
        if (currentStock < data.totalQty) {
          throw new Error(`Stock error: ${data.name} only has ${currentStock} units in stock.`);
        }

        await Product.updateOne(
          { _id: productId, stock: { $gte: data.totalQty } },
          { $inc: { stock: -data.totalQty } },
          { session }
        );
      }

      await InventoryLog.create([{
        productId,
        productName: data.name,
        change: -data.totalQty,
        reason: "Order Placement",
        performedBy: orderRef
      }], { session });
    }

    newOrder.isStockReduced = true;
    await newOrder.save({ session });
    
    await createInAppNotification({
      title: "Order Placed! 🎉",
      message: `Your wholesale-ready order ${orderRef} has been received.`,
      type: "order",
      recipientId: userId,
      link: "/dashboard/orders"
    });

    await session.commitTransaction();

    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, orderId: newOrder._id.toString() };

  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (e) {
      // Transaction already aborted
    }
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
      if (trackingNumber) order.trackingNumber = trackingNumber;
    } else if (newStatus === "Delivered") {
      notifyTitle = "Package Delivered! ✨";
      notifyMessage = `Your order #INV-${orderTag} has been successfully delivered.`;
      order.paymentStatus = "Paid";
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

    // 2. Stock Restoration on Cancellation
    if (newStatus === "Cancelled" && oldStatus !== "Cancelled" && order.isStockReduced) {
      const orderRef = `Cancel #${orderTag}`;
      for (const item of order.items) {
        if (!item.product) continue;
        const product = await Product.findById(item.product).session(session);
        if (!product) continue;
        
        const itemQty = Number(item.quantity) || 0;

        if (product.hasVariants && (item.variant?.variantId || item.variant?._id)) {
          const targetId = (item.variant.variantId || item.variant._id).toString();
          let target = product.variants.find(
            (v) => (v._id && v._id.toString() === targetId) || (v.sku && v.sku === item.sku)
          );

          if (!target && typeof product.variants.id === "function") {
            target = product.variants.id(targetId);
          }

          if (target) {
            await Product.updateOne(
              { _id: product._id, "variants._id": target._id },
              { $inc: { "variants.$.stock": itemQty } },
              { session }
            );

            const updatedProd = await Product.findById(product._id).session(session);
            updatedProd.stock = updatedProd.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
            await updatedProd.save({ session });
          }
        } else {
          await Product.updateOne(
            { _id: product._id },
            { $inc: { stock: itemQty } },
            { session }
          );
        }

        await InventoryLog.create([{
          productId: product._id,
          productName: product.name,
          change: itemQty,
          reason: "Order Cancellation",
          performedBy: orderRef
        }], { session });
      }
      order.isStockReduced = false;
    }

    order.status = newStatus;
    await order.save({ session });
    await session.commitTransaction();

    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    revalidatePath("/products");
    revalidatePath("/");
    
    if (newStatus === "Delivered" && order.user) await syncVIPStatus(order.user);

    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (e) {
      // Transaction already aborted
    }
    return { success: false, message: "Failed to update status: " + error.message };
  } finally {
    session.endSession();
  }
}

export async function deleteOrder(orderId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return { success: false, error: "Order not found" };
    }

    // Restore stock if the order had reduced stock
    if (order.isStockReduced && order.status !== "Cancelled") {
      const orderTag = order._id.toString().slice(-6).toUpperCase();
      const orderRef = `Deletion #${orderTag}`;

      for (const item of order.items) {
        if (!item.product) continue;
        const product = await Product.findById(item.product).session(session);
        if (!product) continue;

        const itemQty = Number(item.quantity) || 0;

        if (product.hasVariants && (item.variant?.variantId || item.variant?._id)) {
          const targetId = (item.variant.variantId || item.variant._id).toString();
          let target = product.variants.find(
            (v) => (v._id && v._id.toString() === targetId) || (v.sku && v.sku === item.sku)
          );

          if (target) {
            await Product.updateOne(
              { _id: product._id, "variants._id": target._id },
              { $inc: { "variants.$.stock": itemQty } },
              { session }
            );

            const updatedProd = await Product.findById(product._id).session(session);
            updatedProd.stock = updatedProd.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
            await updatedProd.save({ session });
          }
        } else {
          await Product.updateOne(
            { _id: product._id },
            { $inc: { stock: itemQty } },
            { session }
          );
        }

        await InventoryLog.create([{
          productId: product._id,
          productName: product.name,
          change: itemQty,
          reason: "Order Deletion",
          performedBy: orderRef
        }], { session });
      }
    }

    const userId = order.user;
    await Order.findByIdAndDelete(orderId).session(session);
    await session.commitTransaction();

    if (userId) await syncVIPStatus(userId);

    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) { 
    try {
      await session.abortTransaction();
    } catch (e) {}
    return { success: false, error: "Database error: " + error.message }; 
  } finally {
    session.endSession();
  }
}

export async function syncVIPStatus(userId) {
  try {
    await dbConnect();
    const targetUserId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const stats = await Order.aggregate([
      { $match: { user: targetUserId, status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSpent = stats.length > 0 ? stats[0].total : 0;
    const isVIP = totalSpent >= 10000;
    await User.findByIdAndUpdate(userId, { totalSpent, isVIP });
    return { success: true, totalSpent, isVIP };
  } catch (error) { 
    return { success: false, error: error.message }; 
  }
}

export async function getDashboardStats(period = "all") {
  try {
    await dbConnect();
    let startDate = new Date(0);
    const now = new Date();
    if (period === "7days") startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === "30days") startDate = new Date(now.setDate(now.getDate() - 30));
    else if (period === "year") startDate = new Date(now.setFullYear(now.getFullYear() - 1));

    const totalUsers = await User.countDocuments();

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

    let conversionRate = 0;
    if (totalUsers > 0) {
      conversionRate = Number(((financials.orderCount / totalUsers) * 100).toFixed(1));
    }

    return {
      success: true,
      stats: {
        totalRevenue: financials.grossRevenue,
        netRevenue: financials.grossRevenue - financials.totalMfsFees - financials.totalDeliveryCharges,
        gatewayCosts: financials.totalMfsFees,
        deliveryCosts: financials.totalDeliveryCharges,
        orderCount: financials.orderCount,
        totalUsers: totalUsers || 0,
        conversionRate: conversionRate || 0,
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
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

      if (isObjectId) {
        query._id = search;
      } else {
        const safeSearch = escapeRegex(search);
        query.$or = [
          { "shippingAddress.name": { $regex: safeSearch, $options: "i" } },
          { "shippingAddress.phone": { $regex: safeSearch, $options: "i" } },
          { status: { $regex: safeSearch, $options: "i" } },
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
    const order = await Order.findById(orderId)
      .populate({
        path: 'items.product',
        select: 'imageUrl minOrderQuantity',
        model: Product
      })
      .lean();
      
    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch (error) { 
    console.error("Get Order Error:", error);
    return null; 
  }
}

export async function getUserOrders(userId) {
  try {
    await dbConnect();
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