import { Request, Response } from "express";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the structured JSON schema for the AI output
const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING, description: "A catchy name for the recipe based on the image" },
    category: { type: Type.STRING, description: "The likely category: e.g. Breakfast, Dessert, Dinner, Snack, Beverage" },
    cuisineType: { type: Type.STRING, description: "The likely cuisine type: e.g. Italian, Mexican, Indian, American, Japanese" },
    difficultyLevel: { type: Type.STRING, description: "One of: Easy, Medium, Hard" },
    preparationTime: { type: Type.INTEGER, description: "Total preparation and cooking time in minutes" },
    ingredients: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of expected ingredients to make this dish"
    },
    instructions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Step-by-step instructions to cook the dish"
    }
  },
  required: ["recipeName", "category", "cuisineType", "difficultyLevel", "preparationTime", "ingredients", "instructions"]
};

export const analyzeFoodImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      res.status(400).json({ success: false, error: "imageUrl is required" });
      return;
    }

    // Fetch the image from URL and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      res.status(400).json({ success: false, error: "Failed to download image from the provided URL" });
      return;
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Call Gemini Model
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        "You are an expert chef and culinary AI. Analyze this food image and generate a complete recipe for it.",
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("AI returned an empty response.");
    }

    const recipeData = JSON.parse(responseText);

    res.status(200).json({
      success: true,
      data: recipeData
    });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to analyze image with AI.",
      details: error.message 
    });
  }
};
