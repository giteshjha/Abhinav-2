import { GoogleGenAI } from "@google/genai";
import { ImageGenerationConfig, VideoGenerationConfig } from "../types";

export const chatModel = "gemma-2-9b-it";
export const imageModel = "gemini-2.5-flash-image";
export const videoModel = "veo-3.1-lite-generate-preview";

export const systemInstruction = "You are Modern Prince, a polite, helpful, and highly capable AI assistant. Your goal is to provide clear, easy-to-understand responses to all users. Always maintain a respectful and welcoming tone. You have features like text chat, image generation, and video generation.";

// Functional helper to get fresh AI instance (needed for some models with dynamic keys)
function getAI(customKey?: string) {
  // Directly use process.env so that Vite's 'define' can replace them at build time
  const apiKey = customKey || 
                 process.env.API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.GEMMA_API_KEY ||
                 (import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : undefined);

  if (!apiKey) {
    throw new Error("No API Key found. If running locally, check .env. If deployed, set the environment variable. In AI Studio, ensure a key is selected.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateChatResponse(messages: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: chatModel,
    contents: messages,
    config: {
      systemInstruction,
    },
  });
  return response.text;
}

export async function enhancePrompt(prompt: string) {
  const ai = getAI();
  const instruction = "You are a creative prompt engineer. Transform the following brief idea into a detailed, descriptive artistic prompt for an image generator. Focus on lighting, style, composition, and mood. Keep it under 50 words. Only return the enhanced prompt text, nothing else.";
  const response = await ai.models.generateContent({
    model: chatModel,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { systemInstruction: instruction }
  });
  return response.text;
}

export async function generateImage(config: ImageGenerationConfig) {
  const ai = getAI();
  const contents = {
    parts: [
      { text: config.prompt },
      ...(config.sourceImageUrl ? [{ 
        inlineData: { 
          data: config.sourceImageUrl.split(',')[1], 
          mimeType: "image/png" 
        } 
      }] : [])
    ]
  };

  const response = await ai.models.generateContent({
    model: imageModel,
    contents,
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio,
        imageSize: config.imageSize,
      }
    }
  });

  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
}

export async function generateVideo(config: VideoGenerationConfig) {
  // For Veo, we strictly use the getAI helper which checks process.env.API_KEY
  const ai = getAI();
  
  const genParams: any = {
    model: videoModel,
    prompt: config.prompt,
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio,
    }
  };

  if (config.sourceImageUrl) {
    genParams.image = {
      imageBytes: config.sourceImageUrl.split(',')[1],
      mimeType: "image/png"
    };
  }

  let operation;
  try {
    operation = await ai.models.generateVideos(genParams);
  } catch (error: any) {
    if (error?.message?.includes('PERMISSION_DENIED') || error?.status === 403) {
      throw new Error("PERMISSION_REQUIRED");
    }
    throw error;
  }

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing for video download auth");

  const videoResponse = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
}
