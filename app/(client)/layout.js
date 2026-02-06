import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import { CartProvider } from "@/Context/CartContext";
import { WishlistProvider } from "@/Context/WishlistContext"; 
import { Toaster } from "react-hot-toast";
import { Playfair_Display } from 'next/font/google';
import ConnectivityListener from "@/components/ConnectivityListener";
import LoginNotifier from "@/components/LoginNotifier";
import { getAdminGlobalData } from '@/lib/data';
import { NotificationProvider } from "@/Context/NotificationContext";

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['italic', 'normal'],
  variable: '--font-playfair',
});

// ✅ 1. NEW: Separated Viewport Export (Fixes Next.js 16 Build Warnings)
export const viewport = {
  themeColor: "#EA638C",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ✅ 2. UPDATED: Metadata Export (Structural fix only, content is identical)
export const metadata = {
  title: {
    default: 'Charm & Bead | Unlock Creativity',
    template: '%s | Charm & Bead' 
  },
  description: 'Source the finest materials for your jewelry workshop. Curated collection of premium beads, crystals, and design components.',
  keywords: ['jewelry making', 'beads', 'crystals', 'design materials', 'DIY jewelry'],
  authors: [{ name: 'Charm & Bead' }],
  creator: 'Charm & Bead',
  
  metadataBase: new URL(process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://your-future-domain.com'), 
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'Charm & Bead',
    title: 'Charm & Bead | Unlock Creativity',
    description: 'Source the finest materials for your jewelry workshop.',
    images: [
      {
        url: '/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'Charm & Bead Premium Materials',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Charm & Bead | Unlock Creativity',
    description: 'Source the finest materials for your jewelry workshop.',
    images: ['/og-image.jpg'], 
  },
};

export default async function ClientLayout({ children }) {
  // 🟢 Fetch arrival data (and others) from the server
  const globalData = await getAdminGlobalData();

  return (
    <NotificationProvider> {/* 🟢 Wrapper kept to fix the destructuring error */}
      <CartProvider>
        <WishlistProvider>
          <LoginNotifier />

          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            theme="light"
            toastOptions={{
              style: { 
                borderRadius: '1rem',
                border: '1px solid #EA638C',
                color: '#3E442B'
              },
            }}
          />

          <ConnectivityListener />

          <div className={`${playfair.variable} flex flex-col min-h-screen font-serif selection:bg-[#FBB6E6] selection:text-[#3E442B]`}>
            {/* 🟢 Navbar is inside the NotificationProvider, so the Bell will work */}
            <Navbar globalData={globalData} /> 

            <main className="flex flex-col flex-1"> 
              {children}
            </main>

            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </NotificationProvider>
  );
}