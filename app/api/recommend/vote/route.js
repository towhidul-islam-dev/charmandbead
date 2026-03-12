import dbConnect from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const { id } = await req.json();
    await dbConnect();

    // 1. Get user's IP (Identity)
    const headerList = headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    // 2. Find and Update ONLY if IP is not in votedBy
    // $ne means "not equal" - we only proceed if the IP isn't there
    const updated = await Recommendation.findOneAndUpdate(
      { _id: id, votedBy: { $ne: ip } }, 
      { 
        $inc: { votes: 1 },
        $push: { votedBy: ip } 
      },
      { new: true }
    );

    // 3. If 'updated' is null, it means the IP was already in the array
    if (!updated) {
      return Response.json(
        { error: "You've already voted for this trend!" }, 
        { status: 403 }
      );
    }

    return Response.json(updated);
  } catch (error) {
    console.error("VOTE_ERROR:", error);
    return Response.json({ error: "Vote failed" }, { status: 500 });
  }
}