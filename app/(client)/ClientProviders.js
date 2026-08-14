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
          <ConnectivityListener />

          <div
            className={`${fontVariable} flex flex-col min-h-screen font-serif selection:bg-[#FBB6E6] selection:text-[#3E442B] relative`}
          >
            <Navbar globalData={globalData} dbImage={dbImage} />
            
            {/* 🟢 Added 'grow' and 'items-stretch' so child page components stretch full height */}
            <main className="flex flex-col flex-1 grow w-full bg-white ">
              {children}
            </main>
            
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </NotificationProvider>
  );
}