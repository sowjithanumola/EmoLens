
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { EmotionAnalysis } from "../types";

// Audio Utility: Decode base64 to Uint8Array
const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Audio Utility: Decode raw PCM data to AudioBuffer
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
  const model = "gemini-3-flash-preview";

  const prompt = `You are an Emotion Analysis AI observer. Analyze the facial expression in this image. 
  Follow these rules:
  1. Identify primary emotion.
  2. Identify secondary subtle tones.
  3. Estimate intensity (1-10).
  4. Provide a friendly, first-person explanation (e.g., "I can see a warm smile that suggests you're feeling quite happy..."). 
     Make it sound natural as if you are speaking to the user.
  5. Set isFaceDetected to false if no face is clear.
  6. DO NOT use names or diagnose medical conditions.
  
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
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};

export const speakText = async (text: string): Promise<void> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this naturally: ${text}` }] }],
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
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioData = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, audioCtx, 24000, 1);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error("Gemini TTS Error:", error);
  }
};
