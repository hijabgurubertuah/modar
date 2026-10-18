// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';

export const RekapNilaiSiswa: React.FC = () => {
  const { session, materials, grades, cmsSettings, gradeSettings } = useApp();
  const studentNisn = session?.nisn || '';
  const studentGrade = session?.gradeLevel || 'VII';

  // Filter student's grades
  const studentGrades = grades.filter((g) => g.nisn === studentNisn);

  // Total available materials for student's grade
  const totalGradeMaterials = materials.filter(
    (m) => m.grade === studentGrade && m.status === 'Tampil'
  ).length;

  // Calculate summary metrics
  const scoredGrades = studentGrades.filter((g) => g.finalScore !== null);
  const attemptedCount = scoredGrades.length;
  const completedCount = scoredGrades.filter((g) => (g.finalScore || 0) >= gradeSettings.kkm).length;
  const avgScore =
    attemptedCount > 0
      ? Math.round(
          scoredGrades.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / attemptedCount
        )
      : 0;

  const rekapSettings = cmsSettings.rekapNilaiDisplay;

  // Predicate badge color helper
  const getBadgeStyle = (predicate: string) => {
    switch (predicate) {
      case 'A':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'B':
        return 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/40';
      case 'C':
        return 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/40';
      case 'D':
      default:
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    }
  };

  return (
    <div className="w-full max-w-[960px] mx-auto flex flex-col gap-4 py-2">
      {/* Page Title */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF]">
          {rekapSettings.pageTitle}
        </h1>
      </div>

      {/* Summary Cards */}
      {rekapSettings.showSummaryCards && (
        <div className="grid grid-cols-3 gap-2">
          <GlassCard className="p-3.5 sm:p-4 text-center flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs text-[#A5D8D3] line-clamp-1">
              {rekapSettings.labelAvgFinal}
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-[#2DD4BF] mt-1">
              {avgScore}
            </span>
          </GlassCard>

          <GlassCard className="p-3.5 sm:p-4 text-center flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs text-[#A5D8D3] line-clamp-1">
              {rekapSettings.labelCompletedCount}
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-[#34D399] mt-1">
              {completedCount}
            </span>
          </GlassCard>

          <GlassCard className="p-3.5 sm:p-4 text-center flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs text-[#A5D8D3] line-clamp-1">
              {rekapSettings.labelAttemptedCount}
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-[#ECFEFF] mt-1">
              {attemptedCount}/{totalGradeMaterials}
            </span>
          </GlassCard>
        </div>
      )}

      {/* Bar Chart with KKM Line */}
      {rekapSettings.showChart && scoredGrades.length > 0 && (
        <GlassCard className="p-4 sm:p-6 flex flex-col gap-3">
          <div className="relative h-44 flex items-end justify-around gap-2 pt-6 pb-2 border-b border-white/20">
            {/* KKM Horizontal Line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-[#FBBF24]/70 z-10 flex items-center justify-end pr-2"
              style={{ bottom: `${gradeSettings.kkm}%` }}
            >
              <span className="text-[10px] font-bold text-[#FBBF24] bg-[#042F2E] px-1 rounded -translate-y-1/2">
                KKM {gradeSettings.kkm}
              </span>
            </div>

            {/* Bars */}
            {scoredGrades.map((g) => {
              const score = g.finalScore || 0;
              const isBelowKkm = score < gradeSettings.kkm;

              return (
                <div key={g.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[11px] font-bold text-[#ECFEFF] mb-1">
                    {score}
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                      isBelowKkm ? 'bg-orange-400/80' : 'bg-[#2DD4BF]'
                    }`}
                    style={{ height: `${Math.max(8, score)}%` }}
                  />
                  <span className="text-[10px] text-[#A5D8D3] truncate max-w-[60px] mt-1.5 text-center">
                    {g.subject}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Recap Table / Cards */}
      {studentGrades.length === 0 ? (
        <GlassCard className="p-8 text-center text-[#A5D8D3]/70">
          <p className="text-base font-medium">Belum ada nilai</p>
        </GlassCard>
      ) : (
        <>
          {/* Mobile: Stacked Cards */}
          <div className="flex flex-col gap-2.5 sm:hidden">
            {studentGrades.map((g) => {
              const isBelowKkm = (g.finalScore || 0) < gradeSettings.kkm && g.finalScore !== null;

              return (
                <GlassCard key={g.id} className="p-3.5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-[#2DD4BF] uppercase">
                        {g.subject}
                      </span>
                      <h3 className="text-sm font-bold text-[#ECFEFF] leading-snug">
                        {g.materialTitle}
                      </h3>
                    </div>
                    {g.predicate && (
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border shrink-0 ${getBadgeStyle(
                          g.predicate
                        )}`}
                      >
                        {g.predicate}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] text-[#A5D8D3] block">{rekapSettings.colUji}</span>
                      <span className="font-semibold text-[#ECFEFF]">
                        {g.ujiPemahamanScore ?? '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A5D8D3] block">{rekapSettings.colKuis}</span>
                      <span className="font-semibold text-[#ECFEFF]">
                        {g.kuisAkhirScore ?? '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A5D8D3] block">{rekapSettings.colFinal}</span>
                      <span
                        className={`font-bold ${
                          isBelowKkm ? 'text-orange-300' : 'text-[#2DD4BF]'
                        }`}
                      >
                        {g.finalScore ?? '-'}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Desktop / Tablet Table */}
          <GlassCard className="hidden sm:block overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm divide-y divide-white/10">
                <thead className="bg-white/5 text-xs text-[#A5D8D3] uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">{rekapSettings.colSubject}</th>
                    <th className="px-4 py-3">{rekapSettings.colMaterial}</th>
                    <th className="px-4 py-3 text-center">{rekapSettings.colUji}</th>
                    <th className="px-4 py-3 text-center">{rekapSettings.colKuis}</th>
                    <th className="px-4 py-3 text-center">{rekapSettings.colFinal}</th>
                    <th className="px-4 py-3 text-center">{rekapSettings.colPredicate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {studentGrades.map((g) => {
                    const isBelowKkm = (g.finalScore || 0) < gradeSettings.kkm && g.finalScore !== null;

                    return (
                      <tr key={g.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-[#2DD4BF]">{g.subject}</td>
                        <td className="px-4 py-3.5 text-[#ECFEFF]">{g.materialTitle}</td>
                        <td className="px-4 py-3.5 text-center text-[#ECFEFF]/90">
                          {g.ujiPemahamanScore ?? '-'}
                        </td>
                        <td className="px-4 py-3.5 text-center text-[#ECFEFF]/90">
                          {g.kuisAkhirScore ?? '-'}
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold">
                          <span className={isBelowKkm ? 'text-orange-300' : 'text-[#2DD4BF]'}>
                            {g.finalScore ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {g.predicate && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${getBadgeStyle(
                                g.predicate
                              )}`}
                            >
                              {g.predicate}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};
