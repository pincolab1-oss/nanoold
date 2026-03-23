import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { Output } from './components/Output';
import { Gallery } from './components/Gallery';
import { FullscreenModal } from './components/FullscreenModal';
import { generateImage, GenerationResult, AspectRatio } from './services/geminiService';
import { auth, onAuthStateChanged, User, db, collection, addDoc, serverTimestamp, Timestamp } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { PanelLeftClose, PanelLeftOpen, Sparkles, AlertCircle } from 'lucide-react';

const SESSION_GALLERY_KEY = 'lumina_session_gallery';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [gallery, setGallery] = useState<GenerationResult[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<GenerationResult | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load gallery from local storage
  useEffect(() => {
    const savedGallery = localStorage.getItem(SESSION_GALLERY_KEY);
    if (savedGallery) {
      try {
        setGallery(JSON.parse(savedGallery));
      } catch (e) {
        console.error("Failed to load gallery:", e);
      }
    }
  }, []);

  // Save gallery to local storage
  useEffect(() => {
    localStorage.setItem(SESSION_GALLERY_KEY, JSON.stringify(gallery));
  }, [gallery]);

  const handleGenerate = async (prompt: string, aspectRatio: AspectRatio) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateImage(prompt, aspectRatio);
      setCurrentResult(result);
      setGallery(prev => [result, ...prev]);

      // If user is logged in, save to Firestore
      if (user) {
        try {
          await addDoc(collection(db, `users/${user.uid}/images`), {
            id: crypto.randomUUID(),
            userId: user.uid,
            prompt: result.prompt,
            aspectRatio: result.aspectRatio,
            imageUrl: result.imageUrl,
            createdAt: serverTimestamp(),
          });
        } catch (fsError) {
          console.error("Failed to save to Firestore:", fsError);
          // We don't block the UI if Firestore fails, as it's already in session gallery
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearGallery = () => {
    if (window.confirm("Are you sure you want to clear your session gallery? This won't affect your saved images in the cloud.")) {
      setGallery([]);
      localStorage.removeItem(SESSION_GALLERY_KEY);
    }
  };

  const handleDeleteImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-google-blue/20 border-t-google-blue rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Initializing Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-dark overflow-hidden">
      <Header user={user} onOpenSettings={() => {}} />

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Controls */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-surface-border flex-shrink-0 bg-surface-dark z-20">
          <Controls onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>

        {/* Center Panel: Output */}
        <div className="flex-1 relative bg-surface-dark/50 flex flex-col overflow-hidden">
          <Output 
            result={currentResult} 
            isGenerating={isGenerating} 
            onImageClick={setFullscreenImage}
          />
          
          {/* Error Toast */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
              >
                <div className="bg-google-red/10 border border-google-red/50 backdrop-blur-xl px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl shadow-google-red/20">
                  <div className="w-10 h-10 rounded-full bg-google-red/20 flex items-center justify-center text-google-red">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Generation Failed</span>
                    <span className="text-xs text-gray-300 max-w-[300px]">{error}</span>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-4 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gallery Toggle Button (Mobile/Tablet) */}
          <button 
            onClick={() => setIsGalleryOpen(!isGalleryOpen)}
            className="absolute top-6 right-6 z-30 p-2 glass-panel hover:bg-surface-border transition-colors lg:hidden"
          >
            {isGalleryOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
        </div>

        {/* Right Panel: Gallery */}
        <AnimatePresence mode="wait">
          {isGalleryOpen && (
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 lg:relative z-40"
            >
              <Gallery 
                images={gallery} 
                onSelect={setCurrentResult} 
                onClear={handleClearGallery}
                onDelete={handleDeleteImage}
                onFullscreen={setFullscreenImage}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Gallery Toggle (Desktop) */}
        {!isGalleryOpen && (
          <button 
            onClick={() => setIsGalleryOpen(true)}
            className="absolute top-6 right-6 z-30 p-2 glass-panel hover:bg-surface-border transition-colors hidden lg:block"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </main>

      {/* Footer Info */}
      <footer className="h-8 border-t border-surface-border bg-surface-dark/80 backdrop-blur-md px-6 flex items-center justify-between text-[10px] text-gray-500 font-medium tracking-wider uppercase">
        <div className="flex items-center gap-4">
          <span>Gemini 2.5 Flash Image</span>
          <span className="w-1 h-1 rounded-full bg-surface-border" />
          <span>v1.0.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-google-green" />
            System Ready
          </span>
          {user && (
            <span className="text-google-blue">
              Cloud Sync Active
            </span>
          )}
        </div>
      </footer>

      <FullscreenModal 
        image={fullscreenImage} 
        onClose={() => setFullscreenImage(null)} 
      />
    </div>
  );
}
