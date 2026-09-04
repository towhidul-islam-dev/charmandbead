import 'server-only'; 

import mongodb from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order'; // 🟢 Added for global stats
import { cache } from 'react';

// ==========================================
// 1. PRODUCTS DATA
// ==========================================

export const getProducts = async (
    isAdmin = false, 
    categoryId = null, 
    page = 1, 
    limit = 1000, 
    searchQuery = '' 
) => {
    try {
        await mongodb(); 
        
        const parsedLimit = Number(limit) || 1000;
        const parsedPage = Number(page) || 1;

        // 1. Calculate how many products to skip based on current page
        const skip = (parsedPage - 1) * parsedLimit;

        // Base conditions strictly preserved
        let conditions = [
            isAdmin ? {} : { isArchived: { $ne: true } }
        ];

        // Category filter exact structure preserved
        if (categoryId) {
            conditions.push({
                $or: [
                    { category: categoryId },
                    { subCategory: categoryId }
                ]
            });
        }

        // Search Filter condition: removed \s so multi-word queries like "Copper wire" match spaces correctly
        if (searchQuery && searchQuery.trim() !== '') {
            const escapedSearch = searchQuery.trim().replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
            const searchRegex = new RegExp(escapedSearch, 'i');
            conditions.push({
                $or: [
                    { name: searchRegex },
                    { categoryName: searchRegex },
                    { subCategoryName: searchRegex }
                ]
            });
        }

        // Combine filter conditions safely while maintaining existing queries
        const query = conditions.length > 1 ? { $and: conditions } : conditions[0];

        // 2. Fetch the paginated products AND the total count simultaneously
        const [products, totalCount] = await Promise.all([
            Product.find(query)
                .select('name price stock category categoryName subCategory subCategoryName imageUrl gallery createdAt hasVariants variants isArchived isNewArrival minOrderQuantity pricingTiers isOnSale') 
                .sort({ createdAt: -1 }) 
                .skip(skip)   
                .limit(parsedLimit)
                .lean(),
            Product.countDocuments(query)
        ]);

        const serializedProducts = products.map(product => ({
            ...product,
            _id: product._id.toString(),
            category: product.category?.toString() || null,
            subCategory: product.subCategory?.toString() || null,
            categoryName: product.categoryName || "Collection",
            subCategoryName: product.subCategoryName || "",
            pricingTiers: product.pricingTiers || [],
            onSale: product.isOnSale,
            gallery: product.gallery || [], 
            createdAt: product.createdAt ? product.createdAt.toISOString() : new Date().toISOString(),
            variants: (product.variants || []).map(v => ({
                ...v,
                _id: v._id?.toString() 
            })),
            isArchived: !!product.isArchived 
        }));

        // 3. Return totalCount so the frontend can calculate totalPages
        return { 
            success: true, 
            products: serializedProducts, 
            totalCount 
        };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, products: [], totalCount: 0, error: error.message };
    }
};

export const getProductById = cache(async (id) => {
    try {
        await mongodb(); 

        const product = await Product.findById(id)
            // 🚨 ADDED: gallery, minOrderQuantity, categoryName, subCategoryName
            .select('name description price stock category categoryName subCategory subCategoryName imageUrl gallery variants hasVariants isNewArrival minOrderQuantity pricingTiers isOnSale createdAt') 
            .lean();

        if (!product) {
            return { success: false, product: null, error: "Product not found." };
        }

        // Serialization handles the _id to string conversion
        const serializedProduct = JSON.parse(JSON.stringify(product));
        return { success: true, product: serializedProduct, error: null };
    } catch (error) {
        console.error(`❌ DATABASE ERROR for ID ${id}:`, error);
        return { success: false, product: null, error: error.message };
    }
});

export async function getRelatedProducts(categoryId, currentId) {
    try {
        await mongodb();
        // Since category is now an ID, we query directly
        const related = await Product.find({ 
            category: categoryId, 
            _id: { $ne: currentId },
            isArchived: { $ne: true }
        })
        .limit(4)
        .lean();

        return { 
            success: true, 
            products: JSON.parse(JSON.stringify(related)) 
        };
    } catch (error) {
        return { success: false, products: [] };
    }
}

// ==========================================
// 2. USER & PARTNER DATA
// ==========================================

export const getUsers = cache(async () => {
    try {
        await mongodb(); 

        const users = await User.find({})
            // 🚨 FIXED: Added 'totalSpent' and 'isVIP' to the selection string
            .select('name email image role addresses totalSpent isVIP createdAt') 
            .sort({ createdAt: -1 })
            .lean();

        const serializedUsers = users.map(user => ({
            ...user,
            _id: user._id.toString(),
            // Ensure image is handled (even if null)
            image: user.image || null,
            createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
            addresses: user.addresses || [],
            // 🟢 Ensure these numerical/boolean values carry over correctly
            totalSpent: user.totalSpent || 0,
            isVIP: !!user.isVIP 
        }));

        return { success: true, users: serializedUsers };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { success: false, users: [], error: error.message };
    }
});

export const getUserStats = cache(async (userId) => {
    try {
        await mongodb();

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .lean();

        const totalSpent = orders.reduce((sum, order) => {
            return sum + (order.totalPrice || 0);
        }, 0);

        return {
            success: true,
            orders: JSON.parse(JSON.stringify(orders)),
            totalSpent,
            orderCount: orders.length
        };
    } catch (error) {
        console.error("Failed to fetch user stats:", error);
        return { success: false, orders: [], totalSpent: 0, orderCount: 0 };
    }
});

// ==========================================
// 3. ADMIN GLOBAL DATA (FOR SIDEBAR BADGES)
// ==========================================

/**
 * 🟢 NEW: getAdminGlobalData
 * Calculates badge counts for the sidebar (Orders & New Partners).
 * Note: 'New Partners' are users registered in the last 24 hours.
 */
export const getAdminGlobalData = cache(async () => {
    try {
        await mongodb();

        // 1. Time windows
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // 2. Count Pending/Processing Orders
        const newOrdersCount = await Order.countDocuments({ 
            status: { $in: ['pending', 'Processing'] } 
        });

        // 3. Count Users registered in the last 24 hours
        const newUsersCount = await User.countDocuments({ 
            createdAt: { $gte: twentyFourHoursAgo },
            role: 'user' 
        });

        // 4. 🟢 Check for Recent Arrivals (Last 48 Hours)
        // We use .exists() because it's faster than .find() or .count() 
        // when we only need a true/false result.
        const hasRecentArrivals = await Product.exists({ 
            createdAt: { $gte: fortyEightHoursAgo },
            isArchived: { $ne: true } // Only count active products
        });

        return {
            success: true,
            newOrdersCount: newOrdersCount || 0,
            newUsersCount: newUsersCount || 0,
            hasRecentArrivals: !!hasRecentArrivals // 🟢 Converts to boolean
        };
    } catch (error) {
        console.error("Failed to fetch admin global data:", error);
        return { 
            success: false, 
            newOrdersCount: 0, 
            newUsersCount: 0,
            hasRecentArrivals: false
        };
    }
});