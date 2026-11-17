"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { getRandomArchiveProducts } from '@/actions/productActions';

const resolveProductImage = (product) => {
    if (!product) return null;
    const candidates = [
        product.imageUrl,
        product.image,
        Array.isArray(product.gallery) ? product.gallery[0] : null,
        Array.isArray(product.images) ? product.images[0] : null,
        Array.isArray(product.variants) && product.variants[0]
            ? (product.variants[0].imageUrl || product.variants[0].image)
            : null,
    ];
    const rawUrl = candidates.find(val => typeof val === 'string' && val.trim() !== '');
    if (!rawUrl) return null;
    if (rawUrl.startsWith('http://')) return rawUrl.replace('http://', 'https://');
    if (rawUrl.startsWith('https://') || rawUrl.startsWith('/')) return rawUrl;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${rawUrl}`;
    }
    return rawUrl;
};

export default function RandomProductsSlider({ initialProducts = [] }) {
    const sliderRef = useRef(null);
    const [products, setProducts] = useState(initialProducts);
    const [isFading, setIsFading] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    useEffect(() => {
        const refreshProducts = async () => {
            try {
                const data = await getRandomArchiveProducts(10);
                if (data?.success && data.products.length > 0) {
                    setIsFading(true);
                    setTimeout(() => {
                        setProducts(data.products);
                        setImageErrors({});
                        setIsFading(false);
                    }, 300);
                }
            } catch (err) {
                console.error("Error refreshing random archive:", err);
            }
        };

        if (!initialProducts || initialProducts.length === 0) {
            refreshProducts();
        }

        const interval = setInterval(refreshProducts, 60000); // 1 minute interval
        return () => clearInterval(interval);
    }, [initialProducts]);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const { scrollLeft, clientWidth } = sliderRef.current;
            const scrollAmount = clientWidth * 0.6;
            sliderRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <section className="w-full py-10 md:py-14 bg-white border-y border-gray-100 overflow-hidden">
            <style jsx global>{`
                @keyframes spin-gradient {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-gradient 4s linear infinite;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Smaller, Clean, Minimalist Header */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#EA638C] block mb-1">
                            Archive Discovery • Shuffles Every Min
                        </span>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#3E442B]">
                            Random <span className="text-[#EA638C]">Products Showcasing.</span>
                        </h2>
                    </div>

                    {/* Minimalist Navigation Arrows */}
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => scroll('left')}
                            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-[#3E442B] flex items-center justify-center hover:bg-[#3E442B] hover:text-white hover:border-[#3E442B] transition-all active:scale-95"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-[#3E442B] flex items-center justify-center hover:bg-[#3E442B] hover:text-white hover:border-[#3E442B] transition-all active:scale-95"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Slider Container */}
                <div 
                    ref={sliderRef}
                    className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-1 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product, idx) => {
                        const productId = product._id || idx;
                        const imageUrl = resolveProductImage(product);
                        const hasError = imageErrors[productId];
                        const productUrl = `/products/${product._id || product.slug}`;

                        return (
                            <Link 
                                key={productId}
                                href={productUrl}
                                className="group relative shrink-0 w-[160px] xs:w-[180px] sm:w-[210px] snap-start rounded-2xl p-[2px] transition-all duration-300 flex flex-col justify-between"
                            >
                                {/* 360-degree rotating gradient border container on hover */}
                                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <div className="absolute -inset-[50%] bg-[conic-gradient(from_0deg,#3E442B,#EA638C,#FBB6E6,#EA638C,#3E442B)] animate-spin-slow" />
                                </div>

                                {/* Inner Card Content */}
                                <div className="relative z-10 w-full h-full bg-white rounded-[14px] p-3 border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        {/* Image Container with Smooth Zoom Effect on Hover */}
                                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 flex items-center justify-center">
                                            {imageUrl && !hasError ? (
                                                <Image 
                                                    src={imageUrl} 
                                                    alt={product.name || 'Product'} 
                                                    fill 
                                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                    sizes="(max-width: 768px) 180px, 210px"
                                                    onError={() => {
                                                        setImageErrors(prev => ({ ...prev, [productId]: true }));
                                                    }}
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-gray-300 gap-1 p-2 text-center">
                                                    <ImageIcon className="w-6 h-6 opacity-40 text-[#3E442B]" />
                                                    <span className="text-[7px] font-black uppercase tracking-wider text-gray-400">Charm & Bead</span>
                                                </div>
                                            )}
                                            
                                            {/* Category Tag */}
                                            {product.categoryName && (
                                                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#3E442B] text-[6px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm z-10">
                                                    {product.categoryName}
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Title */}
                                        <h3 className="text-xs font-bold text-[#3E442B] line-clamp-1 group-hover:text-[#EA638C] transition-colors mb-1">
                                            {product.name}
                                        </h3>
                                    </div>

                                    {/* Price & Action Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <span className="text-xs font-black text-[#3E442B]">
                                            ৳{product.price || product.basePrice || '0'}
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-gray-50 text-[#3E442B] group-hover:bg-[#EA638C] group-hover:text-white flex items-center justify-center transition-colors">
                                            <ArrowRight size={12} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}