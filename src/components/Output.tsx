import React from 'react';
import { Download, Copy, Share2, Maximize2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { GenerationResult } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OutputProps {
  result: GenerationResult | null;
  isGenerating: boolean;
  onImageClick?: (result: GenerationResult) => void;
}

export const Output: React.FC<OutputProps> = ({ result, isGenerating, onImageClick }) => {
  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `lumina-gen-${Date.now()}.png`;
    link.click();
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('Image copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 lg:p-8 bg-surface-dark/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-gray-400">
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Output</span>
        </div>
        
        {result && (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="btn-secondary p-2 rounded-lg"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDownload}
              className="btn-secondary p-2 rounded-lg"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-google-blue/20 border-t-google-blue animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-google-blue animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-medium text-white">Generating your vision...</h3>
                <p className="text-sm text-gray-400 max-w-[240px]">Gemini is crafting your image based on your prompt.</p>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div 
              key={result.imageUrl}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group w-full h-full flex items-center justify-center p-4"
            >
              <div 
                onClick={() => onImageClick?.(result)}
                className={cn(
                  "glass-panel p-2 shadow-2xl shadow-black/50 overflow-hidden flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                  result.aspectRatio === '1:1' ? 'aspect-square max-w-[min(100%,calc(100vh-320px))]' :
                  result.aspectRatio === '16:9' ? 'aspect-video max-w-full' :
                  result.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[calc(100vh-280px)]' :
                  result.aspectRatio === '4:3' ? 'aspect-[4/3] max-w-full' :
                  'aspect-[3/4] max-h-[calc(100vh-280px)]'
                )}
              >
                <img 
                  src={result.imageUrl} 
                  alt={result.prompt}
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-medium text-white shadow-xl flex items-center gap-2">
                  <div className="w-3 h-3 border border-white/50 rounded-sm" />
                  {result.aspectRatio} • {result.prompt.slice(0, 40)}...
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-6 text-gray-500"
            >
              <div className="w-20 h-20 rounded-3xl bg-surface-lighter border border-surface-border flex items-center justify-center">
                <ImageIcon className="w-10 h-10 opacity-20" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-medium text-gray-400">Ready to create?</p>
                <p className="text-sm max-w-[240px]">Enter a prompt on the left to start generating unique AI images.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
