import { useState, useEffect } from 'react';
import { Key, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface KeySelectionGuardProps {
  children: React.ReactNode;
}

export default function KeySelectionGuard({ children }: KeySelectionGuardProps) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for local dev if needed, assume true or handle error
        setHasKey(true);
      }
    } catch (e) {
      console.error("Error checking key:", e);
      setHasKey(false);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Per skill: assume success and proceed
      setHasKey(true);
    }
  };

  if (hasKey === null) return null; // Loading state

  if (hasKey === false) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAF8]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-panel p-10 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
            <Lock size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">Creative Access Required</h2>
            <p className="text-sm text-primary/40 leading-relaxed">
              To use high-fidelity image and video generation, you must select your own Google Cloud API key with billing enabled.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3 text-left">
            <Key size={18} className="text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-800">
              Users must select an API key from a paid Google Cloud project. 
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold ml-1 text-amber-900 underline"
              >
                Billing Docs <ExternalLink size={10} />
              </a>
            </p>
          </div>

          <button
            onClick={handleSelectKey}
            className="w-full btn-primary h-14 flex items-center justify-center gap-3 text-lg font-bold shadow-xl shadow-primary/20"
          >
            Select API Key
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
