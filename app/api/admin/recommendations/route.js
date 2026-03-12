import dbConnect from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";

export async function GET() {
  try {
    await dbConnect();
    // Fetching and sorting by most recent first
    const allRecs = await Recommendation.find({})
      .sort({ createdAt: -1 }); 
    return Response.json(allRecs);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}