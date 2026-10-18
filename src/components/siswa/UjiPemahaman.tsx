// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { UjiPemahamanData } from '../../types';
import { useApp } from '../../context/AppContext';
import { isUjiAnsweredCorrectly } from '../../services/storage';

interface UjiPemahamanProps {
  data: UjiPemahamanData;
  pageId: string;
  materialId: string;
  isLastPage: boolean;
  onAdvancePage: () => void;
  isPreview?: boolean;
  onImageViewerOpen?: (src: string) => void;
}

export const UjiPemahaman: React.FC<UjiPemahamanProps> = ({
  data,
  pageId,
  materialId,
  isLastPage,
  onAdvancePage,
  isPreview = false,
  onImageViewerOpen = () => {},
}) => {
  const { session, recordUjiSuccess, cmsSettings } = useApp();
  const studentNisn = session?.nisn || 'guest';

  // Check if already answered in local state (ignored in preview)
  const alreadyAnswered = !isPreview && isUjiAnsweredCorrectly(studentNisn, pageId);

  const [isVisible, setIsVisible] = useState(alreadyAnswered || data.delaySeconds === 0);
  const [attempts, setAttempts] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    alreadyAnswered ? data.correctAnswerId : null
  );
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);
  const [shakingOptionId, setShakingOptionId] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Delay before question appears (resets on page change or preview open)
  useEffect(() => {
    if (alreadyAnswered || data.delaySeconds === 0) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    setSelectedOptionId(null);
    setWrongOptionIds([]);
    setAttempts(1);

    const delayMs = (data.delaySeconds || cmsSettings.ujiAndKuis.defaultUjiDelay || 10) * 1000;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [pageId, alreadyAnswered, data.delaySeconds, cmsSettings.ujiAndKuis.defaultUjiDelay, isPreview]);

  if (!data.enabled || !isVisible) {
    return null;
  }

  const handleSelectOption = (optionId: string) => {
    if (alreadyAnswered || selectedOptionId === data.correctAnswerId) return;
    if (wrongOptionIds.includes(optionId)) return;

    if (optionId === data.correctAnswerId) {
      setSelectedOptionId(optionId);

      if (!isPreview) {
        recordUjiSuccess(materialId, pageId, attempts);
      }

      setShowSuccessPopup(true);

      const durationMs = (cmsSettings.ujiAndKuis.popupDuration || 1.8) * 1000;
      setTimeout(() => {
        setShowSuccessPopup(false);
        if (!isLastPage) {
          onAdvancePage();
        }
      }, durationMs);
    } else {
      setAttempts((prev) => prev + 1);
      setShakingOptionId(optionId);
      setWrongOptionIds((prev) => [...prev, optionId]);

      setTimeout(() => {
        setShakingOptionId(null);
      }, 350);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="mt-8 pt-6 border-t border-white/15 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Question */}
      <div className="flex flex-col gap-2">
        <p className="text-base sm:text-lg font-semibold text-[#ECFEFF] leading-relaxed text-justify hyphens-auto">
          {data.question}
        </p>
        {data.questionImage && (
          <div
            className="rounded-xl overflow-hidden max-h-56 w-fit bg-black/20 cursor-zoom-in"
            onClick={() => onImageViewerOpen(data.questionImage!)}
          >
            <img
              src={data.questionImage}
              alt=""
              className="max-h-56 object-contain"
            />
          </div>
        )}
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-2.5">
        {data.options.map((opt, idx) => {
          const isCorrect = opt.id === data.correctAnswerId && selectedOptionId === opt.id;
          const isWrong = wrongOptionIds.includes(opt.id);
          const isShaking = shakingOptionId === opt.id;
          const letter = optionLetters[idx] || String.fromCharCode(65 + idx);

          let optionStyle = 'bg-white/5 hover:bg-white/10 border-white/15 text-[#ECFEFF]';
          if (isCorrect) {
            optionStyle = 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.3)]';
          } else if (isWrong) {
            optionStyle = 'bg-red-500/20 border-red-500/40 text-red-300 opacity-60 cursor-not-allowed';
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isWrong || (selectedOptionId === data.correctAnswerId)}
              onClick={() => handleSelectOption(opt.id)}
              className={`w-full min-h-[48px] p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all active:scale-[0.99] cursor-pointer ${optionStyle} ${
                isShaking ? 'animate-shake' : ''
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                isCorrect ? 'bg-emerald-400 text-[#042F2E]' : 'bg-white/10 text-[#A5D8D3]'
              }`}>
                {isCorrect ? <Check size={16} /> : letter}
              </span>
              <span className="text-sm sm:text-base flex-1 leading-snug">{opt.text}</span>
              {opt.image && (
                <img
                  src={opt.image}
                  alt=""
                  className="w-12 h-12 rounded object-cover ml-auto shrink-0"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Success Animated Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-200">
          <div className="px-6 py-5 rounded-[20px] bg-[#073D39]/95 border border-[#34D399]/40 shadow-2xl flex flex-col items-center gap-3 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={32} className="animate-bounce" />
            </div>
            <p className="text-base sm:text-lg font-bold text-[#ECFEFF]">
              {cmsSettings.ujiAndKuis.popupSuccessText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
