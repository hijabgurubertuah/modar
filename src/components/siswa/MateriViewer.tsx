// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { UjiPemahaman } from './UjiPemahaman';
import { GameViewer } from './GameViewer';
import { KuisAkhirCBT } from './KuisAkhirCBT';
import { ImageViewer } from '../common/ImageViewer';
import {
  isMaterialUnlocked,
  setMaterialUnlocked,
  setLastOpenedSubjectPage,
  getLastOpenedSubjectPage,
  isUjiAnsweredCorrectly,
  getCompletedPages,
  setCompletedPages,
} from '../../services/storage';
import { sanitizeHtml, convertBlocksToHtml } from '../admin/editor/editorUtils';

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
  const { session, materials, pages, cmsSettings } = useApp();
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

  // Determine initial page number
  const savedHistory = material ? getLastOpenedSubjectPage(studentNisn, material.subject) : null;
  const initialPage = savedHistory?.materialId === material?.id && savedHistory?.pageNumber
    ? Math.min(savedHistory.pageNumber, matPages.length || 1)
    : 1;

  const [currentPageNum, setCurrentPageNum] = useState<number>(initialPage);

  // Full-screen image viewer state
  const [viewerImgSrc, setViewerImgSrc] = useState<string | null>(null);

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

  useEffect(() => {
    if (material) {
      const unlocked = !material.password || isPreview || isMaterialUnlocked(studentNisn, material.id);
      setIsUnlocked(unlocked);
      setShowPasswordModal(!unlocked);
      setPasswordError('');
      setPasswordAttempts(0);
    }
  }, [material, studentNisn, isPreview]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  useEffect(() => {
    if (material && !isPreview && studentNisn) {
      setLastOpenedSubjectPage(studentNisn, material.subject, material.id, currentPageNum);
    }
  }, [material, currentPageNum, studentNisn, isPreview]);

  // Check if page is unlocked according to sequential locking rules
  const isPageUnlocked = (pageNum: number) => {
    if (isPreview || !material || material.pageLockEnabled === false) return true;
    if (pageNum === 1) return true;

    // Check if all previous pages are completed
    const savedCompleted = getCompletedPages(studentNisn, material.id);
    if (pageNum <= savedCompleted) return true;

    for (let i = 1; i < pageNum; i++) {
      const prevPage = matPages.find((p) => p.pageNumber === i);
      if (!prevPage) continue;
      const isCompleted =
        prevPage.type !== 'Materi' ||
        !prevPage.ujiPemahaman?.enabled ||
        isUjiAnsweredCorrectly(studentNisn, prevPage.id);
      if (!isCompleted) return false;
    }
    return true;
  };

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

  if (!material || (!isPreview && material.status === 'Sembunyi')) {
    return (
      <div className="w-full max-w-[820px] mx-auto py-12 px-4 flex justify-center">
        <GlassCard className="p-8 text-center text-[#A5D8D3]/80">
          <p className="text-base font-semibold">
            {cmsSettings.textsAndMessages.materialUnavailable}
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!isPreview && studentGrade && material.grade !== studentGrade) {
    return (
      <div className="w-full max-w-[820px] mx-auto py-12 px-4 flex justify-center">
        <GlassCard className="p-8 text-center text-[#A5D8D3]/80">
          <p className="text-base font-semibold">
            {cmsSettings.textsAndMessages.wrongGradeText}
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="w-full max-w-[820px] mx-auto py-16 px-4 flex flex-col items-center justify-center">
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

  const activePage = matPages.find((p) => p.pageNumber === currentPageNum) || matPages[0];
  const isLastPage = activePage ? activePage.pageNumber === matPages.length : true;

  return (
    <div className="w-full max-w-[820px] mx-auto flex flex-col gap-2 pb-8 px-4 sm:px-6 md:px-8">
      {/* Numbered Page Tabs Bar */}
      {matPages.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full py-1">
          {matPages.map((page) => {
            const isTabActive = page.pageNumber === currentPageNum;
            const unlocked = isPageUnlocked(page.pageNumber);
            const lockedBg = cmsSettings.materialDisplay.tabLockedColor || 'rgba(15, 118, 110, 0.20)';
            const lockedOpacity = cmsSettings.materialDisplay.tabLockedOpacity ?? 0.5;

            return (
              <button
                key={page.id}
                type="button"
                onClick={() => {
                  if (!unlocked) {
                    if ('vibrate' in navigator) navigator.vibrate(200);
                    return;
                  }
                  setCurrentPageNum(page.pageNumber);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative h-9 rounded-[12px] text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center select-none ${
                  isTabActive
                    ? 'w-[68px] bg-[#2DD4BF]/60 text-[#ECFEFF] border border-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                    : unlocked
                    ? 'w-[42px] bg-[#0F766E]/40 hover:bg-[#0F766E]/60 text-[#A5D8D3] border border-white/15'
                    : 'w-[42px] text-[#A5D8D3]/70 border border-white/10'
                }`}
                style={
                  !unlocked
                    ? { backgroundColor: lockedBg, opacity: lockedOpacity }
                    : undefined
                }
              >
                <span>{page.pageNumber}</span>
                {!unlocked && (
                  <span className="absolute top-1 right-1 text-[#FBBF24]">
                    <Lock size={10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Reading / Page Content Card */}
      {activePage ? (
        <GlassCard
          isReadingArea={activePage.type === 'Materi'}
          className="p-5 sm:p-8 flex flex-col text-[#ECFEFF] transition-all duration-200"
        >
          {activePage.type === 'Materi' && (
            <div className="flex flex-col gap-5 leading-[1.7]">
              <div
                className="prose max-w-none text-[#ECFEFF]"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'IMG') {
                    setViewerImgSrc((target as HTMLImageElement).src);
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(activePage.contentHtml || convertBlocksToHtml(activePage)),
                }}
              />

              {/* Uji Pemahaman Component */}
              {activePage.ujiPemahaman?.enabled && (
                <UjiPemahaman
                  data={activePage.ujiPemahaman}
                  pageId={activePage.id}
                  materialId={material.id}
                  isLastPage={isLastPage}
                  isPreview={isPreview}
                  onAdvancePage={() => {
                    if (!isPreview && studentNisn) {
                      setCompletedPages(studentNisn, material.id, Math.max(currentPageNum + 1, getCompletedPages(studentNisn, material.id)));
                    }
                    if (currentPageNum < matPages.length) {
                      setCurrentPageNum(currentPageNum + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  onImageViewerOpen={(src) => setViewerImgSrc(src)}
                />
              )}
            </div>
          )}

          {activePage.type === 'Game' && (
            <GameViewer htmlCode={activePage.gameHtml} />
          )}

          {activePage.type === 'KuisAkhir' && (
            <KuisAkhirCBT
              data={activePage.kuisAkhir || { maxAttempts: 0, questions: [] }}
              materialId={material.id}
              isPreview={isPreview}
            />
          )}
        </GlassCard>
      ) : null}

      {/* Full-Screen Image Viewer Modal */}
      {viewerImgSrc && (
        <ImageViewer src={viewerImgSrc} onClose={() => setViewerImgSrc(null)} />
      )}
    </div>
  );
};
