import dbConnect from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";

// Force Next.js to always fetch fresh data, avoiding stale cache
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // 1. Fetch top 10 trends sorted by votes (descending)
    // We increase the limit slightly to ensure the UI feels full
    const topTrends = await Recommendation.find({})
      .sort({ votes: -1 })
      .limit(10)
      .lean(); // .lean() makes the query faster by returning plain JS objects

    // 2. Safety Check: Ensure every item has the expected fields for the UI
    const sanitizedTrends = topTrends.map(trend => ({
      ...trend,
      status: trend.status || "Pending", // Fallback so status badges don't break
      votes: trend.votes || 0,
      aiAnalysis: trend.aiAnalysis || { category: "Trend", style: "New" }
    }));

    return Response.json(sanitizedTrends);
  } catch (error) {
    console.error("TRENDS_FETCH_ERROR:", error);
    // Return an empty array instead of a 500 error to keep the frontend from crashing
    return Response.json([], { status: 500 });
  }
}