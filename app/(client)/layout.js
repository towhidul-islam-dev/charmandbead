import { Playfair_Display } from 'next/font/google';
import { getAdminGlobalData } from '@/lib/data';
import ClientProviders from './ClientProviders'; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

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
    default: 'CharmandBeads | Unlock Creativity | Premium Resin Charms & Beads | Wholesale Jewelry Materials Dhaka',
    template: '%s | CharmandBeads' 
  },
  description: 'Shop high-quality resin charms, glass beads, and stainless steel findings at Charm & Bead. Best wholesale prices for jewelry makers in Bangladesh.',
  metadataBase: new URL(process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://your-future-domain.com'), 
  openGraph: {
    type: 'website',
    siteName: 'Charm & Bead',
    images: [{ url: '/og-image.jpg' }],
  },
  icons: {
    icon: "/favicon1.svg", // Path to file in your /public folder
  },
};

export default async function ClientLayout({ children }) {
  const globalData = await getAdminGlobalData();

  const session = await getServerSession(authOptions);
  let dbUserImage = null;

  if (session?.user?.email) {
    try {
      await dbConnect();
      const user = await User.findOne({ email: session.user.email })
        .select("image")
        .lean();
      dbUserImage = user?.image || null;
    } catch (error) {
      console.error("Layout DB Fetch Error:", error);
    }
  }

  return (
    <ClientProviders 
      globalData={globalData} 
      fontVariable={playfair.variable}
      dbImage={dbUserImage}
    >
      {/* 🔴 Updated: Added flex flex-col */}
      <div className={`${playfair.variable} font-serif min-h-screen flex flex-col bg-white text-[#3E442B]`}>
        {children}
      </div>
    </ClientProviders>
  );
}