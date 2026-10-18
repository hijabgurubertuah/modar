// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { compressAndUploadImage } from './editorUtils';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, caption: string, align: 'left' | 'center' | 'full') => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [caption, setCaption] = useState('');
  const [align, setAlign] = useState<'left' | 'center' | 'full'>('center');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Berkas harus berupa gambar');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const imageUrl = await compressAndUploadImage(file);
      setIsUploading(false);
      onInsert(imageUrl, caption, align);
      setUrlInput('');
      setCaption('');
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      setError(err?.message || 'Gagal mengunggah gambar');
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('URL gambar wajib diisi');
      return;
    }
    onInsert(trimmed, caption, align);
    setUrlInput('');
    setCaption('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#094843] border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-[#ECFEFF]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sisipkan Gambar</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#A5D8D3] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-white/15 pb-2">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              tab === 'upload' ? 'bg-[#2DD4BF] text-[#073D39]' : 'text-[#A5D8D3] hover:bg-white/10'
            }`}
          >
            Unggah Berkas
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              tab === 'url' ? 'bg-[#2DD4BF] text-[#073D39]' : 'text-[#A5D8D3] hover:bg-white/10'
            }`}
          >
            Tautan URL
          </button>
        </div>

        {tab === 'upload' ? (
          <div className="flex flex-col gap-4">
            <label className="border-2 border-dashed border-white/25 hover:border-[#2DD4BF] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/20">
              {isUploading ? (
                <Loader2 size={32} className="animate-spin text-[#2DD4BF]" />
              ) : (
                <Upload size={28} className="text-[#2DD4BF]" />
              )}
              <span className="text-xs font-semibold text-[#ECFEFF]">
                {isUploading ? 'Mengunggah dan mengompres...' : 'Pilih gambar dari perangkat'}
              </span>
              <span className="text-[10px] text-[#A5D8D3]">PNG, JPG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#A5D8D3]">URL Gambar</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setError('');
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-[#ECFEFF] text-sm outline-none focus:border-[#2DD4BF]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#14B8A6] text-xs font-bold text-[#073D39] cursor-pointer shadow-[0_0_12px_rgba(45,212,191,0.3)]"
            >
              Sisipkan Gambar URL
            </button>
          </form>
        )}

        <div className="flex flex-col gap-3 pt-2 border-t border-white/15">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#A5D8D3]">Keterangan (Caption)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Keterangan gambar (opsional)"
              className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-[#ECFEFF] text-sm outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#A5D8D3]">Perataan & Ukuran</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAlign('left')}
                className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer border ${
                  align === 'left' ? 'bg-[#2DD4BF]/40 border-[#2DD4BF] text-[#ECFEFF]' : 'bg-black/20 border-white/15 text-[#A5D8D3]'
                }`}
              >
                Kiri
              </button>
              <button
                type="button"
                onClick={() => setAlign('center')}
                className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer border ${
                  align === 'center' ? 'bg-[#2DD4BF]/40 border-[#2DD4BF] text-[#ECFEFF]' : 'bg-black/20 border-white/15 text-[#A5D8D3]'
                }`}
              >
                Tengah
              </button>
              <button
                type="button"
                onClick={() => setAlign('full')}
                className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer border ${
                  align === 'full' ? 'bg-[#2DD4BF]/40 border-[#2DD4BF] text-[#ECFEFF]' : 'bg-black/20 border-white/15 text-[#A5D8D3]'
                }`}
              >
                Lebar Penuh
              </button>
            </div>
          </div>
        </div>

        {error && <span className="text-xs text-red-300">{error}</span>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#A5D8D3] cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
