import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";
import SystemLog from "@/models/SystemLog";

async function performSmartMerge(req) {
  try {
    await connectDB();

    // 1. Security Check
    const authHeader = req.headers.get("authorization");
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    // ALLOW MANUAL OVERRIDE: Permits browser access IF the ?admin=true param is present
    // Note: In production, you'd replace 'true' with a second password or a Session check.
    const isAdminManual = req.nextUrl.searchParams.get("admin") === "true";

    if (!isCron && !isAdminManual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all active trends (excluding those already in stock)
    const allRecs = await Recommendation.find({ status: { $ne: "Stocked" } });
    
    const clusters = {};

    allRecs.forEach((rec) => {
      // THE FIX: Standardize the key for robust matching
      let key = rec.aiAnalysis?.visualFingerprint?.toUpperCase().trim().replace(/[.,!]$/, "");
      
      if (!key || key === "") {
        // Fallback for items that haven't been migrated yet
        const cat = rec.aiAnalysis?.category?.toLowerCase().trim() || "uncategorized";
        key = `LEGACY-${cat}`;
      }

      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(rec);
    });

    let mergedCount = 0;

    for (const key in clusters) {
      const cluster = clusters[key];

      if (cluster.length > 1) {
        // Master selection: Highest votes wins
        cluster.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        const [master, ...duplicates] = cluster;

        const extraVotes = duplicates.reduce((sum, d) => sum + (d.votes || 0), 0);
        
        // Combine voters to prevent the same person from voting twice on the merged item
        const combinedVoters = [...new Set([
          ...(master.votedBy || []),
          ...duplicates.flatMap(d => d.votedBy || [])
        ])];

        const extraNotes = duplicates.flatMap((d) => d.notes || []).map(note => ({
           ...note,
           body: note.body.includes("(AI Merged)") ? note.body : `${note.body} (AI Merged)`
        }));

        // 3. Update Master
        await Recommendation.findByIdAndUpdate(master._id, {
          $inc: { votes: extraVotes },
          $set: { votedBy: combinedVoters },
          $push: { notes: { $each: extraNotes } }
        });

        // 4. Delete Duplicates
        const duplicateIds = duplicates.map(d => d._id);
        await Recommendation.deleteMany({ _id: { $in: duplicateIds } });
        
        mergedCount += duplicates.length;
      }
    }

    const lastSyncTime = new Date().toISOString();
    await SystemLog.findOneAndUpdate(
      { key: "last_smart_merge" },
      { 
        value: lastSyncTime,
        details: `Cleanse complete. Merged ${mergedCount} duplicates based on Visual Fingerprints.`
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      mergedCount,
      timestamp: lastSyncTime 
    });

  } catch (error) {
    console.error("Smart Merge Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) { return performSmartMerge(req); }
export async function GET(req) { return performSmartMerge(req); }