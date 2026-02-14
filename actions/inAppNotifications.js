"use server";

import dbConnect from "@/lib/mongodb"; // Adjust path to your DB config
import Notification from "@/models/Notification"; // Adjust path to your Model
import { revalidatePath } from "next/cache";

/**
 * Fetches notifications based on User ID and Global status
 */
export async function getNotificationsAction(userId) {
  try {
    await dbConnect();
    const notifications = await Notification.find({
      recipientId: { $in: ["GLOBAL", userId] }
    })
    .sort({ createdAt: -1 })
    .limit(20);

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(notifications)) 
    };
  } catch (error) {
    console.error("Fetch Notif Error:", error);
    return { success: false, data: [] };
  }
}

/**
 * Marks a specific notification as read in the DB
 */
export async function markAsReadAction(notificationId) {
  try {
    await dbConnect();
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    
    // Optional: clears the cache for the layout/navbar
    revalidatePath("/"); 
    
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Creates a notification (Used by SuccessPage and ProductForm)
 */
export async function createInAppNotification({ title, message, type, recipientId, link }) {
  try {
    await dbConnect();
    const newNotif = await Notification.create({
      title,
      message,
      type,
      recipientId,
      link,
      isRead: false,
      createdAt: new Date()
    });

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(newNotif)) 
    };
  } catch (error) {
    console.error("Create Notif Error:", error);
    return { success: false };
  }
}

export async function markAsReadAction(notificationId) {
  try {
    await dbConnect();
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    revalidatePath("/"); 
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}