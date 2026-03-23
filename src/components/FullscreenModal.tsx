import React from 'react';
import { X, Download, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenerationResult } from '../services/geminiService';

interface FullscreenModalProps {
  image: GenerationResult | null;
  onClose: () => void;
}

export const FullscreenModal: React.FC<FullscreenModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `lumina-full-${Date.now()}.png`;
    link.click();
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(image.imageUrl);
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
        onClick={onClose}
      >
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[110]"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </motion.button>

        <div className="absolute top-6 left-6 flex items-center gap-3 z-[110]">
          <button 
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 px-4"
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Copy</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 px-4"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Download</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-w-full max-h-full flex flex-col items-center gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative group shadow-2xl shadow-black/50 rounded-2xl overflow-hidden border border-white/10">
            <img
              src={image.imageUrl}
              alt={image.prompt}
              className="max-w-full max-h-[80vh] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="max-w-2xl text-center space-y-2 px-4">
            <p className="text-white text-lg font-medium leading-relaxed">
              {image.prompt}
            </p>
            <div className="flex items-center justify-center gap-3 text-gray-400 text-sm">
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {image.aspectRatio}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Gemini 2.5 Flash Image</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
