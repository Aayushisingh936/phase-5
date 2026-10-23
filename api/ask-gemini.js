
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error: "Gemini API key is not configured in Vercel."
        });
    }

    try {
        const { question } = req.body || {};

        if (typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        if (question.length > 5000) {
            return res.status(400).json({
                error: "Your question must be under 5000 characters."
            });
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Answer in simple, clear English.
Use short paragraphs and headings when helpful.
Use bullet points for lists.
Explain technical concepts with examples when useful.

Question: ${question}`
        });

        if (!response.text) {
            return res.status(502).json({
                error: "Gemini did not return an answer."
            });
        }

        return res.status(200).json({
            answer: response.text
        });

    } catch (error) {
        console.error("Gemini API error:", error);

        return res.status(500).json({
            error: "Unable to generate an answer. Please try again."
        });
    }
}
