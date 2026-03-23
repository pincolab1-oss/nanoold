import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  aspectRatio: AspectRatio;
}

export async function generateImage(prompt: string, aspectRatio: AspectRatio): Promise<GenerationResult> {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. Please add it to your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    let base64Data: string | undefined;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Data = part.inlineData.data;
        break;
      }
    }

    if (!base64Data) {
      throw new Error("No image data returned from the API.");
    }

    return {
      imageUrl: `data:image/png;base64,${base64Data}`,
      prompt,
      aspectRatio,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
