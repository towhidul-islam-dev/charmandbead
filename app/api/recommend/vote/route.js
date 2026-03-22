import dbConnect from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const { id, choice } = await req.json(); // Added 'choice' (yes/no)
    await dbConnect();

    const headerList = await headers();
    
    let ip = "127.0.0.1";
    if (typeof headerList.get === 'function') {
        const forwarded = headerList.get("x-forwarded-for");
        ip = forwarded ? forwarded.split(',')[0] : "127.0.0.1";
    }

    // Prepare the update object based on the user's choice
    const updateQuery = {
      $push: { votedBy: ip } // Always track the IP to prevent double-voting
    };

    // Only increment "Marks" if they chose 'yes'
    if (choice === 'yes') {
      updateQuery.$inc = { votes: 1 };
    }

    // Find and Update ONLY if IP is not in votedBy
    const updated = await Recommendation.findOneAndUpdate(
      { _id: id, votedBy: { $ne: ip } }, 
      updateQuery,
      { new: true }
    );

    if (!updated) {
      return new Response(
        JSON.stringify({ error: "Identity already verified for this drop!" }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return Response.json({ 
      success: true, 
      message: choice === 'yes' ? "Mark registered!" : "Drop skipped",
      data: updated 
    });

  } catch (error) {
    console.error("VOTE_ERROR:", error);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}