
import { GoogleGenAI, Type } from "@google/genai";
import { EmotionAnalysis } from "../types";

export const analyzeEmotionFromImage = async (base64Image: string): Promise<EmotionAnalysis> => {
  // Create instance right before call for fresh environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = "gemini-3-flash-preview";

  const prompt = `Analyze the facial expression in this image. 
  Follow these rules:
  1. Identify primary emotion (eyes, mouth, eyebrows, posture).
  2. Identify secondary emotion if visible.
  3. Estimate emotion intensity (1-10).
  4. Provide a simple, friendly, respectful, and non-judgmental explanation.
  5. If the face is unclear, set isFaceDetected to false.
  6. DO NOT identify the person, guess personal traits, or provide medical/psychological diagnosis.
  
  Output the result in the specified JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFaceDetected: { type: Type.BOOLEAN },
            primaryEmotion: { type: Type.STRING },
            secondaryEmotion: { type: Type.STRING },
            intensity: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ["isFaceDetected", "primaryEmotion", "intensity", "explanation"],
        },
      },
    });

    const data = JSON.parse(response.text);
    
    return {
      ...data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
