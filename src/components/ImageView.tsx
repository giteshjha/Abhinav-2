import { useState, useRef } from 'react';
import { Image as ImageIcon, Sparkles, Download, Upload, Loader2, X, RefreshCw, Wand2, History, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateImage, enhancePrompt } from '../lib/gemini';
import { ImageGenerationConfig } from '../types';

export default function ImageView() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<ImageGenerationConfig['aspectRatio']>('1:1');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    { name: 'None', prompt: '' },
    { name: 'Cinematic', prompt: 'cinematic lighting, ultra-realistic, 8k, highly detailed' },
    { name: 'Cyberpunk', prompt: 'cyberpunk style, neon lights, rainy street, futuristic' },
    { name: 'Watercolor', prompt: 'watercolor painting, soft edges, artistic, pastel colors' },
    { name: 'Digital Art', prompt: 'vibrant digital art, clean lines, professional illustration' },
    { name: 'Sketch', prompt: 'charcoal sketch, hand-drawn, rough textures, artistic' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      if (enhanced) setPrompt(enhanced.trim());
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const stylePrompt = styles.find(s => s.name === selectedStyle)?.prompt;
      const finalPrompt = stylePrompt ? `${prompt}, ${stylePrompt}` : prompt;

      const config: ImageGenerationConfig = {
        prompt: finalPrompt,
        aspectRatio,
        imageSize: '1K',
        sourceImageUrl: sourceImage || undefined
      };
      
      const imageUrl = await generateImage(config);
      if (imageUrl) {
        setResultImage(imageUrl);
        setHistory(prev => [imageUrl, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clear = () => {
    setPrompt('');
    setResultImage(null);
    setSourceImage(null);
    setSelectedStyle(null);
  };

  const examples = [
    "A majestic lion with a golden mane",
    "A futuristic city with floating gardens",
    "An oil painting of a peaceful library",
    "A cute robot making pancakes"
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-primary/5 bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-primary">Royal Image Forge</h1>
          <p className="text-sm text-primary/40">Develop high-fidelity visual concepts for your kingdom</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={clear}
            className="p-2 rounded-xl hover:bg-primary/5 text-primary/40 transition-colors"
            title="Clear everything"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-panel p-6 space-y-6 bg-white/40 backdrop-blur-xl border border-white/20">
              {/* Aspect Ratio Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-3 block">Perspective</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['1:1', '4:3', '3:4', '16:9', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        aspectRatio === ratio 
                          ? 'border-primary bg-primary text-secondary' 
                          : 'border-primary/10 hover:border-primary/40 bg-white/20'
                      }`}
                    >
                      <div className={`border-2 border-current rounded-sm ${
                        ratio === '1:1' ? 'w-4 h-4' : 
                        ratio === '4:3' ? 'w-5 h-4' :
                        ratio === '3:4' ? 'w-3 h-5' :
                        ratio === '16:9' ? 'w-6 h-3' : 'w-3 h-6'
                      }`} />
                      <span className="text-[10px] mt-1 font-bold">{ratio}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspiration & Prompt Refinement */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Inspiration</label>
                  <button
                    onClick={handleEnhance}
                    disabled={!prompt.trim() || isEnhancing}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all disabled:opacity-30"
                  >
                    {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    Magic Refine
                  </button>
                </div>
                
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you wish to see..."
                    className="w-full min-h-[140px] bg-white/20 backdrop-blur-md rounded-2xl p-4 outline-none border border-primary/5 focus:border-primary/20 transition-all resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {examples.map((ex, i) => (
                    <button 
                      key={i} 
                      onClick={() => setPrompt(ex)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-primary/5 text-primary/60 hover:bg-primary/10 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-3 block">Artistic Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.name}
                      onClick={() => setSelectedStyle(style.name === 'None' ? null : style.name)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                        (selectedStyle === style.name || (style.name === 'None' && !selectedStyle))
                          ? 'bg-primary text-secondary border-primary'
                          : 'bg-white/10 text-primary/60 border-primary/5 hover:border-primary/20'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Foundational Image (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer group h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden ${
                    sourceImage ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30 bg-white/10'
                  }`}
                >
                  {sourceImage ? (
                    <>
                      <img src={sourceImage} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                      <ImageIcon className="relative z-10 text-primary" />
                      <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider">Image Loaded</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSourceImage(null); }}
                        className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg text-primary hover:bg-white z-20"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-primary/20 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/40">Drop keyframe</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full btn-primary h-14 flex items-center justify-center gap-3 text-lg font-bold shadow-lg shadow-primary/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Forging...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Bring to Life
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Showcase */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group aspect-square lg:aspect-video xl:aspect-square bg-black/5 rounded-[40px] overflow-hidden border border-primary/5">
              <AnimatePresence mode="wait">
                {!resultImage ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 text-primary/10 border border-primary/10">
                      <ImageIcon size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-primary opacity-40">Your creation awaits</h3>
                    <p className="text-sm text-primary/30 mt-2 max-w-sm">Every stroke is calculated by Modern Prince precision models.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full shadow-inner"
                  >
                    <img src={resultImage} alt="Generated result" className="w-full h-full object-cover" />
                    
                    {/* Floating Controls */}
                    <div className="absolute top-6 right-6 flex gap-2">
                       <button 
                        onClick={() => setShowFullImage(resultImage)}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all border border-white/20"
                      >
                        <Maximize2 size={20} />
                      </button>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-between items-end">
                      <div className="text-white">
                        <p className="text-xs uppercase tracking-widest font-bold opacity-60">Hand-crafted by Modern Prince</p>
                        <p className="text-sm font-medium mt-1">Industrial Grade 1K Precision</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleGenerate()} 
                          className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10"
                          title="Redo"
                        >
                          <RefreshCw size={24} />
                        </button>
                        <a 
                          href={resultImage} 
                          download="prince-creation.png" 
                          className="p-4 bg-white rounded-2xl text-primary hover:bg-secondary transition-all shadow-xl"
                        >
                          <Download size={24} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isGenerating && (
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-md flex items-center justify-center z-20">
                  <div className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl flex flex-col items-center gap-6 text-center border border-white">
                    <div className="relative">
                      <div className="w-20 h-20 border-8 border-primary/5 rounded-full"></div>
                      <div className="absolute inset-0 w-20 h-20 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-primary/20 animate-pulse" size={32} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary">Refining Canvas</h4>
                      <p className="text-xs text-primary/40 font-medium uppercase tracking-widest mt-1">Awaiting Modern Prince Neural Output</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* History Bar */}
            {history.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary/40 text-xs font-bold uppercase tracking-widest">
                  <History size={14} />
                  Session History
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {history.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setResultImage(url)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                        resultImage === url ? 'border-primary scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <button 
              className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors"
              onClick={() => setShowFullImage(null)}
            >
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              src={showFullImage}
              className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
