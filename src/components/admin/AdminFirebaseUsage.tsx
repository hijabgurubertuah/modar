// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { Database, ArrowDownCircle, ArrowUpCircle, Trash2, HardDrive, Activity } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

export const AdminFirebaseUsage: React.FC = () => {
  // Estimated metrics based on current local operations
  const quotas = [
    {
      id: 'reads',
      label: 'Operasi Baca (Harian)',
      current: 4120,
      max: 50000,
      unit: 'baca',
      color: '#2DD4BF',
      icon: <ArrowDownCircle size={18} className="text-[#2DD4BF]" />,
    },
    {
      id: 'writes',
      label: 'Operasi Tulis (Harian)',
      current: 380,
      max: 20000,
      unit: 'tulis',
      color: '#34D399',
      icon: <ArrowUpCircle size={18} className="text-[#34D399]" />,
    },
    {
      id: 'deletes',
      label: 'Operasi Hapus (Harian)',
      current: 12,
      max: 20000,
      unit: 'hapus',
      color: '#FBBF24',
      icon: <Trash2 size={18} className="text-[#FBBF24]" />,
    },
    {
      id: 'storage',
      label: 'Penyimpanan Data',
      current: 14.8,
      max: 1024,
      unit: 'MB',
      color: '#60A5FA',
      icon: <HardDrive size={18} className="text-[#60A5FA]" />,
    },
    {
      id: 'bandwidth',
      label: 'Jaringan Keluar',
      current: 0.42,
      max: 10,
      unit: 'GB',
      color: '#A78BFA',
      icon: <Activity size={18} className="text-[#A78BFA]" />,
    },
  ];

  return (
    <div className="w-full max-w-[880px] mx-auto flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF]">Penggunaan Firebase</h1>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30">
          Paket Gratis
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quotas.map((q) => {
          const percent = Math.min(100, Math.round((q.current / q.max) * 100));

          return (
            <GlassCard key={q.id} className="p-4 sm:p-5 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {q.icon}
                  <span className="text-xs sm:text-sm font-semibold text-[#ECFEFF]">
                    {q.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#A5D8D3]">{percent}%</span>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-base sm:text-lg font-bold text-[#ECFEFF]">
                    {q.current.toLocaleString()} {q.unit}
                  </span>
                  <span className="text-xs text-[#A5D8D3]/70">
                    / {q.max.toLocaleString()} {q.unit}
                  </span>
                </div>

                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(2, percent)}%`,
                      backgroundColor: q.color,
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
