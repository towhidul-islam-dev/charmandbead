"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/Context/CartContext";
import { WishlistProvider } from "@/Context/WishlistContext";
import { NotificationProvider } from "@/Context/NotificationContext"; // 🟢 Added
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {/* 🟢 NotificationProvider must wrap the content to allow in-app alerts */}
      <NotificationProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster 
              position="bottom-center" 
              toastOptions={{
                duration: 3000,
                style: { 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  border: '1px solid #EA638C', // 🎀 Brand Pink Border
                  color: '#3E442B',            // 🌿 Brand Green Text
                  borderRadius: '1rem'
                }
              }} 
            />
            {children}
          </WishlistProvider>
        </CartProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}