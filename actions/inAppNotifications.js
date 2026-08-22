"use server";

import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { revalidatePath } from "next/cache";

/**
 * Fetches notifications based on User ID and Global status
 */
export async function getNotificationsAction(userId) {
  try {
    await dbConnect();
    const notifications = await Notification.find({
      recipientId: { $in: ["GLOBAL", userId] },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(notifications)),
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

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Mark as Read Error:", error);
    return { success: false };
  }
}

/**
 * Marks all notifications for a specific user (including global ones) as read
 */
export async function markAllAsReadAction(userId) {
  try {
    await dbConnect();

    // Query condition to handle both user-specific and global unread notifications
    const query = userId
      ? { recipientId: { $in: ["GLOBAL", userId] }, isRead: false }
      : { isRead: false };

    await Notification.updateMany(query, { $set: { isRead: true } });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Mark All as Read Error:", error);
    return { success: false, error: error.message };
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
      createdAt: new Date(),
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newNotif)),
    };
  } catch (error) {
    console.error("Create Notif Error:", error);
    return { success: false };
  }
}