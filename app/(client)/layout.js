import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import { CartProvider } from "@/Context/CartContext";
import { WishlistProvider } from "@/Context/WishlistContext"; 
import { Toaster } from "react-hot-toast";
import { Playfair_Display } from 'next/font/google';
import ConnectivityListener from "@/components/ConnectivityListener";

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['italic', 'normal'],
  variable: '--font-playfair',
});

// 🟢 ENHANCED GLOBAL SEO
export const metadata = {
  title: {
    default: 'Charm & Bead | Unlock Creativity',
    template: '%s | Charm & Bead' // This automatically adds your brand name to every page title
  },
  
  description: 'Source the finest materials for your jewelry workshop. Curated collection of premium beads, crystals, and design components.',
  keywords: ['jewelry making', 'beads', 'crystals', 'design materials', 'DIY jewelry'],
  authors: [{ name: 'Charm & Bead' }],
  creator: 'Charm & Bead',
  // metadataBase: new URL('https://your-domain.com'), // 🟢 IMPORTANT: Replace with your actual live URL
  metadataBase: new URL(process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://your-future-domain.com'),
  
  // 🟢 SOCIAL MEDIA PREVIEWS (OpenGraph)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'Charm & Bead',
    title: 'Charm & Bead | Unlock Creativity',
    description: 'Source the finest materials for your jewelry workshop.',
    images: [
      {
        url: '/og-image.jpg', // Create a 1200x630 image in your /public folder for shared links
        width: 1200,
        height: 630,
        alt: 'Charm & Bead Premium Materials',
      },
    ],
  },
  
  // 🟢 TWITTER / X CARDS
  twitter: {
    card: 'summary_large_image',
    title: 'Charm & Bead | Unlock Creativity',
    description: 'Source the finest materials for your jewelry workshop.',
    images: ['/og-image.jpg'], 
  },

  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5, // Important for Accessibility!
  },
  other: {
    'preconnect': ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function ClientLayout({ children }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <Toaster position="bottom-center" />
        <ConnectivityListener />

        <div className={`${playfair.variable} flex flex-col min-h-screen font-serif`}>
          <Navbar /> 
          <main className="flex-grow"> 
            {children}
          </main>
          <Footer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}