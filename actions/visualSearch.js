"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function searchByImage(formData) {
  try {
    const file = formData.get("image");
    if (!file) return { success: false, message: "No image provided" };

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cheap for visual tagging
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the main material or product in this image. Return only ONE or TWO words (e.g., 'Pink Beads', 'Crystal', 'Gold Wire')." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const label = response.choices[0].message.content.trim();
    return { success: true, label };
  } catch (error) {
    console.error("Visual Search Error:", error);
    return { success: false, message: "Failed to analyze image" };
  }
}