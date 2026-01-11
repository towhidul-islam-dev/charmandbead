"use client";

import { useState } from 'react';
import ProductCard from './ProductCard'; 
import { 
  MagnifyingGlassIcon, 
  CameraIcon, 
  AdjustmentsHorizontalIcon, 
  XMarkIcon 
} from "@heroicons/react/24/outline";

export default function ProductCatalog({ initialProducts }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState("");
    const [isImageLoading, setIsImageLoading] = useState(false);
    
    const allCategories = initialProducts.map(p => p.category);
    const uniqueCategories = Array.from(new Set(allCategories));
    const categories = ['All', ...uniqueCategories];
    
    const filteredProducts = initialProducts.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesText = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesText;
    });

    return (
        <div className="min-h-screen px-2 py-8 mx-auto max-w-7xl sm:px-4 md:py-16">
            
            {/* --- FANCY SEARCH BAR --- */}
            {/* 💡 Reduced top margin and made it more compact for mobile */}
            <div className="sticky z-30 pt-4 mb-10 top-20 md:mb-16">
                <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl shadow-gray-200/50 rounded-2xl md:rounded-3xl p-1.5 md:p-2 flex flex-col md:flex-row items-center gap-2">
                    
                    <div className="relative flex-1 w-full">
                        <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 md:w-5 md:h-5 left-4 top-1/2" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 text-sm text-gray-700 bg-transparent outline-none md:pl-12 md:py-4"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute -translate-y-1/2 right-4 top-1/2">
                                <XMarkIcon className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center w-full gap-2 pt-2 border-t border-gray-100 md:w-auto md:border-t-0 md:border-l md:pt-0 md:pl-2">
                        <label className="flex items-center justify-center gap-2 px-3 py-2.5 md:px-4 md:py-3 bg-gray-50 hover:bg-pink-50 text-[#3E442B] hover:text-[#EA638C] rounded-xl md:rounded-2xl cursor-pointer transition-all flex-1 md:flex-none">
                            <CameraIcon className={`w-5 h-5 ${isImageLoading ? 'animate-bounce' : ''}`} />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Visual</span>
                            <input type="file" accept="image/*" className="hidden" onChange={() => {}} />
                        </label>

                        <div className="relative flex-1 md:flex-none">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="appearance-none bg-[#3E442B] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest pr-10 outline-none hover:bg-black transition-colors cursor-pointer w-full"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="text-gray-900">{cat}</option> 
                                ))}
                            </select>
                            <AdjustmentsHorizontalIcon className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none right-3 top-1/2 text-white/70" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- GRID --- */}
            {/* 💡 FIXED: grid-cols-2 for mobile, gap-3 to match your homepage layout */}
            <div className="grid grid-cols-2 gap-3 px-1 sm:gap-8 lg:grid-cols-4 md:px-0">
                {filteredProducts.map(product => (
                    <div key={product._id} className="transition-all duration-500 group">
                        <ProductCard product={product} /> 
                    </div>
                ))}
            </div>

            {/* --- EMPTY STATE --- */}
            {filteredProducts.length === 0 && (
                <div className="py-32 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-50">
                       <MagnifyingGlassIcon className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        No materials found matching your search.
                    </p>
                    <button 
                        onClick={() => {setSearchQuery(""); setSelectedCategory("All")}}
                        className="mt-4 text-[10px] font-black text-[#EA638C] uppercase underline underline-offset-4"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}