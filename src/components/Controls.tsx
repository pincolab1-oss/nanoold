import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Sparkles, Image as ImageIcon, Layout, ArrowRight, Loader2 } from 'lucide-react';
import { AspectRatio } from '../services/geminiService';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ControlsProps {
  onGenerate: (prompt: string, aspectRatio: AspectRatio) => Promise<void>;
  isGenerating: boolean;
}

const ASPECT_RATIOS: { label: string; value: AspectRatio; icon: React.ReactNode }[] = [
  { label: '1:1', value: '1:1', icon: <div className="w-4 h-4 border-2 border-current rounded-sm" /> },
  { label: '16:9', value: '16:9', icon: <div className="w-5 h-3 border-2 border-current rounded-sm" /> },
  { label: '9:16', value: '9:16', icon: <div className="w-3 h-5 border-2 border-current rounded-sm" /> },
  { label: '4:3', value: '4:3', icon: <div className="w-5 h-4 border-2 border-current rounded-sm" /> },
  { label: '3:4', value: '3:4', icon: <div className="w-4 h-5 border-2 border-current rounded-sm" /> },
];

export const Controls: React.FC<ControlsProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt, aspectRatio);
  };

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8 h-full overflow-y-auto">
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Prompt</span>
        </div>
        
        <div className="relative group">
          <TextareaAutosize
            minRows={4}
            maxRows={12}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="input-field text-lg leading-relaxed placeholder:text-gray-600 group-hover:border-gray-600 transition-colors"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {prompt.length} / 2000
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Layout className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Aspect Ratio</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => setAspectRatio(ratio.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 relative overflow-hidden",
                aspectRatio === ratio.value 
                  ? "bg-google-blue/10 border-google-blue text-google-blue shadow-sm shadow-google-blue/10" 
                  : "bg-surface-lighter border-surface-border text-gray-400 hover:border-gray-600 hover:text-white"
              )}
            >
              {aspectRatio === ratio.value && (
                <motion.div 
                  layoutId="active-ratio"
                  className="absolute inset-0 bg-google-blue/5"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-2">
                {ratio.icon}
                <span className="text-xs font-medium">{ratio.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-auto pt-6">
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="btn-primary w-full h-14 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>Generate</span>
              <ArrowRight className="w-5 h-5 ml-auto opacity-50" />
            </>
          )}
        </button>
        
        <p className="text-center text-xs text-gray-500 mt-4 px-4 leading-relaxed">
          Powered by Gemini 2.5 Flash Image. Images are generated in high quality and stored in your session.
        </p>
      </div>
    </div>
  );
};
