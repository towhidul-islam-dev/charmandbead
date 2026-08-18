"use client";

import { SessionProvider } from "next-auth/react";
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
    <SessionProvider>
      <NotificationProvider>
        <CartProvider>
          <WishlistProvider>
            <LoginNotifier />
            <ConnectivityListener />

            <div
              className={`${fontVariable} flex flex-col min-h-screen font-serif selection:bg-[#FBB6E6] selection:text-[#3E442B] relative`}
            >
              <Navbar globalData={globalData} dbImage={dbImage} />
              
              <main className="flex flex-col flex-1 w-full bg-white grow">
                {children}
              </main>
              
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}