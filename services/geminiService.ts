
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { EmotionAnalysis } from "../types";

// Helper to safely parse JSON from model response
const parseModelJson = (text: string | undefined): any => {
  if (!text) return { isFaceDetected: false, explanation: "No response from AI." };
  try {
    // Remove potential markdown code blocks if the model ignored responseMimeType
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw text:", text);
    return { isFaceDetected: false, explanation: "The AI response was malformed. Please try again." };
  }
};

const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const analyzeEmotionFromImage = async (base64Image: string): Promise<EmotionAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  // Using gemini-3-flash-preview for low-latency visual analysis
  const model = "gemini-3-flash-preview";

  const systemInstruction = `You are a Reaction and Emotion Analysis AI. Your role is to look at the user and describe what you see.
  
  Guidelines:
  1. Be observant and empathetic.
  2. Identify primary emotion and secondary cues.
  3. Provide a natural, first-person spoken explanation (e.g., "I notice a gentle lift in your eyes...").
  4. Intensity: 1-10.
  5. If no face is visible, set isFaceDetected to false.
  
  Format: JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image,
              },
            },
            { text: "Analyze my current facial expression and reaction." }
          ],
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster real-time reaction
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

    const data = parseModelJson(response.text);
    return {
      ...data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
    };
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    // Propagate more descriptive errors if possible
    if (error?.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API Key. Please check your configuration.");
    }
    throw error;
  }
};

let globalAudioCtx: AudioContext | null = null;

export const speakText = async (text: string): Promise<void> => {
  if (!text) return;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this analysis: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      if (!globalAudioCtx) {
        globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      if (globalAudioCtx.state === 'suspended') {
        await globalAudioCtx.resume();
      }

      const audioData = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, globalAudioCtx, 24000, 1);
      
      const source = globalAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(globalAudioCtx.destination);
      
      return new Promise((resolve) => {
        source.onended = () => resolve();
        source.start();
      });
    }
  } catch (error) {
    console.error("Gemini TTS Error:", error);
  }
};
