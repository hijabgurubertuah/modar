// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Trash2, Loader2, Link as LinkIcon, Upload } from 'lucide-react';

interface ImageUploaderProps {
  label?: string;
  required?: boolean;
  value?: string;
  sourceType?: 'tautan' | 'drive';
  onChange: (value: string, sourceType: 'tautan' | 'drive') => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  required = false,
  value = '',
  sourceType = 'tautan',
  onChange,
  className = '',
}) => {
  const [tab, setTab] = useState<'tautan' | 'unggah'>(sourceType === 'drive' ? 'unggah' : 'tautan');
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    setImageError(false);
    onChange(e.target.value, 'tautan');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size max 5MB in code without showing instructions
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file melebihi batas');
      return;
    }

    setIsUploading(true);
    setImageError(false);

    // Read and compress image to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        setIsUploading(false);
        setUrlInput(compressedBase64);
        onChange(compressedBase64, 'drive');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setUrlInput('');
    setImageError(false);
    onChange('', 'tautan');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[#A5D8D3] flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-[#FBBF24]">*</span>}
        </label>
      )}

      {/* Source Selector Tabs */}
      <div className="flex items-center gap-1 bg-[#042F2E]/60 p-1 rounded-xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setTab('tautan')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'tautan'
              ? 'bg-[#2DD4BF] text-[#042F2E] font-semibold'
              : 'text-[#A5D8D3] hover:text-[#ECFEFF]'
          }`}
        >
          <LinkIcon size={14} />
          <span>Tautan</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('unggah')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'unggah'
              ? 'bg-[#2DD4BF] text-[#042F2E] font-semibold'
              : 'text-[#A5D8D3] hover:text-[#ECFEFF]'
          }`}
        >
          <Upload size={14} />
          <span>Unggah</span>
        </button>
      </div>

      {/* Input Mode */}
      {tab === 'tautan' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="https://"
            className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0F766E]/30 border border-white/15 text-[#ECFEFF] placeholder-white/30 text-sm focus:border-[#2DD4BF] outline-none"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F766E]/50 hover:bg-[#0F766E]/70 border border-white/20 text-[#ECFEFF] text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors active:scale-98 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin text-[#2DD4BF]" />
            ) : (
              <Upload size={16} className="text-[#2DD4BF]" />
            )}
            <span>Pilih Gambar</span>
          </button>
        </div>
      )}

      {/* Preview with Delete Button */}
      {value ? (
        <div className="relative mt-2 w-fit rounded-xl border border-white/15 overflow-hidden bg-black/20 p-1 flex items-center gap-3">
          {!imageError ? (
            <img
              src={value}
              alt=""
              onError={() => setImageError(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-white/10 flex items-center justify-center text-[#A5D8D3]">
              <ImageIcon size={24} />
            </div>
          )}

          <button
            type="button"
            onClick={handleRemove}
            aria-label="Hapus Gambar"
            className="mr-2 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
};
