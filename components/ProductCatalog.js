"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import {
    MagnifyingGlassIcon,
    ChevronDownIcon,
    XMarkIcon,
    ClockIcon,
    SparklesIcon,
    PhotoIcon
} from "@heroicons/react/24/outline";
import { Toaster } from "react-hot-toast";

// Helper function to highlight matching search characters
const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <span key={index} className="font-extrabold text-[#EA638C] underline decoration-[#EA638C]/30 decoration-2">
                {part}
            </span>
        ) : (
            <span key={index} className="font-medium text-[#3E442B]/80">{part}</span>
        )
    );
};

export default function ProductCatalog({ initialProducts = [], allProducts = [] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef(null);

    // Read category and search query directly from URL params on initial load
    const categoryFromUrl = searchParams.get('category') || 'All';
    const searchFromUrl = searchParams.get('search') || '';

    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    
    // Search & History States
    const [searchQuery, setSearchQuery] = useState(searchFromUrl);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Live Suggestions State for Global DB search
    const [liveSuggestions, setLiveSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Source array for local fallback (prefers full catalog list if passed)
    const catalogSource = useMemo(() => {
        return allProducts.length > 0 ? allProducts : initialProducts;
    }, [allProducts, initialProducts]);

    // Load Recent Searches on Mount
    useEffect(() => {
        const saved = localStorage.getItem('product_recent_searches');
        if (saved) {
            try { setRecentSearches(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    // Sync input fields if URL changes externally (e.g. browser back/forward buttons)
    useEffect(() => {
        if (searchFromUrl !== searchQuery) {
            setSearchQuery(searchFromUrl);
        }
    }, [searchFromUrl]);

    useEffect(() => {
        if (categoryFromUrl !== selectedCategory) {
            setSelectedCategory(categoryFromUrl);
            setSelectedSubCategory('All');
        }
    }, [categoryFromUrl]);

    // Global + Local Fallback Search for Suggestions Across All Pages
    useEffect(() => {
        const query = searchQuery.trim();

        if (!query) {
            setLiveSuggestions([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const timer = setTimeout(async () => {
            let apiResults = [];
            
            // 1. Try fetching global matches from database across all pages
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    apiResults = await res.json();
                }
            } catch (err) {
                // Ignore API failure and fallback to local search
            }

            // 2. If API returns results, use them; otherwise, fallback to filtering client-side products
            if (apiResults && apiResults.length > 0) {
                setLiveSuggestions(apiResults);
            } else {
                const matches = [];
                const seenNames = new Set();
                const lowerQuery = query.toLowerCase();

                for (const p of catalogSource) {
                    if (p.name && p.name.toLowerCase().includes(lowerQuery) && !seenNames.has(p.name)) {
                        seenNames.add(p.name);
                        matches.push({
                            id: p._id,
                            name: p.name,
                            category: p.categoryName || "Collection",
                            imageUrl: p.imageUrl || (p.gallery && p.gallery[0]) || null
                        });
                        if (matches.length >= 6) break;
                    }
                }
                setLiveSuggestions(matches);
            }

            setIsSearching(false);
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery, catalogSource]);

    // Combined active dropdown items for Keyboard Navigation
    const currentDropdownItems = useMemo(() => {
        if (searchQuery.trim()) {
            return liveSuggestions.map(s => s.name);
        }
        return recentSearches;
    }, [searchQuery, liveSuggestions, recentSearches]);

    // Save term to LocalStorage
    const saveSearchTerm = (term) => {
        const cleanTerm = term.trim();
        if (!cleanTerm) return;
        const updated = [cleanTerm, ...recentSearches.filter(s => s !== cleanTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('product_recent_searches', JSON.stringify(updated));
    };

    const removeRecentSearch = (e, term) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== term);
        setRecentSearches(updated);
        localStorage.setItem('product_recent_searches', JSON.stringify(updated));
    };

    // Helper to commit search to URL & trigger page re-render
    const commitSearchToUrl = (term, category = selectedCategory) => {
        const params = new URLSearchParams(searchParams.toString());

        if (category && category !== 'All') {
            params.set('category', category);
        } else {
            params.delete('category');
        }

        if (term.trim()) {
            params.set('search', term.trim());
        } else {
            params.delete('search');
        }

        params.set('page', '1');
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    // Triggered when user selects ANY search result
    const handleSelectSearch = (term) => {
        setSearchQuery(term);
        saveSearchTerm(term);
        setIsDropdownOpen(false);
        inputRef.current?.blur();
        
        // Commits to URL to load the actual matching product grid
        commitSearchToUrl(term);
    };

    // Keyboard Navigation (Arrow Keys + Enter + Esc)
    const handleKeyDown = (e) => {
        if (!isDropdownOpen || currentDropdownItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < currentDropdownItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && currentDropdownItems[selectedIndex]) {
                handleSelectSearch(currentDropdownItems[selectedIndex]);
            } else if (searchQuery.trim()) {
                handleSelectSearch(searchQuery);
            }
        } else if (e.key === 'Escape') {
            setIsDropdownOpen(false);
        }
    };

    // Handle Category Dropdown Changes
    const handleCategoryChange = (newCat) => {
        setSelectedCategory(newCat);
        setSelectedSubCategory('All');
        commitSearchToUrl(searchQuery, newCat);
    };

    // Extract Unique Categories
    const mainCategories = useMemo(() => {
        const categoryMap = new Map();
        catalogSource.forEach(p => {
            const catKey = p.categorySlug || p.category;
            if (catKey && !categoryMap.has(catKey)) {
                categoryMap.set(catKey, p.categoryName || "Collection");
            }
        });
        const list = Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }));
        return [{ id: 'All', name: 'All Categories' }, ...list];
    }, [catalogSource]);

    // Extract Unique Sub-Categories
    const subCategories = useMemo(() => {
        if (selectedCategory === 'All') return [];
        
        const subMap = new Map();
        const filtered = catalogSource.filter(p => 
            p.category === selectedCategory || p.categorySlug === selectedCategory
        );
        
        filtered.forEach(p => {
            if (p.subCategory && !subMap.has(p.subCategory)) {
                subMap.set(p.subCategory, p.subCategoryName || "Type");
            }
        });

        const list = Array.from(subMap.entries()).map(([id, name]) => ({ id, name }));
        return [{ id: 'All', name: 'All Types' }, ...list];
    }, [catalogSource, selectedCategory]);

    // Client-side Subcategory filtering for current view
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            return selectedSubCategory === 'All' || p.subCategory === selectedSubCategory;
        });
    }, [initialProducts, selectedSubCategory]);

    // Responsive Brand Styles
    const inputClass = "w-full appearance-none bg-gray-50 border border-transparent hover:border-gray-200 text-[#3E442B] px-3.5 py-3 sm:px-4 sm:py-3.5 pr-9 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all focus:bg-white focus:border-[#EA638C]/30 rounded-xl sm:rounded-2xl";
    const subInputClass = "w-full appearance-none bg-[#FBB6E6]/20 border border-transparent hover:border-[#EA638C]/30 text-[#EA638C] px-3.5 py-3 sm:px-4 sm:py-3.5 pr-9 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all rounded-xl sm:rounded-2xl";

    return (
        <div className="min-h-screen px-3 py-6 mx-auto max-w-7xl sm:px-4 sm:py-8 md:py-12">
            <Toaster position="bottom-center" />

            {/* Sticky Search & Filter Bar */}
            <div className="sticky z-20 pt-2 mb-8 sm:mb-12 top-20 sm:top-28">
                <div className="flex flex-col items-stretch max-w-4xl gap-2 p-2 mx-auto sm:flex-row bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl rounded-2xl sm:rounded-3xl">
                    
                    {/* Search Input Container */}
                    <div className="relative flex-1 group">
                        <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3.5 sm:left-4 top-1/2 group-focus-within:text-[#EA638C] transition-colors" />
                        
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                                setSelectedIndex(-1);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                            onKeyDown={handleKeyDown}
                            className="w-full py-3 sm:py-3.5 pl-11 sm:pl-12 pr-10 text-xs sm:text-sm font-bold text-[#3E442B] placeholder:text-gray-400 bg-transparent outline-none"
                        />

                        {/* Clear Button */}
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    commitSearchToUrl('');
                                    inputRef.current?.focus();
                                }}
                                className="absolute -translate-y-1/2 right-3 top-1/2 text-gray-400 hover:text-[#EA638C] transition-colors p-1"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}

                        {/* Dropdown Suggestions */}
                        {isDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-2 sm:mt-3 bg-white border border-gray-100 shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                                
                                {searchQuery.trim() !== '' ? (
                                    liveSuggestions.length > 0 ? (
                                        <>
                                            <div className="px-3.5 py-2.5 sm:px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
                                                <span>Product Suggestions</span>
                                                <SparklesIcon className="w-3.5 h-3.5 text-[#EA638C]" />
                                            </div>
                                            <ul className="divide-y divide-gray-50">
                                                {liveSuggestions.map((item, index) => (
                                                    <li
                                                        key={item.id || index}
                                                        onMouseDown={() => handleSelectSearch(item.name)}
                                                        className={`flex items-center justify-between px-3.5 py-2.5 sm:px-4 text-xs font-bold cursor-pointer transition-colors ${
                                                            selectedIndex === index ? 'bg-[#FBB6E6]/20 text-[#EA638C]' : 'active:bg-gray-100 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                                                            {item.imageUrl ? (
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.name}
                                                                    className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-lg sm:rounded-xl border border-gray-100 bg-gray-50 shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-100 rounded-lg sm:rounded-xl text-gray-400 shrink-0">
                                                                    <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                </div>
                                                            )}
                                                            <span className="truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs text-xs sm:text-sm">
                                                                {highlightMatch(item.name, searchQuery)}
                                                            </span>
                                                        </div>
                                                        <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                                                            {item.category}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <div className="px-4 py-3 text-xs text-gray-400 font-medium">
                                            {isSearching ? 'Searching...' : 'No direct product matches found...'}
                                        </div>
                                    )
                                ) : (
                                    recentSearches.length > 0 && (
                                        <>
                                            <div className="px-3.5 py-2.5 sm:px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 sticky top-0 bg-white z-10">
                                                Recent Searches
                                            </div>
                                            <ul className="divide-y divide-gray-50">
                                                {recentSearches.map((term, index) => (
                                                    <li
                                                        key={term}
                                                        onMouseDown={() => handleSelectSearch(term)}
                                                        className={`flex items-center justify-between px-3.5 py-3 sm:px-4 text-xs font-bold text-[#3E442B] cursor-pointer transition-colors ${
                                                            selectedIndex === index ? 'bg-[#FBB6E6]/20 text-[#EA638C]' : 'active:bg-gray-100 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                            <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                                            <span className="truncate">{term}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => removeRecentSearch(e, term)}
                                                            className="text-[10px] font-bold text-gray-400 hover:text-[#EA638C] transition-colors p-1 shrink-0 ml-2"
                                                        >
                                                            Remove
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Responsive Category Dropdowns */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-2 pt-2 border-t border-gray-100 sm:pt-0 sm:border-t-0 sm:border-l sm:pl-2">
                        <div className="relative w-full sm:w-44 lg:w-48 group">
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className={inputClass}
                            >
                                {mainCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute w-3.5 h-3.5 text-gray-400 -translate-y-1/2 pointer-events-none right-3 sm:right-4 top-1/2" />
                        </div>

                        {selectedCategory !== 'All' && subCategories.length > 1 && (
                            <div className="relative w-full sm:w-44 lg:w-48 animate-in fade-in zoom-in-95 duration-200">
                                <select
                                    value={selectedSubCategory}
                                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    className={subInputClass}
                                >
                                    {subCategories.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="absolute w-3.5 h-3.5 text-[#EA638C] pointer-events-none right-3 sm:right-4 top-1/2 -translate-y-1/2" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 md:px-0">
                {filteredProducts.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                ))}
            </div>
            
            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="py-16 sm:py-24 text-center bg-white border border-dashed border-[#FBB6E6]/40 rounded-2xl sm:rounded-[3rem] my-4 px-4">
                    <p className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-gray-400 uppercase leading-relaxed">
                        No treasures match your selection.
                    </p>
                </div>
            )}
        </div>
    );
}