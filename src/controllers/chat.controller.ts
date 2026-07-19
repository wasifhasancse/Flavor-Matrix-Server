import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const streamChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationHistory = [], currentContext = {} } = req.body;
    
    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build the system instructions dynamically based on the context
    const systemInstruction = `
You are a premium, context-aware AI Chat Assistant for Flavor Matrix, a culinary and recipe sharing platform.
Your tone should be helpful, enthusiastic, professional, and culinary-focused.

Current Context:
- User is on URL: ${currentContext.url || 'Unknown'}
- Active Item ID (if any): ${currentContext.activeItemId || 'None'}

NAVIGATION CAPABILITY:
You have the ability to automatically navigate the user to different parts of the application. 
If the user asks to see a specific section (e.g., "Take me to my favorites", "Show my profile", "Go home", "Add a recipe"), you MUST include a navigation token anywhere in your response.
The token format is exactly: [NAVIGATE: /path]

Valid paths include:
- /dashboard/user/bookmarks (Favorites)
- /dashboard/user/profile (Profile)
- /dashboard/user/add-recipe (Add Recipe)
- /recipes (All Recipes)
- / (Home)
- /pricing (Upgrade/Premium)

Example:
User: "How do I upgrade to premium?"
Assistant: "You can upgrade to our premium tier by visiting the pricing page! Let me take you there. [NAVIGATE: /pricing]"

Use your culinary expertise to assist the user with recipes, cooking tips, or navigating the platform.
`;

    // Format history for Gemini API
    // The Gemini API requires contents in a specific format: { role: 'user' | 'model', parts: [{text: '...'}] }
    const contents = conversationHistory.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // If conversation is empty, we still need at least one message to trigger the model, but this shouldn't happen usually
    if (contents.length === 0) {
       contents.push({ role: 'user', parts: [{ text: "Hello" }] });
    }

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-flash-latest", // Using the latest flash model
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        // SSE format: data: <content>\n\n
        // We replace newlines with a special character or just send JSON to make parsing easier on the client
        const data = JSON.stringify({ text: chunk.text });
        res.write(`data: ${data}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error("AI Chat Streaming Error:", error);
    // If headers are already sent, we can't send a 500 status code
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Failed to generate chat stream.", details: error.message, stack: error.stack });
    } else {
      res.write(`data: ${JSON.stringify({ error: "An error occurred during generation." })}\n\n`);
      res.end();
    }
  }
};
