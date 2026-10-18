// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { FinalQuizData } from '../../types';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { getStudentQuizAnswers, saveStudentQuizAnswers } from '../../services/storage';

interface KuisAkhirCBTProps {
  data: FinalQuizData;
  materialId: string;
  isPreview?: boolean;
}

export const KuisAkhirCBT: React.FC<KuisAkhirCBTProps> = ({
  data,
  materialId,
  isPreview = false,
}) => {
  const { session, recordQuizCompleted, cmsSettings, grades } = useApp();
  const studentNisn = session?.nisn || 'guest';

  const questions = data.questions || [];
  const totalQuestions = questions.length;

  // Retrieve current student grade for this material
  const currentGrade = grades.find(
    (g) => g.nisn === studentNisn && g.materialId === materialId
  );
  const bestScore = currentGrade?.kuisAkhirScore ?? null;

  // Current question index (0-indexed)
  const [currentIndex, setCurrentIndex] = useState(0);

  // User answers map: { [questionId]: optionId }
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    getStudentQuizAnswers(studentNisn, materialId)
  );

  // Completed results view
  const [isCompleted, setIsCompleted] = useState(bestScore !== null && !isPreview);
  const [resultScore, setResultScore] = useState<number | null>(bestScore);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Persist answers
  useEffect(() => {
    if (!isPreview && studentNisn) {
      saveStudentQuizAnswers(studentNisn, materialId, answers);
    }
  }, [answers, studentNisn, materialId, isPreview]);

  if (totalQuestions === 0) {
    return (
      <div className="p-8 text-center text-[#A5D8D3]/60">
        Belum ada soal kuis
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleFinish = () => {
    if (unansweredCount > 0) {
      setConfirmModalOpen(true);
    } else {
      finalizeQuiz();
    }
  };

  const finalizeQuiz = () => {
    setConfirmModalOpen(false);

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswerId) {
        correct++;
      }
    });

    const score = Math.round((correct / totalQuestions) * 100);
    setCorrectCount(correct);
    setResultScore(score);
    setIsCompleted(true);

    if (!isPreview) {
      recordQuizCompleted(materialId, score);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  // Completed Result Screen
  if (isCompleted && resultScore !== null) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 sm:p-10 text-center gap-5">
        <h2 className="text-xl sm:text-2xl font-bold text-[#ECFEFF]">
          {cmsSettings.ujiAndKuis.textQuizResult}
        </h2>

        <div className="w-32 h-32 rounded-full border-4 border-[#2DD4BF] bg-[#0F766E]/40 flex flex-col items-center justify-center shadow-2xl">
          <span className="text-4xl font-extrabold text-[#ECFEFF]">{resultScore}</span>
          <span className="text-xs text-[#2DD4BF] font-semibold mt-1">
            {correctCount > 0 ? `${correctCount}/${totalQuestions}` : `Terbaik`}
          </span>
        </div>

        {/* Retry button if maxAttempts not exceeded */}
        <button
          type="button"
          onClick={handleRetry}
          className="min-h-[44px] px-6 rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a4] text-[#042F2E] font-bold text-sm sm:text-base transition-colors cursor-pointer mt-4"
        >
          Ulangi Kuis
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Question Header & Content */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#2DD4BF]">
            Soal {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        <p className="text-base sm:text-lg font-medium text-[#ECFEFF] leading-relaxed">
          {currentQ.question}
        </p>

        {currentQ.questionImage && (
          <img
            src={currentQ.questionImage}
            alt=""
            className="rounded-xl max-h-56 object-contain w-fit bg-black/20"
          />
        )}
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = answers[currentQ.id] === opt.id;
          const letter = optionLetters[idx] || String.fromCharCode(65 + idx);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt.id)}
              className={`w-full min-h-[48px] p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all active:scale-[0.99] cursor-pointer ${
                isSelected
                  ? 'bg-[#2DD4BF]/25 border-[#2DD4BF] text-[#ECFEFF] shadow-[0_0_12px_rgba(45,212,191,0.25)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-[#ECFEFF]/90'
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                isSelected ? 'bg-[#2DD4BF] text-[#042F2E]' : 'bg-white/10 text-[#A5D8D3]'
              }`}>
                {letter}
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

      {/* Navigation Row: Mundur & Lanjut / Selesai */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          className="min-h-[44px] px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-[#ECFEFF] text-sm sm:text-base font-medium transition-colors cursor-pointer"
        >
          {cmsSettings.ujiAndKuis.labelMundur}
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            type="button"
            onClick={handleFinish}
            className="min-h-[44px] px-4 rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a4] text-[#042F2E] text-sm sm:text-base font-bold transition-colors cursor-pointer"
          >
            {cmsSettings.ujiAndKuis.labelSelesai}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
            className="min-h-[44px] px-4 rounded-xl bg-[#0F766E] hover:bg-[#134E4A] border border-white/20 text-[#ECFEFF] text-sm sm:text-base font-semibold transition-colors cursor-pointer"
          >
            {cmsSettings.ujiAndKuis.labelLanjut}
          </button>
        )}
      </div>

      {/* 6-Column Grid of Numbered Boxes */}
      <div className="pt-4 border-t border-white/15">
        <div className="grid grid-cols-6 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-10 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center justify-center select-none ${
                  isAnswered
                    ? 'bg-[#22C55E] text-white shadow-sm'
                    : 'bg-[#EF4444] text-white shadow-sm'
                } ${isCurrent ? 'ring-2 ring-white scale-105 z-10' : 'opacity-90 hover:opacity-100'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog if questions unanswered */}
      <ConfirmDialog
        isOpen={confirmModalOpen}
        title={`${cmsSettings.ujiAndKuis.textUnansweredConfirm} (${unansweredCount} soal)`}
        confirmLabel={cmsSettings.ujiAndKuis.labelSelesaikan}
        cancelLabel={cmsSettings.ujiAndKuis.labelKembali}
        onConfirm={finalizeQuiz}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
};
