import React from 'react';
import { Sparkles, Settings, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, User } from '../firebase';
import { motion } from 'motion/react';

interface HeaderProps {
  user: User | null;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenSettings }) => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="h-16 border-b border-surface-border bg-surface-dark/50 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-google-blue via-google-red to-google-yellow rounded-xl flex items-center justify-center shadow-lg shadow-google-blue/20">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight hidden sm:block">
          Lumina <span className="text-gray-400 font-normal">Studio</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenSettings}
              className="p-2 hover:bg-surface-lighter rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="h-8 w-[1px] bg-surface-border mx-1" />
            
            <div className="flex items-center gap-3 bg-surface-lighter pl-1 pr-3 py-1 rounded-full border border-surface-border">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-8 h-8 rounded-full border border-surface-border"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-google-blue flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium truncate max-w-[100px]">{user.displayName}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] text-gray-400 hover:text-google-red transition-colors text-left"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="btn-secondary text-sm"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
};
