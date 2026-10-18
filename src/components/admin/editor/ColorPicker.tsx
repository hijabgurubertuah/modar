// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';

interface ColorPickerProps {
  onSelectColor: (color: string) => void;
  onClearColor: () => void;
  label: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ onSelectColor, onClearColor, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#2DD4BF');

  const presetColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
    '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#073D39', '#2DD4BF', '#A5D8D3'
  ];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2 rounded-lg hover:bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] flex items-center gap-1 text-xs font-medium cursor-pointer"
        title={label}
      >
        <Palette size={15} />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-30 bg-[#094843] border border-white/20 rounded-2xl p-3 shadow-2xl flex flex-col gap-3 w-56">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ECFEFF]">{label}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-[#A5D8D3]"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onSelectColor(c);
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-white/15">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <button
              type="button"
              onClick={() => {
                onSelectColor(customColor);
                setIsOpen(false);
              }}
              className="flex-1 py-1 rounded-lg bg-[#2DD4BF] text-[#073D39] text-xs font-bold cursor-pointer"
            >
              Pilih
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClearColor();
              setIsOpen(false);
            }}
            className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-red-300 cursor-pointer"
          >
            Hapus Warna
          </button>
        </div>
      )}
    </div>
  );
};
