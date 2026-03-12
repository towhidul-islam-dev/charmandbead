import dbConnect from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const { id } = await req.json();
    await dbConnect();

    // 1. AWAIT the headers function call
    const headerList = await headers();
    
    // 2. Safeguard: Check if get exists (fixes some edge cases in Next dev mode)
    let ip = "127.0.0.1";
    if (typeof headerList.get === 'function') {
        const forwarded = headerList.get("x-forwarded-for");
        ip = forwarded ? forwarded.split(',')[0] : "127.0.0.1";
    }

    // 3. Find and Update ONLY if IP is not in votedBy
    const updated = await Recommendation.findOneAndUpdate(
      { _id: id, votedBy: { $ne: ip } }, 
      { 
        $inc: { votes: 1 },
        $push: { votedBy: ip } 
      },
      { new: true }
    );

    if (!updated) {
      return new Response(
        JSON.stringify({ error: "You've already voted for this trend!" }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return Response.json(updated);
  } catch (error) {
    console.error("VOTE_ERROR:", error);
    return Response.json({ error: "Vote failed" }, { status: 500 });
  }
}