import { useState, useRef } from 'react';
import { Film, Sparkles, Download, Upload, Loader2, X, Play, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateVideo } from '../lib/gemini';
import { VideoGenerationConfig } from '../types';

export default function VideoView() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<VideoGenerationConfig['aspectRatio']>('16:9');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Sketching keyframes...",
    "Rendering temporal consistency...",
    "Applying cinematic lighting...",
    "Finalizing motion vectors...",
    "Polishing video output..."
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setLoadingStep(0);
    
    // Simulate step progress
    const stepInterval = setInterval(() => {
      setLoadingStep(s => (s + 1) % steps.length);
    }, 4000);

    try {
      const config: VideoGenerationConfig = {
        prompt,
        aspectRatio,
        resolution: '1080p',
        sourceImageUrl: sourceImage || undefined
      };
      
      const videoUrl = await generateVideo(config);
      setResultVideo(videoUrl);
    } catch (error: any) {
      console.error(error);
      if (error.message === "PERMISSION_REQUIRED") {
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          // Prompt user to try again after selecting key
          alert("Please try your generation again now that you have selected a key.");
        }
      } else {
        alert("I apologize, but I encountered an error during generation. Please try again.");
      }
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-primary/5 bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-primary">Cinematic Motion</h1>
          <p className="text-sm text-primary/40">Powered by Veo Generative AI</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider">
            High Demand
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-12">
        {/* Input Interface */}
        <section className="glass-panel p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-3 block">Scene Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A peaceful sunrise over the Taj Mahal, soft cinematic camera pan..."
                  className="w-full min-h-[160px] bg-secondary/30 rounded-2xl p-6 outline-none border border-primary/5 focus:border-primary/20 transition-all resize-none text-base leading-relaxed"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    aspectRatio === '16:9' ? 'border-primary bg-primary text-secondary' : 'border-primary/5 hover:border-primary/20 bg-white'
                  }`}
                >
                  <div className="w-12 h-7 border-2 border-current rounded-sm opacity-60" />
                  <span className="text-xs font-bold">Landscape</span>
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    aspectRatio === '9:16' ? 'border-primary bg-primary text-secondary' : 'border-primary/5 hover:border-primary/20 bg-white'
                  }`}
                >
                  <div className="w-7 h-12 border-2 border-current rounded-sm opacity-60" />
                  <span className="text-xs font-bold">Portrait</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-3 block">Starting Image (Image-to-Video)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative h-full min-h-[160px] cursor-pointer group rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all overflow-hidden ${
                    sourceImage ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30 bg-white'
                  }`}
                >
                  {sourceImage ? (
                    <>
                      <img src={sourceImage} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                      <ImageIcon className="relative z-10 text-primary" />
                      <span className="relative z-10 text-xs font-bold text-primary">Keyframe Selected</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSourceImage(null); }}
                        className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-sm text-primary hover:bg-red-50 hover:text-red-500 z-20 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 border-2 border-primary/20 rounded-full flex items-center justify-center text-primary/40 group-hover:border-primary group-hover:text-primary transition-all">
                        <Upload size={24} />
                      </div>
                      <span className="text-xs text-primary/40 font-medium">Animate a static image</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs leading-relaxed">
                <strong>Note:</strong> Video generation is computationally intensive and may take up to 2-3 minutes. Modern Prince will stay connected until your masterpiece is ready.
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="px-12 h-16 btn-primary flex items-center gap-4 text-xl font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 disabled:scale-100 disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating Cinematic Scene...
                </>
              ) : (
                <>
                  <Film size={24} />
                  Start Generation
                </>
              )}
            </button>
          </div>
        </section>

        {/* Video Preview */}
        <section className="relative">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[480px] bg-primary/5 rounded-[40px] flex flex-col items-center justify-center border border-primary/10 overflow-hidden relative"
              >
                {/* Background pulse effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />
                
                <div className="relative z-10 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 border-8 border-primary/10 rounded-full animate-spin-slow"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{steps[loadingStep]}</h3>
                    <p className="text-primary/40 font-medium">Modern Prince is crafting your vision into motion</p>
                  </div>
                </div>
              </motion.div>
            ) : resultVideo ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[40px] overflow-hidden shadow-2xl border border-white/20 bg-black group"
              >
                <video 
                  src={resultVideo} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-auto max-h-[600px] object-contain"
                />
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={resultVideo} 
                    download="lumina-video.mp4"
                    className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl text-primary font-bold shadow-xl hover:bg-secondary transition-colors"
                  >
                    <Download size={20} />
                    Save Video
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[400px] bg-white border-2 border-dashed border-primary/10 rounded-[40px] flex flex-col items-center justify-center text-primary/30 p-12 text-center"
              >
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Play size={32} />
                </div>
                <h3 className="text-xl font-bold opacity-60">Ready to animate your ideas</h3>
                <p className="max-w-md mx-auto mt-2 text-sm">Videos are rendered in full high-definition with temporal coherence using world-class AI models.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
