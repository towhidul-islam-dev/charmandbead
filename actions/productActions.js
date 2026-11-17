"use server";

import mongodb from "@/lib/mongodb";
import Product from "@/models/Product";

export async function getRandomArchiveProducts(limit = 10) {
    try {
        await mongodb();

        // Efficiently pull 'limit' random products from the entire database collection
        const rawProducts = await Product.aggregate([
            { $sample: { size: limit } }
        ]);

        if (!rawProducts || rawProducts.length === 0) {
            return { success: false, products: [] };
        }

        const products = JSON.parse(JSON.stringify(rawProducts)).map((product) => ({
            ...product,
            _id: product._id.toString(),
            variants: product.variants?.map((v) => ({
                ...v,
                _id: v._id.toString(),
            })) || [],
        }));

        return { success: true, products };
    } catch (error) {
        console.error("Failed to fetch random archive products:", error);
        return { success: false, products: [] };
    }
}