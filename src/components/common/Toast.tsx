// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#073D39]/95 border border-[#2DD4BF]/40 text-[#ECFEFF] shadow-xl backdrop-blur-[16px] text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
      {type === 'success' ? (
        <CheckCircle2 size={16} className="text-[#2DD4BF] shrink-0" />
      ) : (
        <AlertCircle size={16} className="text-[#EF4444] shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
