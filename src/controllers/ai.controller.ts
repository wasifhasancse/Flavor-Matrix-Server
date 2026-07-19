import { Request, Response } from "express";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the structured JSON schema for the AI output
const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING, description: "A catchy name for the recipe based on the image" },
    description: { type: Type.STRING, description: "A rich, appetizing description of what makes this dish special. Must be at least 50 words long." },
    category: { type: Type.STRING, description: "The likely category based on the image: e.g. Breakfast, Dessert, Dinner, Snack, Beverage" },
    cuisineType: { type: Type.STRING, description: "The likely cuisine type: e.g. Italian, Mexican, Indian, American, Japanese" },
    difficultyLevel: { type: Type.STRING, description: "One of: Easy, Medium, Hard (based on visual complexity)" },
    preparationTime: { type: Type.INTEGER, description: "Estimated preparation time (in minutes) based on the image" },
    cookTime: { type: Type.INTEGER, description: "Estimated cooking time (in minutes) based on the image" },
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
  required: ["recipeName", "description", "category", "cuisineType", "difficultyLevel", "preparationTime", "cookTime", "ingredients", "instructions"]
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
        "You are an expert chef and culinary AI. Analyze this food image carefully. Generate a complete and detailed recipe for it. Ensure the 'description' is a rich, appetizing paragraph of at least 50 words. Accurately guess the Category, Difficulty, Prep Time, and Cook Time strictly based on the visual complexity of the dish.",
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
