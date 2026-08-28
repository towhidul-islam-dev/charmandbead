import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // adjust to your database connection helper
import Product from '@/models/Product';  // adjust to your Product model

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim() === '') {
            return NextResponse.json([]);
        }

        await dbConnect();

        // Search globally across the entire database, matching name or category
        const products = await Product.find({
            name: { $regex: query, $options: 'i' }
        })
        .select('_id name categoryName category imageUrl gallery')
        .limit(6)
        .lean();

        const formattedResults = products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            category: p.categoryName || "Collection",
            imageUrl: p.imageUrl || (p.gallery && p.gallery[0]) || null
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}