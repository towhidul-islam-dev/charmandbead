import 'server-only'; 

import mongodb from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';
import { cache } from 'react';
import mongoose from 'mongoose';

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

        // Search Filter condition
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
            .select('name description price stock category categoryName subCategory subCategoryName imageUrl gallery variants hasVariants isNewArrival minOrderQuantity pricingTiers isOnSale createdAt') 
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

        // 1. Fetch users from DB
        const users = await User.find({})
            .select('name email image role addresses totalSpent isVIP orders createdAt') 
            .sort({ createdAt: -1 })
            .lean();

        // 2. Aggregate orders per user with explicit string grouping and totalAmount calculations
        const orderAggregation = await Order.aggregate([
            {
                $match: {
                    user: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: { $toString: "$user" }, 
                    orderCount: { $sum: 1 },
                    calculatedTotalSpent: { 
                        $sum: { 
                            $cond: [
                                { $ne: [{ $toLower: "$status" }, "cancelled"] }, 
                                { $ifNull: ["$totalAmount", "$totalPrice", 0] },
                                0
                            ] 
                        } 
                    },
                    userOrders: { $push: "$$ROOT" }
                }
            }
        ]);

        // Map aggregated orders by stringified User ID
        const orderMap = new Map();
        orderAggregation.forEach(item => {
            if (item._id) {
                orderMap.set(item._id, item);
            }
        });

        // 3. Merge user details with order stats
        const serializedUsers = users.map(user => {
            const userIdStr = user._id.toString();
            const orderStats = orderMap.get(userIdStr);

            const userOrders = orderStats?.userOrders || user.orders || [];
            const computedOrderCount = orderStats?.orderCount ?? userOrders.length ?? 0;
            const computedTotalSpent = orderStats?.calculatedTotalSpent ?? user.totalSpent ?? 0;

            return {
                ...user,
                _id: userIdStr,
                image: user.image || null,
                createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
                addresses: user.addresses || [],
                totalSpent: computedTotalSpent,
                isVIP: !!user.isVIP,
                orders: JSON.parse(JSON.stringify(userOrders)),
                orderCount: computedOrderCount
            };
        });

        return { success: true, users: serializedUsers };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { success: false, users: [], error: error.message };
    }
});

export const getUserStats = cache(async (userId) => {
    try {
        await mongodb();
        if (!userId) return { success: false, orders: [], totalSpent: 0, orderCount: 0 };

        const targetUserId = typeof userId === 'string' && userId.length === 24 
            ? new mongoose.Types.ObjectId(userId) 
            : userId;

        const orders = await Order.find({ 
            $or: [{ user: targetUserId }, { user: userId.toString() }] 
        })
        .sort({ createdAt: -1 })
        .lean();

        const totalSpent = orders.reduce((sum, order) => {
            if (order.status && order.status.toLowerCase() === "cancelled") return sum;
            return sum + (order.totalAmount || order.totalPrice || 0);
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

export const getAdminGlobalData = cache(async () => {
    try {
        await mongodb();

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const newOrdersCount = await Order.countDocuments({ 
            status: { $in: ['Pending', 'pending', 'Processing', 'processing', 'Verifying'] } 
        });

        const newUsersCount = await User.countDocuments({ 
            createdAt: { $gte: twentyFourHoursAgo },
            role: 'user' 
        });

        const hasRecentArrivals = await Product.exists({ 
            createdAt: { $gte: fortyEightHoursAgo },
            isArchived: { $ne: true }
        });

        return {
            success: true,
            newOrdersCount: newOrdersCount || 0,
            newUsersCount: newUsersCount || 0,
            hasRecentArrivals: !!hasRecentArrivals
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