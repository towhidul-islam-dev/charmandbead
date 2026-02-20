import 'server-only'; 

import mongodb from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order'; // 🟢 Added for global stats
import { cache } from 'react';

// ==========================================
// 1. PRODUCTS DATA
// ==========================================

export const getProducts = cache(async (isAdmin = false, categoryId = null) => {
    try {
        await mongodb(); 
        
        let query = isAdmin ? {} : { isArchived: { $ne: true } };
        
        if (categoryId) {
            query.$or = [
                { category: categoryId },
                { subCategory: categoryId }
            ];
        }

        const products = await Product.find(query)
            // 🚨 FIXED: Added 'gallery' to the selection string below
            .select('name price stock category categoryName subCategory subCategoryName imageUrl gallery createdAt hasVariants variants isArchived isNewArrival minOrderQuantity') 
            .sort({ createdAt: -1 }) 
            .lean(); 

        const serializedProducts = products.map(product => ({
            ...product,
            _id: product._id.toString(),
            category: product.category?.toString() || null,
            subCategory: product.subCategory?.toString() || null,
            categoryName: product.categoryName || "Collection",
            subCategoryName: product.subCategoryName || "",
            // 🟢 Ensure gallery is explicitly mapped as an array
            gallery: product.gallery || [], 
            createdAt: product.createdAt ? product.createdAt.toISOString() : new Date().toISOString(),
            variants: (product.variants || []).map(v => ({
                ...v,
                _id: v._id?.toString() 
            })),
            isArchived: !!product.isArchived 
        }));

        return { success: true, products: serializedProducts };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, products: [], error: error.message };
    }
});

export const getProductById = cache(async (id) => {
    try {
        await mongodb(); 

        const product = await Product.findById(id)
            .select('name description price stock category subCategory imageUrl variants hasVariants isNewArrival createdAt') 
            .lean();

        if (!product) {
            return { success: false, product: null, error: "Product not found." };
        }

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
            .select('name email role addresses createdAt') 
            .sort({ createdAt: -1 })
            .lean();

        const serializedUsers = users.map(user => ({
            ...user,
            _id: user._id.toString(),
            createdAt: user.createdAt.toISOString(),
            addresses: user.addresses || [] 
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