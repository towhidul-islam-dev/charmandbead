import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        // Fallback to 'search' if 'q' is not provided
        const query = searchParams.get('q') || searchParams.get('search');

        if (!query || query.trim() === '') {
            return NextResponse.json([]);
        }

        await dbConnect();

        // Search globally across the entire database, matching name
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