// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { getSubjectColor } from '../../constants/designSystem';
import { getLastOpenedSubjectPage } from '../../services/storage';

interface BerandaSiswaProps {
  onSelectSubject: (subjectName: string) => void;
}

export const BerandaSiswa: React.FC<BerandaSiswaProps> = ({ onSelectSubject }) => {
  const { session, materials, grades, cmsSettings } = useApp();
  const gradeLevel = session?.gradeLevel || 'VII';
  const nisn = session?.nisn || '';

  // Filter materials for this student's grade that have status 'Tampil'
  const visibleMaterials = materials.filter(
    (m) => m.grade === gradeLevel && m.status === 'Tampil'
  );

  // Group by subject (case insensitive & trimmed)
  const subjectsMap = new Map<string, typeof visibleMaterials>();
  visibleMaterials.forEach((m) => {
    const key = m.subject.trim();
    const existing = subjectsMap.get(key) || [];
    existing.push(m);
    subjectsMap.set(key, existing);
  });

  // Sort subjects alphabetically
  const subjectsList = Array.from(subjectsMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div className="w-full max-w-[960px] mx-auto flex flex-col gap-3 py-2">
      {/* Title Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF] tracking-tight">
          {cmsSettings.textsAndMessages.homeTitle}
        </h1>
        <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30">
          {cmsSettings.textsAndMessages.gradePrefix} {gradeLevel}
        </span>
      </div>

      {/* Grid of Subject Cards (2-column on mobile, responsive on desktop) */}
      {subjectsList.length === 0 ? (
        <GlassCard className="p-8 text-center text-[#A5D8D3]/70 mt-4">
          <p className="text-base font-medium">
            {cmsSettings.materialDisplay.emptyStateText}
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {subjectsList.map(([subjectName, matList]) => {
            const initial = subjectName.charAt(0).toUpperCase();
            const color = getSubjectColor(subjectName);

            // Calculate completed count
            const completedCount = matList.filter((m) =>
              grades.some((g) => g.nisn === nisn && g.materialId === m.id && g.finalScore !== null)
            ).length;
            const totalCount = matList.length;
            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <GlassCard
                key={subjectName}
                onClick={() => onSelectSubject(subjectName)}
                className="p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer hover:border-[#2DD4BF]/50 hover:bg-[#0F766E]/50 active:scale-[0.98] transition-all"
              >
                <div>
                  {/* Subject Initial Circle */}
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-md mb-3"
                    style={{
                      backgroundColor: `${color}25`,
                      color: color,
                      border: `1.5px solid ${color}60`,
                    }}
                  >
                    {initial}
                  </div>

                  {/* Subject Name */}
                  <h2 className="text-sm sm:text-base font-bold text-[#ECFEFF] leading-snug line-clamp-2">
                    {subjectName}
                  </h2>

                  {/* Material Count */}
                  <p className="text-xs text-[#A5D8D3] mt-1">
                    {totalCount} materi
                  </p>
                </div>

                {/* Progress Bar (if enabled in CMS) */}
                {cmsSettings.sidebarMenu.showProgressBar && (
                  <div className="mt-4 pt-2 border-t border-white/10 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] text-[#A5D8D3]">
                      <span>{completedCount}/{totalCount}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
