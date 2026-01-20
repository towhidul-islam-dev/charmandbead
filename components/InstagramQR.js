"use client"; // 🟢 This tells Next.js this is a Client Component

import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

export default function InstagramQR({ url }) {
  const [mounted, setMounted] = useState(false);

  // Only render after the component has mounted in the browser
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[180px] h-[180px] bg-gray-50 animate-pulse rounded-xl" />
    );
  }

  return (
    <QRCode 
      value={url}
      size={180}
      fgColor="#3E442B"
      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
    />
  );
}