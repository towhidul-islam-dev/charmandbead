"use client";

import { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard'; 
import { 
  MagnifyingGlassIcon, 
  CameraIcon, 
  AdjustmentsHorizontalIcon, 
  XMarkIcon 
} from "@heroicons/react/24/outline";
import { searchByImage } from '@/actions/visualSearch';
import toast, { Toaster } from "react-hot-toast";

export default function ProductCatalog({ initialProducts }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState("");
    // Optimization: Separate the raw input from the "applied" filter
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isImageLoading, setIsImageLoading] = useState(false);

    // --- DEBOUNCE LOGIC ---
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300); // 300ms delay
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Categories memo remains efficient
    const categories = useMemo(() => {
        const unique = Array.from(new Set(initialProducts.map(p => p.category)));
        return ['All', ...unique];
    }, [initialProducts]);
    
    // --- FILTERED PRODUCTS (Uses debouncedSearch) ---
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesText = !debouncedSearch || 
                p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                p.category.toLowerCase().includes(debouncedSearch.toLowerCase());
            return matchesCategory && matchesText;
        });
    }, [initialProducts, selectedCategory, debouncedSearch]);

    const handleImageSearch = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            toast.error("Image too large. Please use under 4MB.");
            return;
        }

        setIsImageLoading(true);
        const loadingToast = toast.loading("Analyzing material...");

        try {
            const formData = new FormData();
            formData.append("image", file);
            const result = await searchByImage(formData);
            
            if (result.success && result.label) {
                setSearchQuery(result.label);
                toast.success(`Found: ${result.label}`, { id: loadingToast });
            } else {
                toast.error("Recognition failed.", { id: loadingToast });
            }
        } catch (err) {
            toast.error("Search failed.", { id: loadingToast });
        } finally {
            setIsImageLoading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="min-h-screen px-2 py-8 mx-auto max-w-7xl sm:px-4 md:py-16">
            <Toaster position="bottom-center" />
            
            {/* SEARCH BAR */}
            <div className="sticky z-30 pt-4 mb-10 top-20 md:mb-16">
                <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl md:rounded-3xl p-1.5 md:p-2 flex flex-col md:flex-row items-center gap-2">
                    
                    <div className="relative flex-1 w-full">
                        <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 text-sm font-bold text-gray-700 bg-transparent outline-none md:pl-12 md:py-4"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute -translate-y-1/2 right-4 top-1/2">
                                <XMarkIcon className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center w-full gap-2 pt-2 border-t border-gray-100 md:w-auto md:border-t-0 md:border-l md:pt-0 md:pl-2">
                        <label className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all flex-1 md:flex-none ${isImageLoading ? 'bg-pink-100 text-[#EA638C]' : 'bg-gray-50 hover:bg-pink-50 text-[#3E442B]'}`}>
                            <CameraIcon className={`w-5 h-5 ${isImageLoading ? 'animate-spin' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isImageLoading ? '...' : 'Visual'}
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageSearch} disabled={isImageLoading} />
                        </label>

                        <div className="relative flex-1 md:flex-none">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="appearance-none bg-[#3E442B] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase pr-10 outline-none cursor-pointer w-full"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <AdjustmentsHorizontalIcon className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none right-3 top-1/2 text-white/70" />
                        </div>
                    </div>
                </div>
            </div>

            {/* PRODUCT GRID - Optimization: Pass index for Image priority */}
            <div className="grid grid-cols-2 gap-3 px-1 sm:gap-8 lg:grid-cols-4 md:px-0">
                {filteredProducts.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                ))}
            </div>

            {/* EMPTY STATE */}
            {filteredProducts.length === 0 && (
                <div className="py-32 text-center">
                    <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        No materials found matching your search.
                    </p>
                </div>
            )}
        </div>
    );
}