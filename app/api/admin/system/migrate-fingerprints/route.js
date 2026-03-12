import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(req) {
  try {
    await connectDB();

    // 1. Security Check (Same as the Smart-Merge logic)
    const authHeader = req.headers.get("authorization");
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isAdminManual = req.nextUrl.searchParams.get("admin") === "true";

    if (!isCron && !isAdminManual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Find all items missing a visualFingerprint
    const itemsToUpdate = await Recommendation.find({
      $or: [
        { "aiAnalysis.visualFingerprint": { $exists: false } },
        { "aiAnalysis.visualFingerprint": "" },
        { "aiAnalysis.visualFingerprint": null }
      ]
    });

    if (itemsToUpdate.length === 0) {
      return NextResponse.json({ success: true, message: "All items already have fingerprints." });
    }

    let updatedCount = 0;

    // 3. Process each item
    for (const item of itemsToUpdate) {
      try {
        const imageResp = await fetch(item.imageUrl);
        const buffer = await imageResp.arrayBuffer();
        
        const imageData = {
          inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType: "image/jpeg",
          },
        };

        const prompt = `Identify this item. 
        Return ONLY a 2-word uppercase hyphenated string.
        RULES: No colors, no plurals, no extra text.
        Example: "SILK-DRESS", "GOLD-EARRING", "DENIM-JACKET".`;

        const result = await model.generateContent([prompt, imageData]);
        const fingerprint = result.response.text().trim().replace(/['"`\n]/g, "").toUpperCase();

        // Save standardized fingerprint to MongoDB
        await Recommendation.findByIdAndUpdate(item._id, {
          "aiAnalysis.visualFingerprint": fingerprint
        });

        updatedCount++;
      } catch (err) {
        console.error(`Failed to update item ${item._id}:`, err.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully backfilled ${updatedCount} items.`,
      count: updatedCount
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}