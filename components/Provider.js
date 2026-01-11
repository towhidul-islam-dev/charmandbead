"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/Context/CartContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        {/* Toast for "Added to Cart" or "Login Required" notifications */}
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </CartProvider>
    </SessionProvider>
  );
}