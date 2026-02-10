"use client";

import { CartProvider } from "@/Context/CartContext";
import { WishlistProvider } from "@/Context/WishlistContext";
import { NotificationProvider } from "@/Context/NotificationContext";
import { Toaster } from "react-hot-toast";
import ConnectivityListener from "@/components/ConnectivityListener";
import LoginNotifier from "@/components/LoginNotifier";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ClientProviders({
  children,
  globalData,
  fontVariable,
}) {
  return (
    <NotificationProvider>
      <CartProvider>
        <WishlistProvider>
          <LoginNotifier />
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="light"
            toastOptions={{
              success: {
                iconTheme: {
                  primary: "#3E442B", // Green
                  secondary: "#fff",
                },
                style: {
                  border: "1px solid #EA638C", // Brand Pink
                },
              },
            }}
          />
          <ConnectivityListener />

          <div
            className={`${fontVariable} flex flex-col min-h-screen font-serif selection:bg-[#FBB6E6] selection:text-[#3E442B]`}
          >
            <Navbar globalData={globalData} />
            <main className="flex flex-col flex-1">{children}</main>
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </NotificationProvider>
  );
}
