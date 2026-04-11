/**
 * Firebase Cloud Function stub — Gemini API proxy.
 *
 * In production this would be deployed as a Firebase Cloud Function so the
 * Gemini API key never reaches the browser.  During local development the
 * same logic runs as Vite middleware (see vite.config.ts) and as an Express
 * route in server.js for the production build.
 *
 * Deploy with:
 *   firebase deploy --only functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";

interface ChatRequestBody {
  message: string;
  context: string;
}

export const chat = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, context } = req.body as ChatRequestBody;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing Gemini API key configuration" });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are StadiumAI, a helpful venue assistant at a large sporting stadium. You have access to the following live zone data: ${context}. Help attendees with: finding the shortest queue, navigating to their seat, food and restroom recommendations based on current crowd levels, and general venue questions. Be concise. Max 3 sentences per response.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
      config: { systemInstruction },
    });

    res.json({ reply: response.text });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini proxy error:", errorMessage);
    res.status(500).json({ error: "Failed to process chat" });
  }
});
