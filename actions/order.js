"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product"; 
import { revalidatePath } from "next/cache";
import { sendOrderConfirmationEmail, sendShippingUpdateEmail } from "@/lib/mail";

/**
 * GET ADJACENT ORDER IDs
 * Used for navigation inside the Order Details page.
 */
export async function getAdjacentOrderIds(userId, currentOrderId) {
  try {
    await dbConnect();
    
    const allOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();

    const currentIndex = allOrders.findIndex(
      (o) => o._id.toString() === currentOrderId
    );

    return {
      prev: currentIndex > 0 ? allOrders[currentIndex - 1]._id.toString() : null,
      next: currentIndex < allOrders.length - 1 ? allOrders[currentIndex + 1]._id.toString() : null,
      total: allOrders.length,
      currentPos: currentIndex + 1
    };
  } catch (error) {
    console.error("Error fetching adjacent orders:", error);
    return { prev: null, next: null, total: 0, currentPos: 0 };
  }
}

/**
 * GET NEW ORDERS COUNT (Admin Dashboard)
 */
export async function getNewOrdersCount() {
  try {
    await dbConnect();
    return await Order.countDocuments({ status: "Pending" });
  } catch (error) {
    console.error("Error fetching new orders count:", error);
    return 0;
  }
}

/**
 * 1. CREATE ORDER
 * Handles Stock deduction, Partial Payment logic, and Confirmation Email.
 */
export async function createOrder(orderData) {
  try {
    await dbConnect();
    
    // Format Items for Schema
    const formattedItems = orderData.items.map(item => ({
      product: item.productId,
      productName: item.name, 
      variant: {
        name: `${item.name} (${item.color} / ${item.size})`,
        image: item.imageUrl,
        size: item.size,
      },
      quantity: item.quantity,
      price: item.price,
    }));

    // Stock Validation & Update
    for (const item of orderData.items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product ${item.name} not found.`);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}`);
      }
      
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // 💡 Logic updated to handle dynamic delivery charge
    const totalAmount = Number(orderData.totalAmount); // Total including shipping
    const deliveryCharge = Number(orderData.deliveryCharge) || 0; // The fee based on location
    const paidAmount = Number(orderData.paidAmount) || 0; 
    const dueAmount = totalAmount - paidAmount;

    let paymentStatus = "Unpaid";
    if (dueAmount <= 0) {
      paymentStatus = "Paid";
    } else if (paidAmount > 0) {
      paymentStatus = "Partially Paid";
    }

    const newOrder = await Order.create({
      user: orderData.userId,
      items: formattedItems, 
      totalAmount: totalAmount,
      deliveryCharge: deliveryCharge, // 💡 Now saving to DB for the Success Page invoice
      paidAmount: paidAmount,
      dueAmount: dueAmount > 0 ? dueAmount : 0,
      shippingAddress: orderData.shippingAddress, // Using the object we sent from checkout
      status: "Pending",
      paymentStatus: paymentStatus,
      trackingNumber: "", 
    });

    // Send Confirmation Email
    try {
      const emailPayload = JSON.parse(JSON.stringify(newOrder.toObject()));
      await sendOrderConfirmationEmail(emailPayload);
    } catch (mailError) {
      console.error("Order created, but confirmation email failed:", mailError);
    }

    revalidatePath("/admin", "layout"); 
    revalidatePath("/dashboard/orders");
    
    return {
      success: true,
      orderId: newOrder._id.toString(),
      ...JSON.parse(JSON.stringify(newOrder.toObject())) 
    };
  } catch (error) {
    console.error("Order Creation Error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 2. UPDATE STATUS & TRACKING
 * Handles stock return on cancellation and shipping update emails.
 */
export async function updateOrderStatus(orderId, newStatus, trackingNumber = null) {
  try {
      await dbConnect();

      const oldOrder = await Order.findById(orderId);
      if (!oldOrder) throw new Error("Order not found");

      // Handle Stock Return on Cancellation
      if (newStatus === "Cancelled" && oldOrder.status !== "Cancelled") {
        for (const item of oldOrder.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      }

      const updateData = { status: newStatus };
      if (trackingNumber) updateData.trackingNumber = trackingNumber;

      // Auto-mark as paid when delivered
      if (newStatus === "Delivered") {
        updateData.paymentStatus = "Paid";
        updateData.dueAmount = 0;
        updateData.paidAmount = oldOrder.totalAmount;
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId, 
        updateData,
        { new: true }
      );

      // Trigger Shipping Email if status is changed to Shipped
      if (newStatus === "Shipped") {
        try {
          const emailPayload = JSON.parse(JSON.stringify(updatedOrder.toObject()));
          await sendShippingUpdateEmail(emailPayload);
        } catch (err) {
          console.error("Shipping update email failed:", err);
        }
      }
      
      revalidatePath("/admin", "layout");
      revalidatePath(`/admin/orders/${orderId}`);
      revalidatePath("/dashboard/orders");
      revalidatePath(`/dashboard/orders/${orderId}`);

      return { 
        success: true, 
        order: JSON.parse(JSON.stringify(updatedOrder)) 
      };
  } catch (error) {
      return { success: false, message: error.message };
  }
}

/**
 * 3. GETTERS
 */
export async function getOrderById(orderId) {
  try {
    await dbConnect();
    const order = await Order.findById(orderId).lean();
    if (!order) return null;
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    return null;
  }
}

export async function getUserOrders(userId) {
  try {
    await dbConnect();
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    return [];
  }
}

export async function getAllOrders() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    return [];
  }
}