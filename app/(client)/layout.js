import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import { CartProvider } from "@/Context/CartContext";
import { WishlistProvider } from "@/Context/WishlistContext"; 
import { Toaster } from "react-hot-toast";
import { Playfair_Display } from 'next/font/google';
import ConnectivityListener from "@/components/ConnectivityListener"; // [ADD THIS]

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['italic', 'normal'],
  variable: '--font-playfair',
});

export const metadata = {
  title: 'Charm & Bead | Unlock Creativity',
  description: 'Source the finest materials for your jewelry workshop.',
};

export default function ClientLayout({ children }) {
  return (
    <CartProvider>
      <WishlistProvider>
        {/* Toast notifications */}
        <Toaster position="bottom-center" />

        {/* [NEW] Practical Internet Connection Popup */}
        <ConnectivityListener />

        <div className={`${playfair.variable} flex flex-col min-h-screen font-sans`}>
          
          <Navbar /> 

          {/* MAIN AREA:
            - flex-grow: pushes footer to bottom
            - min-h-[calc(100vh-80px)]: ensures no gap between main and footer on short pages
          */}
          <main className="flex-grow"> 
            {children}
          </main>

          <Footer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}