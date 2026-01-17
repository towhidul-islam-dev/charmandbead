"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/Context/CartContext";
import { WishlistProvider } from "@/Context/WishlistContext"; // Don't forget this!
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    // refetchInterval={0} prevents NextAuth from constantly pinging the server
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <CartProvider>
        <WishlistProvider>
          {/* Change Toaster to bottom-center for better mobile performance (less layout shift) */}
          <Toaster 
            position="bottom-center" 
            toastOptions={{
              duration: 3000,
              style: { fontSize: '12px', fontWeight: 'bold' }
            }} 
          />
          {children}
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}