// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { UjiPemahaman } from './UjiPemahaman';
import { GameViewer } from './GameViewer';
import { KuisAkhirCBT } from './KuisAkhirCBT';
import { isMaterialUnlocked, setMaterialUnlocked, setLastOpenedSubjectPage, getLastOpenedSubjectPage } from '../../services/storage';

interface MateriViewerProps {
  materialId?: string;
  uniqueId?: string;
  isPreview?: boolean;
}

export const MateriViewer: React.FC<MateriViewerProps> = ({
  materialId,
  uniqueId,
  isPreview = false,
}) => {
  const { session, materials, pages, cmsSettings, showToast } = useApp();
  const studentNisn = session?.nisn || 'guest';
  const studentGrade = session?.gradeLevel;

  // Find target material by uniqueId or id
  const material = materials.find((m) =>
    uniqueId ? m.uniqueId === uniqueId : m.id === materialId
  );

  // Filter pages for this material
  const matPages = material
    ? pages
        .filter((p) => p.materialId === material.id)
        .sort((a, b) => a.pageNumber - b.pageNumber)
    : [];

  // Determine initial page number from saved state or default to 1
  const savedHistory = material ? getLastOpenedSubjectPage(studentNisn, material.subject) : null;
  const initialPage = savedHistory?.materialId === material?.id && savedHistory?.pageNumber
    ? Math.min(savedHistory.pageNumber, matPages.length || 1)
    : 1;

  const [currentPageNum, setCurrentPageNum] = useState<number>(initialPage);

  // Password Unlock State
  const isUnlockedInitial = material
    ? !material.password || isPreview || isMaterialUnlocked(studentNisn, material.id)
    : true;

  const [isUnlocked, setIsUnlocked] = useState(isUnlockedInitial);
  const [showPasswordModal, setShowPasswordModal] = useState(!isUnlockedInitial);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Sync unlocked state if material changes
  useEffect(() => {
    if (material) {
      const unlocked = !material.password || isPreview || isMaterialUnlocked(studentNisn, material.id);
      setIsUnlocked(unlocked);
      setShowPasswordModal(!unlocked);
      setPasswordError('');
      setPasswordAttempts(0);
    }
  }, [material, studentNisn, isPreview]);

  // Lockout countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Save last opened page in subject
  useEffect(() => {
    if (material && !isPreview && studentNisn) {
      setLastOpenedSubjectPage(studentNisn, material.subject, material.id, currentPageNum);
    }
  }, [material, currentPageNum, studentNisn, isPreview]);

  // Handle password unlock submission
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    if (!material?.password) {
      setIsUnlocked(true);
      setShowPasswordModal(false);
      return;
    }

    if (passwordInput === material.password) {
      setIsUnlocked(true);
      setShowPasswordModal(false);
      setPasswordError('');
      setPasswordAttempts(0);
      if (!isPreview && studentNisn) {
        setMaterialUnlocked(studentNisn, material.id);
      }
    } else {
      const nextFail = passwordAttempts + 1;
      setPasswordAttempts(nextFail);
      setPasswordError(cmsSettings.textsAndMessages.passwordModalError);
      if (nextFail >= 5) {
        setLockoutSeconds(30);
      }
    }
  };

  // Condition 1: Material not found or hidden
  if (!material || (!isPreview && material.status === 'Sembunyi')) {
    return (
      <div className="w-full max-w-[820px] mx-auto py-12 flex justify-center">
        <GlassCard className="p-8 text-center text-[#A5D8D3]/80">
          <p className="text-base font-semibold">
            {cmsSettings.textsAndMessages.materialUnavailable}
          </p>
        </GlassCard>
      </div>
    );
  }

  // Condition 2: Material is for different grade level
  if (!isPreview && studentGrade && material.grade !== studentGrade) {
    return (
      <div className="w-full max-w-[820px] mx-auto py-12 flex justify-center">
        <GlassCard className="p-8 text-center text-[#A5D8D3]/80">
          <p className="text-base font-semibold">
            {cmsSettings.textsAndMessages.wrongGradeText}
          </p>
        </GlassCard>
      </div>
    );
  }

  // Condition 3: Locked material
  if (!isUnlocked) {
    return (
      <div className="w-full max-w-[820px] mx-auto py-16 flex flex-col items-center justify-center">
        {/* If modal is closed, show big lock icon */}
        {!showPasswordModal ? (
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/15 cursor-pointer transition-all active:scale-95"
          >
            <div className="w-20 h-20 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] flex items-center justify-center">
              <Lock size={36} />
            </div>
            <span className="text-sm font-semibold text-[#ECFEFF]">
              {cmsSettings.textsAndMessages.passwordModalTitle}
            </span>
          </button>
        ) : (
          /* Password Modal */
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[6px]">
            <GlassCard className="w-full max-w-[360px] p-6 flex flex-col gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] flex items-center justify-center mx-auto">
                <Lock size={24} />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#ECFEFF]">
                {cmsSettings.textsAndMessages.passwordModalTitle}
              </h3>

              <form onSubmit={handleUnlockSubmit} className="flex flex-col gap-3 text-left">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    autoFocus
                    disabled={lockoutSeconds > 0}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    className="w-full min-h-[44px] px-3.5 pr-10 rounded-xl bg-white/5 border border-white/20 text-[#ECFEFF] text-base focus:border-[#2DD4BF] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5D8D3] hover:text-[#ECFEFF] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-xs text-red-300 text-center">{passwordError}</p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="min-h-[44px] rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={lockoutSeconds > 0}
                    className="min-h-[44px] rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a4] text-[#042F2E] font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {lockoutSeconds > 0 ? `${lockoutSeconds}s` : cmsSettings.textsAndMessages.passwordModalBtn}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    );
  }

  // Active page
  const activePage = matPages.find((p) => p.pageNumber === currentPageNum) || matPages[0];
  const isLastPage = activePage ? activePage.pageNumber === matPages.length : true;

  return (
    <div className="w-full max-w-[820px] mx-auto flex flex-col gap-1.5 pb-8">
      {/* Numbered Page Tabs Bar (Always fully visible, auto-wraps cleanly without horizontal scroll) */}
      {matPages.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1 w-full px-1 py-1">
          {matPages.map((page) => {
            const isTabActive = page.pageNumber === currentPageNum;

            return (
              <button
                key={page.id}
                type="button"
                onClick={() => {
                  setCurrentPageNum(page.pageNumber);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`h-9 rounded-[12px] text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center select-none ${
                  isTabActive
                    ? 'w-[68px] bg-[#2DD4BF]/60 text-[#ECFEFF] border border-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                    : 'w-[42px] min-w-[32px] bg-[#0F766E]/40 hover:bg-[#0F766E]/60 text-[#A5D8D3] border border-white/15'
                }`}
              >
                {page.pageNumber}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Reading / Page Content Card */}
      {activePage ? (
        <GlassCard
          isReadingArea={activePage.type === 'Materi'}
          className="p-4 sm:p-7 flex flex-col text-[#ECFEFF] transition-all duration-200"
        >
          {/* Page Type: Materi */}
          {activePage.type === 'Materi' && (
            <div className="flex flex-col gap-5 leading-[1.7]">
              {/* Blocks */}
              {activePage.blocks.map((block) => {
                if (block.type === 'text') {
                  if (block.textStyle === 'title') {
                    return (
                      <h2 key={block.id} className="text-xl sm:text-2xl font-bold text-[#ECFEFF] tracking-tight">
                        {block.content}
                      </h2>
                    );
                  }
                  if (block.textStyle === 'subtitle') {
                    return (
                      <h3 key={block.id} className="text-lg sm:text-xl font-semibold text-[#2DD4BF]">
                        {block.content}
                      </h3>
                    );
                  }
                  if (block.textStyle === 'quote') {
                    return (
                      <blockquote
                        key={block.id}
                        className="pl-4 border-l-4 border-[#2DD4BF] text-base italic text-[#A5D8D3] bg-black/15 p-3 rounded-r-xl"
                      >
                        {block.content}
                      </blockquote>
                    );
                  }
                  return (
                    <p key={block.id} className="text-base sm:text-[17px] text-[#ECFEFF]/95">
                      {block.content}
                    </p>
                  );
                }

                if (block.type === 'image' && block.imageSrc) {
                  return (
                    <div key={block.id} className="my-2 rounded-2xl overflow-hidden border border-white/20 bg-black/20">
                      <img
                        src={block.imageSrc}
                        alt=""
                        className="w-full max-h-[460px] object-contain"
                      />
                    </div>
                  );
                }

                if (block.type === 'video' && block.videoUrl) {
                  return (
                    <div key={block.id} className="my-3 aspect-video w-full rounded-2xl overflow-hidden border border-white/20 shadow-md">
                      <iframe
                        title="Video"
                        src={block.videoUrl}
                        className="w-full h-full border-none"
                        allowFullScreen
                      />
                    </div>
                  );
                }

                if (block.type === 'document' && block.docUrl) {
                  return (
                    <div key={block.id} className="my-3 w-full h-[500px] rounded-2xl overflow-hidden border border-white/20 shadow-md">
                      <iframe
                        title="Dokumen PDF"
                        src={block.docUrl}
                        className="w-full h-full border-none"
                      />
                    </div>
                  );
                }

                if (block.type === 'table' && block.tableData) {
                  return (
                    <div key={block.id} className="my-3 overflow-x-auto rounded-xl border border-white/15">
                      <table className="w-full text-left text-sm divide-y divide-white/15">
                        <tbody>
                          {block.tableData.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={rIdx === 0 ? 'bg-white/10 font-bold text-[#2DD4BF]' : 'hover:bg-white/5'}
                            >
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-3 border-r border-white/10 last:border-none">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (block.type === 'divider') {
                  return <hr key={block.id} className="my-4 border-white/15" />;
                }

                return null;
              })}

              {/* Uji Pemahaman at the bottom of the card */}
              {activePage.ujiPemahaman && activePage.ujiPemahaman.enabled && (
                <UjiPemahaman
                  data={activePage.ujiPemahaman}
                  pageId={activePage.id}
                  materialId={material.id}
                  isLastPage={isLastPage}
                  onAdvancePage={() => {
                    setCurrentPageNum((prev) => Math.min(matPages.length, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  isPreview={isPreview}
                />
              )}
            </div>
          )}

          {/* Page Type: Game */}
          {activePage.type === 'Game' && (
            <GameViewer htmlCode={activePage.gameHtml} />
          )}

          {/* Page Type: Kuis Akhir */}
          {activePage.type === 'KuisAkhir' && activePage.kuisAkhir && (
            <KuisAkhirCBT
              data={activePage.kuisAkhir}
              materialId={material.id}
              isPreview={isPreview}
            />
          )}
        </GlassCard>
      ) : (
        <GlassCard className="p-8 text-center text-[#A5D8D3]/70">
          <p className="text-base font-medium">
            {cmsSettings.materialDisplay.emptyStateText}
          </p>
        </GlassCard>
      )}
    </div>
  );
};
