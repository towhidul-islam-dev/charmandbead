"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initialize Gemini with your free API Key.
 * Note: Ensure GEMINI_API_KEY is defined in your .env.local
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We use gemini-1.5-flash because it's fast, accurate for images, and has a generous free tier.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export async function searchByImage(formData) {
  console.log(
    "Checking Key:",
    process.env.GEMINI_API_KEY ? "Key Found" : "Key MISSING",
  );
  try {
    const file = formData.get("image");

    if (!file || file.size === 0) {
      return { success: false, message: "No image provided" };
    }

    // 1. Process the image for the Gemini SDK
    const mimeType = file.type || "image/jpeg";
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    // 2. Construct the prompt for jewelry identification
    const prompt =
      "You are an e-commerce assistant for a jewelry supply brand called Charm & Bead. " +
      "Identify the main material or jewelry component in this image. " +
      "Return only the name of the object, e.g., 'Blue Beads' or 'Heart Charm'. " +
      "Do not use punctuation or full sentences.";

    // 3. Call the Gemini API
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // 4. Clean the output (Remove quotes and periods)
    const label = text.trim().replace(/[.\x22]/g, "");

    return {
      success: true,
      label: label,
    };
  } catch (error) {
    console.error("Gemini Vision API Error:", error.message);

    // Specific error handling for common free-tier issues
    if (error.message.includes("429")) {
      return {
        success: false,
        message: "The AI is a bit busy. Please wait 30 seconds and try again!",
      };
    }
    if (error.message.includes("API key not valid")) {
      return {
        success: false,
        message: "System configuration error: Invalid API Key.",
      };
    }

    return {
      success: false,
      message: "AI failed to recognize the image. Please try again.",
    };
  }
}
