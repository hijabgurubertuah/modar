// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  src: string | null;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!src) return null;

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#042F2E]/95 backdrop-blur-md transition-all duration-220 animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setScale((s) => Math.max(1, s - 0.5))}
          className="w-10 h-10 rounded-full bg-[#0F766E]/60 border border-[#2DD4BF]/30 flex items-center justify-center text-[#ECFEFF] hover:bg-[#0F766E] transition cursor-pointer"
          title="Perkecil"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(4, s + 0.5))}
          className="w-10 h-10 rounded-full bg-[#0F766E]/60 border border-[#2DD4BF]/30 flex items-center justify-center text-[#ECFEFF] hover:bg-[#0F766E] transition cursor-pointer"
          title="Perbesar"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#0F766E]/80 border border-[#2DD4BF]/40 flex items-center justify-center text-[#ECFEFF] hover:bg-red-600 transition cursor-pointer shadow-lg"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image Container */}
      <div
        className="relative max-w-[92vw] max-h-[90vh] overflow-hidden flex items-center justify-center cursor-zoom-in"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={src}
          alt="Pratinjau Ukuran Penuh"
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-transform duration-150 select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? 'grab' : 'zoom-in',
          }}
          draggable={false}
          onError={(e) => {
            // If image fails to load, close viewer
            onClose();
          }}
        />
      </div>
    </div>
  );
};
