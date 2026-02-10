import { Playfair_Display } from 'next/font/google';
import { getAdminGlobalData } from '@/lib/data';
import ClientProviders from './ClientProviders'; 

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['italic', 'normal'],
  variable: '--font-playfair',
  display: 'swap',
});

export const viewport = {
  themeColor: "#EA638C",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: {
    default: 'Charm & Bead | Unlock Creativity',
    template: '%s | Charm & Bead' 
  },
  description: 'Source the finest materials for your jewelry workshop.',
  metadataBase: new URL(process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://your-future-domain.com'), 
  openGraph: {
    type: 'website',
    siteName: 'Charm & Bead',
    images: [{ url: '/og-image.jpg' }],
  },
};

export default async function ClientLayout({ children }) {
  const globalData = await getAdminGlobalData();

  return (
    /* 🟢 REMOVED <html> AND <body> TAGS */
    <ClientProviders 
      globalData={globalData} 
      fontVariable={playfair.variable}
    >
      {/* 🟢 Use a div or main wrapper to apply your brand font and colors */}
      <div className={`${playfair.variable} font-serif min-h-screen bg-white text-[#3E442B]`}>
        {children}
      </div>
    </ClientProviders>
  );
}