import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SystemLog from "@/models/SystemLog";

// Set dynamic to 'force-dynamic' so Next.js doesn't cache the timestamp
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    // Find the specific log entry created by the Smart Merge process
    const log = await SystemLog.findOne({ key: "last_smart_merge" });
    
    // We return a 200 even if null, so the frontend can handle the "First Run" state
    return NextResponse.json({ 
      success: true,
      lastSync: log ? log.value : null,
      details: log ? log.details : "No merges recorded yet."
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error("System Status Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system status" }, 
      { status: 500 }
    );
  }
}