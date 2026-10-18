// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (embedHtml: string) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError('URL atau kode embed wajib diisi');
      return;
    }

    let embedUrl = '';
    if (trimmed.includes('<iframe')) {
      const match = trimmed.match(/src="([^"]+)"/);
      if (match && match[1]) {
        embedUrl = match[1];
      } else {
        setError('Format iframe tidak valid');
        return;
      }
    } else {
      embedUrl = trimmed;
      if (embedUrl.includes('watch?v=')) {
        embedUrl = embedUrl.replace('watch?v=', 'embed/');
      } else if (embedUrl.includes('youtu.be/')) {
        embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
      } else if (embedUrl.includes('drive.google.com') && !embedUrl.includes('/preview')) {
        embedUrl = embedUrl.replace('/view', '/preview').replace('/edit', '/preview');
      }
    }

    const allowedDomains = ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'drive.google.com'];
    try {
      const parsed = new URL(embedUrl);
      const isAllowed = allowedDomains.some((d) => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
      if (!isAllowed) {
        setError('Domain video tidak didukung (gunakan YouTube atau Google Drive)');
        return;
      }
    } catch {
      setError('URL video tidak valid');
      return;
    }

    const embedHtml = `<div class="video-container" style="position: relative; margin: 1.5em 0; border-radius: 0.75rem; overflow: hidden; background: #000; border: 1px solid rgba(0,0,0,0.1);">
  <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; width: 100%;">
    <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen="true" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe>
  </div>
</div>`;

    onInsert(embedHtml);
    setInputVal('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#094843] border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-[#ECFEFF]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sisipkan Video</h2>
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
            <label className="text-xs font-semibold text-[#A5D8D3]">URL YouTube / Google Drive / Kode Iframe</label>
            <textarea
              rows={3}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError('');
              }}
              placeholder="https://www.youtube.com/watch?v=... atau <iframe src=...>"
              className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-[#ECFEFF] text-sm outline-none focus:border-[#2DD4BF] resize-none"
            />
            {error && <span className="text-xs text-red-300">{error}</span>}
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
              Sisipkan Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
