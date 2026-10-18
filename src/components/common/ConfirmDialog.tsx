// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 bg-[#042F2E]/70 backdrop-blur-[6px] transition-opacity"
      />

      {/* Dialog box */}
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-[360px] rounded-[20px] bg-[#0B4F4A]/95 border border-white/20 p-5 shadow-2xl backdrop-blur-[20px] text-[#ECFEFF] flex flex-col gap-5"
      >
        <h3 className="text-base sm:text-lg font-semibold text-center leading-snug">
          {title}
        </h3>

        <div className="grid grid-cols-2 gap-3 mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-[#ECFEFF] text-sm sm:text-base font-medium transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] px-4 rounded-xl text-sm sm:text-base font-semibold transition-colors cursor-pointer ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#2DD4BF] hover:bg-[#20b8a4] text-[#042F2E]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
