import { GoogleGenAI } from "@google/genai";
import { ImageGenerationConfig, VideoGenerationConfig } from "../types";

export const DEFAULT_CHAT_MODEL = "gemma-4-26b-a4b-it";
export const CHAT_MODEL_FALLBACKS = [
  "gemma-3-27b-it",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

export function buildChatModelCandidates(primaryModel = DEFAULT_CHAT_MODEL) {
  return Array.from(
    new Set([primaryModel.trim(), ...CHAT_MODEL_FALLBACKS].filter(Boolean)),
  );
}

export const chatModel =
  process.env.GEMINI_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
export const chatModelCandidates = buildChatModelCandidates(chatModel);
export const imageModel = "gemini-2.5-flash-image";
export const videoModel = "veo-3.1-lite-generate-preview";

export const systemInstruction = "You are Modern Prince, a polite, helpful, and highly capable AI assistant. Your goal is to provide clear, easy-to-understand responses to all users. Always maintain a respectful and welcoming tone. You have features like text chat, image generation, and video generation.";

// Functional helper to get fresh AI instance (needed for some models with dynamic keys)
function getAI(customKey?: string) {
  // Enhanced key detection for different environments (AI Studio, Vercel, Local)
  const apiKey = customKey || 
                 process.env.GEMINI_API_KEY || 
                 process.env.API_KEY || 
                 process.env.GEMMA_API_KEY ||
                 (typeof window !== 'undefined' && (window as any).VITE_GEMINI_API_KEY);

  if (!apiKey) {
    throw new Error("No API Key found. Please ensure GEMINI_API_KEY is set in your environment (e.g. Vercel dashboard).");
  }
  return new GoogleGenAI({ apiKey });
}

export function shouldRetryWithAlternateModel(error: unknown) {
  const status = (error as { status?: number })?.status;
  const message = String((error as { message?: string })?.message || "").toLowerCase();

  if (status === 404 || status === 429) {
    return true;
  }

  return (
    (message.includes("model") &&
      (message.includes("deprecated") ||
        message.includes("not found") ||
        message.includes("not supported") ||
        message.includes("not available"))) ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit")
  );
}

export async function generateTextWithModelFallback(
  runModel: (model: string) => Promise<string | undefined>,
  modelCandidates = chatModelCandidates,
) {
  let lastError: unknown;

  for (const [index, model] of modelCandidates.entries()) {
    try {
      return await runModel(model);
    } catch (error) {
      lastError = error;

      if (!shouldRetryWithAlternateModel(error) || index === modelCandidates.length - 1) {
        throw error;
      }

      console.warn(`Retrying with alternate Gemini model after ${model} failed.`, error);
    }
  }

  throw lastError ?? new Error("Unable to generate a Gemini response.");
}

export async function generateChatResponse(messages: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const ai = getAI();
  return generateTextWithModelFallback(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: messages,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  });
}

export async function enhancePrompt(prompt: string) {
  const ai = getAI();
  const instruction = "You are a creative prompt engineer. Transform the following brief idea into a detailed, descriptive artistic prompt for an image generator. Focus on lighting, style, composition, and mood. Keep it under 50 words. Only return the enhanced prompt text, nothing else.";
  return generateTextWithModelFallback(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: instruction }
    });

    return response.text;
  });
}

export async function prepareImagePrompt(prompt: string) {
  const enhanced = await enhancePrompt(prompt);
  return enhanced?.trim() || prompt.trim();
}

export async function generateImage(config: ImageGenerationConfig) {
  const ai = getAI();
  const preparedPrompt = config.skipPromptPreparation
    ? config.prompt.trim()
    : await prepareImagePrompt(config.prompt);
  const contents = {
    parts: [
      { text: preparedPrompt },
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
