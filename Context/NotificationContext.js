"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getNotificationsAction, markAsReadAction } from "@/actions/inAppNotifications";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // 🟢 Destructure 'status' to prevent premature execution
  const { data: session, status } = useSession();

  // 1. Initial Load: Fetch from DB when session status is finalized
  useEffect(() => {
    // 🟢 Don't attempt to load while NextAuth is still checking the session
    if (status === "loading") return;

    const load = async () => {
      // Pass the user ID if authenticated, or "GUEST"
      const userId = status === "authenticated" ? session?.user?.id : "GUEST";
      
      const res = await getNotificationsAction(userId);
      if (res.success) {
        setNotifications(res.data);
      }
    };

    load();
  }, [session, status]); // 🟢 Added status to dependency array

  const addNotification = (notifObject) => {
    setNotifications((prev) => [notifObject, ...prev]);
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    await markAsReadAction(id);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        markAllAsRead,
        unreadCount: notifications.filter(n => !n.isRead).length 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);