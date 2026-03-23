import React from 'react';
import { Image as ImageIcon, Trash2, Download, ExternalLink, Sparkles, Maximize2 } from 'lucide-react';
import { GenerationResult } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryProps {
  images: GenerationResult[];
  onSelect: (image: GenerationResult) => void;
  onClear: () => void;
  onDelete: (index: number) => void;
  onFullscreen?: (image: GenerationResult) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onSelect, onClear, onDelete, onFullscreen }) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 p-8">
        <div className="w-16 h-16 rounded-full bg-surface-lighter flex items-center justify-center border border-surface-border">
          <ImageIcon className="w-8 h-8 opacity-20" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400">No images yet</p>
          <p className="text-xs max-w-[180px] mt-1">Generated images from this session will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-dark/80 backdrop-blur-xl border-l border-surface-border w-80">
      <div className="p-4 border-b border-surface-border flex items-center justify-between sticky top-0 bg-surface-dark/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-google-blue" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Session Gallery</h3>
          <span className="text-[10px] bg-surface-border px-1.5 py-0.5 rounded-full text-gray-400">
            {images.length}
          </span>
        </div>
        <button 
          onClick={onClear}
          className="p-1.5 hover:bg-google-red/10 hover:text-google-red rounded-lg transition-colors text-gray-500"
          title="Clear all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {images.map((img, idx) => (
            <motion.div
              key={`${img.imageUrl}-${idx}`}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative glass-panel p-1.5 cursor-pointer hover:border-google-blue/50 transition-all duration-300"
              onClick={() => onSelect(img)}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-dark">
                <img 
                  src={img.imageUrl} 
                  alt={img.prompt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                    {img.prompt}
                  </p>
                </div>
              </div>
              
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onFullscreen?.(img);
                  }}
                  className="p-1.5 bg-black/60 backdrop-blur-md hover:bg-google-blue text-white rounded-lg transition-colors shadow-lg"
                  title="View Fullscreen"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(idx);
                  }}
                  className="p-1.5 bg-black/60 backdrop-blur-md hover:bg-google-red text-white rounded-lg transition-colors shadow-lg"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <a 
                  href={img.imageUrl}
                  download={`lumina-gen-${idx}.png`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-black/60 backdrop-blur-md hover:bg-google-blue text-white rounded-lg transition-colors shadow-lg"
                  title="Download"
                >
                  <Download className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
