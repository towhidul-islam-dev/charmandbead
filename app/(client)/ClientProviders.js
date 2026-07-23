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
  dbImage,
}) {
  return (
    <NotificationProvider>
      <CartProvider>
        <WishlistProvider>
          <LoginNotifier />
          {/* SINGLE GLOBAL TOASTER CONTAINER */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#ffffff",
                color: "#3E442B",
                border: "1px solid #EA638C",
                padding: "12px 16px",
                fontSize: "13px",
                fontWeight: "700",
              },
              success: {
                iconTheme: {
                  primary: "#3E442B",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EA638C",
                  secondary: "#ffffff",
                },
              },
            }}
          />
          <ConnectivityListener />

          <div
            className={`${fontVariable} flex flex-col min-h-screen font-serif selection:bg-[#FBB6E6] selection:text-[#3E442B] relative`}
          >
            <Navbar globalData={globalData} dbImage={dbImage} />
            <main className="flex flex-col flex-1 w-full">{children}</main>
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </NotificationProvider>
  );
}