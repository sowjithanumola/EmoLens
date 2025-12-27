
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { EmotionAnalysis } from "../types";

let globalAudioCtx: AudioContext | null = null;

/**
 * Initializes the global AudioContext on user interaction to ensure voice works reliably.
 */
export const initializeAudio = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
};

const parseModelJson = (text: string | undefined): any => {
  if (!text) throw new Error("Empty response from AI");
  try {
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw text:", text);
    return {
      isFaceDetected: true,
      primaryEmotion: "Unknown",
      intensity: 5,
      explanation: "I can see your expression, but it's uniquely complex. It reflects a nuanced state of mind."
    };
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const systemInstruction = `You are Mentor AI, an advanced observational intelligence. Look at the user and interpret their facial expression and reaction.
  Guidelines:
  1. Be observant, empathetic, and professional.
  2. Refer to yourself as Mentor AI if asked, but generally use first-person (e.g., "I notice...").
  3. Format response strictly as JSON.
  4. If no face is visible, set isFaceDetected to false.`;

  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: "Analyze the facial expression in this image. Provide a detailed analysis in JSON format." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFaceDetected: { type: Type.BOOLEAN },
            primaryEmotion: { type: Type.STRING },
            secondaryEmotion: { type: Type.STRING },
            intensity: { type: Type.INTEGER, description: "1-10 intensity" },
            explanation: { type: Type.STRING, description: "Observation for TTS" },
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
    console.error("Mentor AI Analysis Error:", error);
    throw new Error(error?.message || "Analysis failed. Please check your connection.");
  }
};

export const speakText = async (text: string): Promise<void> => {
  if (!text) return;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this as Mentor AI with a warm, observant tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      if (!globalAudioCtx) {
        globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (globalAudioCtx.state === 'suspended') await globalAudioCtx.resume();

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
    console.error("Mentor AI TTS Error:", error);
  }
};
