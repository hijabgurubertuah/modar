// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string, openInNewTab: boolean) => void;
  initialUrl?: string;
  initialText?: string;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialUrl = '',
  initialText = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('URL wajib diisi');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('mailto:')) {
      setError('URL harus diawali http://, https://, atau mailto:');
      return;
    }

    onInsert(trimmedUrl, text.trim() || trimmedUrl, openInNewTab);
    setUrl('');
    setText('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#094843] border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-[#ECFEFF]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sisipkan Tautan</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#A5D8D3] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#A5D8D3]">Teks Tautan</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Contoh: Kunjungi Web"
              className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-[#ECFEFF] text-sm outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#A5D8D3]">URL Tautan</label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-[#ECFEFF] text-sm outline-none focus:border-[#2DD4BF]"
            />
            {error && <span className="text-xs text-red-300">{error}</span>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="newTab"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="rounded bg-black/30 border-white/15 text-[#2DD4BF] focus:ring-0 cursor-pointer w-4 h-4"
            />
            <label htmlFor="newTab" className="text-xs font-medium text-[#ECFEFF] cursor-pointer">
              Buka di tab baru
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#A5D8D3] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#14B8A6] text-xs font-bold text-[#073D39] cursor-pointer shadow-[0_0_12px_rgba(45,212,191,0.3)]"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
