// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Award, LogOut, Lock, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SideHandle } from '../common/SideHandle';
import { Drawer } from '../common/Drawer';
import { isMaterialUnlocked } from '../../services/storage';

interface SiswaLayoutProps {
  children: React.ReactNode;
  activeSubject?: string;
  activeMaterialId?: string;
  onSelectMaterial?: (materialId: string) => void;
  onBackToSubjects?: () => void;
}

export const SiswaLayout: React.FC<SiswaLayoutProps> = ({
  children,
  activeSubject,
  activeMaterialId,
  onSelectMaterial,
  onBackToSubjects,
}) => {
  const { session, logout, materials, grades, cmsSettings } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isSubjectPortal = !!activeSubject;
  const gradeLevel = session?.gradeLevel || 'VII';
  const nisn = session?.nisn || '';

  // Filter materials for this subject and grade level
  const subjectMaterials = activeSubject
    ? materials
        .filter((m) => m.grade === gradeLevel && m.subject.toLowerCase() === activeSubject.toLowerCase() && m.status === 'Tampil')
        .sort((a, b) => a.order - b.order)
    : [];

  const handleNavClick = (hash: string) => {
    setDrawerOpen(false);
    window.location.hash = hash;
  };

  const currentRoute = window.location.hash;

  // Render Sidebar Content (either Main or Subject)
  const renderSidebarContent = () => {
    if (isSubjectPortal) {
      return (
        <div className="flex flex-col h-full p-3 gap-2">
          {/* Back button to subjects */}
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              if (onBackToSubjects) {
                onBackToSubjects();
              } else {
                window.location.hash = '#beranda';
              }
            }}
            className="min-h-[44px] px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#ECFEFF] flex items-center gap-2.5 text-[15px] font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} className="text-[#2DD4BF]" />
            <span>{cmsSettings.sidebarMenu.labelBackSubject}</span>
          </button>

          {/* Subject Title & Grade */}
          <div className="px-3 py-2 border-b border-white/10">
            <h2 className="text-[15px] font-bold text-[#ECFEFF] leading-snug truncate">
              {activeSubject}
            </h2>
            <p className="text-xs text-[#A5D8D3]/80 mt-0.5">
              {cmsSettings.textsAndMessages.gradePrefix} {gradeLevel}
            </p>
          </div>

          {/* Flat List of Materials */}
          <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1">
            {subjectMaterials.length === 0 ? (
              <div className="px-3 py-4 text-xs text-[#A5D8D3]/60 text-center">
                {cmsSettings.materialDisplay.emptyStateText}
              </div>
            ) : (
              subjectMaterials.map((mat) => {
                const isActive = mat.id === activeMaterialId;
                const isLocked = !!mat.password && !isMaterialUnlocked(nisn, mat.id);
                const hasGrade = grades.some((g) => g.nisn === nisn && g.materialId === mat.id && g.finalScore !== null);

                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      if (onSelectMaterial) {
                        onSelectMaterial(mat.id);
                      } else {
                        window.location.hash = `#materi/${mat.uniqueId}`;
                      }
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center justify-between text-[15px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold border border-[#2DD4BF]/30'
                        : 'text-[#ECFEFF]/90 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{mat.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLocked && <Lock size={14} className="text-[#FBBF24]" />}
                      {hasGrade && <Check size={14} className="text-[#34D399]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // Sidebar Utama
    return (
      <div className="flex flex-col h-full p-3 justify-between">
        <div className="flex flex-col gap-3">
          {/* Profile Card */}
          {cmsSettings.sidebarMenu.showProfileCard && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#2DD4BF] text-[#042F2E] font-bold text-sm flex items-center justify-center shrink-0">
                {session?.nama ? session.nama.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-medium text-[#ECFEFF] truncate">
                  {session?.nama || 'Siswa'}
                </span>
                <span className="text-[12px] text-[#A5D8D3]/80 truncate">
                  {session?.kelas || '-'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 mt-1">
            <button
              type="button"
              onClick={() => handleNavClick('#beranda')}
              className={`min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-[15px] transition-colors cursor-pointer ${
                currentRoute === '#beranda' || !currentRoute
                  ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold'
                  : 'text-[#ECFEFF]/90 hover:bg-white/5'
              }`}
            >
              <BookOpen size={18} className="text-[#2DD4BF]" />
              <span>{cmsSettings.sidebarMenu.labelMataPelajaran}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('#rekap-nilai')}
              className={`min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-[15px] transition-colors cursor-pointer ${
                currentRoute === '#rekap-nilai'
                  ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold'
                  : 'text-[#ECFEFF]/90 hover:bg-white/5'
              }`}
            >
              <Award size={18} className="text-[#2DD4BF]" />
              <span>{cmsSettings.sidebarMenu.labelRekapNilai}</span>
            </button>
          </nav>
        </div>

        {/* Logout at bottom */}
        <button
          type="button"
          onClick={() => {
            setDrawerOpen(false);
            logout();
          }}
          className="min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-[15px] text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer mt-auto"
        >
          <LogOut size={18} className="text-red-400" />
          <span>{cmsSettings.sidebarMenu.labelKeluar}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative bg-[#042F2E] text-[#ECFEFF] select-none">
      {/* Background Gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${cmsSettings.theme.bgGradient1} 0%, ${cmsSettings.theme.bgGradient2} 50%, ${cmsSettings.theme.bgGradient3} 100%)`,
        }}
      />

      {/* Mobile Side Handle Button (No header in mobile) */}
      <SideHandle
        mode="single"
        iconTypeSingle="menu"
        onClick={() => setDrawerOpen((prev) => !prev)}
        isOpen={drawerOpen}
        singleAriaLabel="Buka menu navigasi siswa"
      />

      {/* Mobile Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} variant="compact">
        {renderSidebarContent()}
      </Drawer>

      {/* Desktop Persistent Left Sidebar (232px) */}
      <aside className="hidden lg:flex flex-col w-[232px] shrink-0 h-screen sticky top-0 border-r border-white/15 bg-[#073D39]/60 backdrop-blur-[20px]">
        {renderSidebarContent()}
      </aside>

      {/* Main Student Page Content */}
      <main
        className="flex-1 min-w-0 flex flex-col"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          paddingLeft: '8px',
          paddingRight: '8px',
        }}
      >
        {children}
      </main>
    </div>
  );
};
