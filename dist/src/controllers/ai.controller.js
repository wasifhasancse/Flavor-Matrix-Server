"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFoodImage = void 0;
const genai_1 = require("@google/genai");
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Define the structured JSON schema for the AI output
const recipeSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        recipeName: { type: genai_1.Type.STRING, description: "A catchy name for the recipe based on the image" },
        category: { type: genai_1.Type.STRING, description: "The likely category: e.g. Breakfast, Dessert, Dinner, Snack, Beverage" },
        cuisineType: { type: genai_1.Type.STRING, description: "The likely cuisine type: e.g. Italian, Mexican, Indian, American, Japanese" },
        difficultyLevel: { type: genai_1.Type.STRING, description: "One of: Easy, Medium, Hard" },
        preparationTime: { type: genai_1.Type.INTEGER, description: "Total preparation and cooking time in minutes" },
        ingredients: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
            description: "List of expected ingredients to make this dish"
        },
        instructions: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
            description: "Step-by-step instructions to cook the dish"
        }
    },
    required: ["recipeName", "category", "cuisineType", "difficultyLevel", "preparationTime", "ingredients", "instructions"]
};
const analyzeFoodImage = async (req, res) => {
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
            model: "gemini-2.5-flash",
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
    }
    catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to analyze image with AI.",
            details: error.message
        });
    }
};
exports.analyzeFoodImage = analyzeFoodImage;
