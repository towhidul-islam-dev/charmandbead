"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  getNotificationsAction, 
  markAsReadAction, 
  markAllAsReadAction 
} from "@/actions/inAppNotifications";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { data: session, status } = useSession();

  // Safely extract user and derived ID
  const user = session?.user || null;
  const userId = user?.id || user?._id || "GUEST";

  // 1. Initial Load: Fetch from DB when session status is finalized
  useEffect(() => {
    if (status === "loading") return;

    const load = async () => {
      const res = await getNotificationsAction(userId);
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    };

    load();
    // 🟢 Fixed: Keep dependencies stable with fixed array size
  }, [session, status]); 

  const addNotification = (notifObject) => {
    setNotifications((prev) => [notifObject, ...prev]);
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markAsReadAction(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllAsReadAction(userId);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        user,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};