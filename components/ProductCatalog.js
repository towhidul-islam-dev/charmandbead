"use client";

import { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import {
  MagnifyingGlassIcon,
  CameraIcon,
  XMarkIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { searchByImage } from '@/actions/visualSearch';
import toast, { Toaster } from "react-hot-toast";

export default function ProductCatalog({ initialProducts }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isImageLoading, setIsImageLoading] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const mainCategories = useMemo(() => {
        const unique = Array.from(new Set(initialProducts.map(p => p.category)));
        return ['All', ...unique];
    }, [initialProducts]);

    const subCategories = useMemo(() => {
        if (selectedCategory === 'All') return [];
        const filtered = initialProducts.filter(p => p.category === selectedCategory);
        const uniqueSub = Array.from(new Set(filtered.map(p => p.subCategory).filter(Boolean)));
        return ['All', ...uniqueSub];
    }, [initialProducts, selectedCategory]);

    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesMain = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSub = selectedSubCategory === 'All' || p.subCategory === selectedSubCategory;
            const matchesText = !debouncedSearch ||
                p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                p.category.toLowerCase().includes(debouncedSearch.toLowerCase());
            
            return matchesMain && matchesSub && matchesText;
        });
    }, [initialProducts, selectedCategory, selectedSubCategory, debouncedSearch]);

    const handleImageSearch = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsImageLoading(true);
        const loadingToast = toast.loading("Analyzing material...");
        try {
            const formData = new FormData();
            formData.append("image", file);
            const result = await searchByImage(formData);
            if (result.success && result.label) {
                setSearchQuery(result.label);
                toast.success(`Found: ${result.label}`, { id: loadingToast });
            }
        } catch (err) {
            toast.error("Search failed.", { id: loadingToast });
        } finally {
            setIsImageLoading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="min-h-screen px-4 py-8 mx-auto max-w-7xl md:py-16">
            <Toaster position="bottom-center" />

            {/* SEARCH & FILTER BOX */}
            <div className="sticky z-30 pt-4 mb-12 top-20">
                <div className="max-w-4xl mx-auto bg-white border border-gray-100 shadow-2xl rounded-3xl p-2 flex flex-col lg:flex-row items-stretch gap-2">
                    
                    {/* Search Input */}
                    <div className="relative flex-1 group">
                        <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2 group-focus-within:text-[#EA638C] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-4 pl-12 pr-4 text-sm font-bold text-gray-700 bg-transparent outline-none"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute -translate-y-1/2 right-4 top-1/2">
                                <XMarkIcon className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdowns Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-2 lg:pt-0 lg:pl-2">
                        
                        {/* Main Category Dropdown */}
                        <div className="relative w-full sm:w-48 group">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSelectedSubCategory('All');
                                }}
                                className="w-full appearance-none bg-gray-50 border border-transparent hover:border-gray-200 text-[#3E442B] px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all"
                            >
                                {mainCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute w-3 h-3 text-gray-400 pointer-events-none right-4 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Sub Category Dropdown (Conditional) */}
                        <div className={`relative w-full sm:w-48 transition-all duration-300 ${selectedCategory === 'All' ? 'opacity-30 pointer-events-none scale-95' : 'opacity-100'}`}>
                            <select
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                                className="w-full appearance-none bg-pink-50/50 border border-transparent hover:border-pink-100 text-[#EA638C] px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all"
                            >
                                <option value="All">All Types</option>
                                {subCategories.filter(s => s !== 'All').map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute w-3 h-3 text-[#EA638C]/50 pointer-events-none right-4 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Visual Search Button */}
                        <label className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl cursor-pointer transition-all w-full sm:w-auto ${isImageLoading ? 'bg-pink-100 text-[#EA638C]' : 'bg-[#3E442B] text-white hover:bg-black'}`}>
                            <CameraIcon className={`w-5 h-5 ${isImageLoading ? 'animate-spin' : ''}`} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageSearch} disabled={isImageLoading} />
                        </label>
                    </div>
                </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 gap-4 px-1 sm:gap-8 lg:grid-cols-4 md:px-0">
                {filteredProducts.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                ))}
            </div>

            {/* EMPTY STATE */}
            {filteredProducts.length === 0 && (
                <div className="py-32 text-center">
                    <p className="text-[10px] font-black tracking-widest text-gray-300 uppercase">
                        No products found in {selectedSubCategory !== 'All' ? selectedSubCategory : selectedCategory}
                    </p>
                    <button 
                        onClick={() => {setSelectedCategory('All'); setSelectedSubCategory('All'); setSearchQuery("");}}
                        className="mt-4 text-[10px] font-black text-[#EA638C] uppercase underline tracking-widest"
                    >
                        Reset All Filters
                    </button>
                </div>  
            )}
        </div>
    );
}