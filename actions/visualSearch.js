"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function searchByImage(formData) {
  try {
    const file = formData.get("image");
    if (!file || file.size === 0) {
      return { success: false, message: "No image provided" };
    }

    // 1. Detect Mime Type dynamically
    const mimeType = file.type || "image/jpeg";

    // 2. Convert to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // 3. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "You are an e-commerce assistant. Identify the main material or jewelry component in this image. Return only the name of the object, e.g., 'Blue Beads'. No punctuation." 
            },
            {
              type: "image_url",
              image_url: {
                // 🆕 Use dynamic mimeType
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "low" // 💡 "low" is cheaper, faster, and usually enough for simple labels
              },
            },
          ],
        },
      ],
    });

    const label = response.choices[0].message.content.trim().replace(/[.\x22]/g, "");
    return { success: true, label };
  } catch (error) {
    // 💡 Log the exact error to your terminal for debugging
    console.error("OpenAI API Error:", error.response?.data || error.message);
    
    // Check for specific OpenAI errors
    if (error.message.includes("401")) return { success: false, message: "Invalid API Key" };
    if (error.message.includes("413")) return { success: false, message: "Image too large for AI" };
    
    return { success: false, message: "AI failed to recognize the image" };
  }
}