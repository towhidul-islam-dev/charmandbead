import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { imageUrl, userName, userNote } = await req.json();
    await dbConnect();
    
    // 1. Initialize Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview", // Note: Ensure this model name matches your quota/access
      generationConfig: { responseMimeType: "application/json" },
    });

    // 2. Fetch image
    const imageResp = await fetch(imageUrl);
    const buffer = await imageResp.arrayBuffer();
    const contentType = imageResp.headers.get("content-type") || "image/jpeg";

    const imageData = {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType: contentType,
      },
    };

    // --- IMPROVED PROMPT FOR VISUAL MATCHING ---
   const prompt = `Analyze this boutique product image.
Return a JSON object with:
- category: Specific item type.
- style: Main aesthetic.
- tags: 3-5 keywords.
- visualFingerprint: A STRICT 2-word identifier for this object. 
  RULES: Use ONLY uppercase and hyphens. NO plural words (use VASE not VASES). 
  Ignore colors and sizes. A "Red Chair" and "Blue Chair" MUST both be "ARM-CHAIR".`;

    const result = await model.generateContent([prompt, imageData]);
    const responseText = result.response.text();

    let aiAnalysis;
    try {
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      aiAnalysis = JSON.parse(cleanJson);
    } catch (parseError) {
      aiAnalysis = {
        category: "Unique Item",
        style: "Modern",
        tags: ["community-pick"],
        visualFingerprint: "UNKNOWN-ITEM"
      };
    }
const fingerprintKey = aiAnalysis.visualFingerprint.toUpperCase().trim();
    // --- SMART GROUPING LOGIC (Visual Fingerprint) ---
    // We use the fingerprint to bridge the gap between different naming styles
    const existing = await Recommendation.findOne({
      "aiAnalysis.visualFingerprint": fingerprintKey
    });

    if (existing) {
      existing.votes += 1;
      // We keep the first image as the primary, or update if you prefer
      // existing.imageUrl = imageUrl; 

      if (userNote?.trim()) {
        existing.notes.push({
          body: userNote,
          userName: userName || "Anonymous",
        });
      }

      await existing.save();
      return Response.json(existing);
    }

    // 5. CREATE NEW
    const newRec = await Recommendation.create({
      imageUrl,
      userName: userName || "Anonymous",
      notes: userNote?.trim() 
        ? [{ body: userNote, userName: userName || "Anonymous" }] 
        : [],
      aiAnalysis: {
        category: aiAnalysis.category,
        style: aiAnalysis.style,
        tags: aiAnalysis.tags || [],
        visualFingerprint: aiAnalysis.visualFingerprint, // Save this for future merges!
      },
    });

    return Response.json(newRec);
  } catch (error) {
    console.error("🚨 SERVER ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}