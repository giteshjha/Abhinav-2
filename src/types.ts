export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'video';
  mediaUrl?: string;
};

export type AppMode = 'chat' | 'image' | 'video' | 'knowledge';

export interface VideoGenerationConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  sourceImageUrl?: string;
}

export interface ImageGenerationConfig {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  imageSize: '512px' | '1K' | '2K';
  sourceImageUrl?: string;
  skipPromptPreparation?: boolean;
}
