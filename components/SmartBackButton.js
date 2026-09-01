"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SmartBackButton({ categorySlug }) {
  const router = useRouter();

  const fallbackHref = categorySlug
    ? `/products?category=${categorySlug}`
    : "/products";

  const handleBackClick = (e) => {
    const isInternalNavigation =
      typeof window !== "undefined" &&
      document.referrer &&
      document.referrer.includes(window.location.host);

    if (isInternalNavigation) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link
      href={fallbackHref}
      onClick={handleBackClick}
      className="group relative inline-flex items-center gap-2 py-2 px-1 mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#3E442B] hover:text-[#EA638C] transition-colors duration-300"
    >
      <ArrowLeft size={16} className="text-[#EA638C] group-hover:-translate-x-1.5 transition-transform duration-300" />
      <span>Back</span>

      {/* Animated Underline Track */}
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#EA638C] to-[#FBB6E6] group-hover:w-full transition-all duration-300 rounded-full" />
    </Link>
  );
}