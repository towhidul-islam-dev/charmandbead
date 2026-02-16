"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { Toaster } from "react-hot-toast";

export default function ProductCatalog({ initialProducts }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Read category from URL (using ID for filtering logic)
    const categoryFromUrl = searchParams.get('category') || 'All';

    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Sync state with browser URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedCategory !== 'All') {
            params.set('category', selectedCategory);
        } else {
            params.delete('category');
        }
        router.push(`?${params.toString()}`, { scroll: false });
    }, [selectedCategory, router, searchParams]);

    // Search debounce
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // 🟢 Extract Unique Categories using the names we just added to getProducts
    const mainCategories = useMemo(() => {
        const categoryMap = new Map();
        initialProducts.forEach(p => {
            if (p.category && !categoryMap.has(p.category)) {
                categoryMap.set(p.category, p.categoryName || "Collection");
            }
        });
        const list = Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }));
        return [{ id: 'All', name: 'All Categories' }, ...list];
    }, [initialProducts]);

    // 🟢 Extract Unique Sub-Categories based on selected Category
    const subCategories = useMemo(() => {
        if (selectedCategory === 'All') return [];
        
        const subMap = new Map();
        const filtered = initialProducts.filter(p => p.category === selectedCategory);
        
        filtered.forEach(p => {
            if (p.subCategory && !subMap.has(p.subCategory)) {
                subMap.set(p.subCategory, p.subCategoryName || "Type");
            }
        });

        const list = Array.from(subMap.entries()).map(([id, name]) => ({ id, name }));
        return [{ id: 'All', name: 'All Types' }, ...list];
    }, [initialProducts, selectedCategory]);

    // 🟢 Filtering Logic
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesMain = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSub = selectedSubCategory === 'All' || p.subCategory === selectedSubCategory;
            const matchesText = !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
            return matchesMain && matchesSub && matchesText;
        });
    }, [initialProducts, selectedCategory, selectedSubCategory, debouncedSearch]);

    // Brand Colors Applied
    const inputClass = "w-full appearance-none bg-gray-50 border border-transparent hover:border-gray-200 text-[#3E442B] px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all";
    const subInputClass = "w-full appearance-none bg-pink-50/50 border border-transparent hover:border-pink-100 text-[#EA638C] px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all";

    return (
        <div className="min-h-screen px-4 py-8 mx-auto max-w-7xl md:py-16">
            <Toaster position="bottom-center" />

            <div className="sticky z-30 pt-4 mb-12 top-20">
                <div className="flex flex-col items-stretch max-w-4xl gap-2 p-2 mx-auto bg-white border border-gray-100 shadow-2xl rounded-3xl lg:flex-row">
                    
                    <div className="relative flex-1 group">
                        <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2 group-focus-within:text-[#EA638C] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-4 pl-12 pr-4 text-sm font-bold text-gray-700 bg-transparent outline-none"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-100 sm:flex-row lg:border-t-0 lg:border-l lg:pt-0 lg:pl-2">
                        {/* Main Category Dropdown */}
                        <div className="relative w-full sm:w-48 group">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSelectedSubCategory('All');
                                }}
                                className={inputClass}
                            >
                                {mainCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute w-3 h-3 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2" />
                        </div>

                        {/* Sub Category Dropdown */}
                        <div className={`relative w-full sm:w-48 transition-all duration-300 ${selectedCategory === 'All' ? 'opacity-30 pointer-events-none scale-95' : 'opacity-100'}`}>
                            <select
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                                className={subInputClass}
                            >
                                {subCategories.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute w-3 h-3 text-[#EA638C]/50 pointer-events-none right-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-1 sm:gap-8 lg:grid-cols-4 md:px-0">
                {filteredProducts.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                ))}
            </div>
            
            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="py-32 text-center bg-white border border-dashed border-[#FBB6E6]/40 rounded-[3rem]">
                    <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase leading-relaxed">
                        No treasures match your selection.
                    </p>
                </div>
            )}
        </div>
    );
}