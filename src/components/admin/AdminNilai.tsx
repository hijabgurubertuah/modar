// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { Search, RefreshCw, Download, Printer, Settings, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { CustomDropdown } from '../common/CustomDropdown';
import { extractGradeLevel } from '../../services/storage';
import { fetchAllGradesFromSheetApi } from '../../services/appsScript';

export const AdminNilai: React.FC = () => {
  const { students, materials, grades, gradeSettings, saveGradeSettings, syncConfig, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterSubject, setFilterSubject] = useState('Semua');
  const [filterMaterial, setFilterMaterial] = useState('Semua');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Local settings draft
  const [localGradeSettings, setLocalGradeSettings] = useState(gradeSettings);

  // Unique classes from students
  const uniqueClasses = ['Semua', ...Array.from(new Set(students.map((s) => s.kelas))).sort()];

  // Unique subjects
  const uniqueSubjects = ['Semua', ...Array.from(new Set(materials.map((m) => m.subject))).sort()];

  // Selected class grade level
  const selectedGradeLevel = filterKelas !== 'Semua' ? extractGradeLevel(filterKelas) : null;

  // Filtered materials for dropdown
  const relevantMaterials = materials.filter((m) => {
    const matchGrade = !selectedGradeLevel || m.grade === selectedGradeLevel;
    const matchSub = filterSubject === 'Semua' || m.subject === filterSubject;
    return matchGrade && matchSub;
  });

  const materialOptions = [
    'Semua',
    ...relevantMaterials.map((m) => m.title),
  ];

  // Reload from sheet
  const handleRefresh = async () => {
    if (!syncConfig.webAppUrl || !syncConfig.token) {
      showToast('Konfigurasi sinkronisasi belum lengkap', 'error');
      return;
    }
    setIsRefreshing(true);
    const remote = await fetchAllGradesFromSheetApi(syncConfig.webAppUrl, syncConfig.token);
    setIsRefreshing(false);
    if (remote) {
      showToast('Rekap nilai diperbarui dari spreadsheet');
    } else {
      showToast('Gagal memuat rekap nilai', 'error');
    }
  };

  // Filter grades
  const filteredGrades = grades.filter((g) => {
    const matchSearch =
      search.trim() === '' ||
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.nisn.toLowerCase().includes(search.toLowerCase());
    const matchKelas = filterKelas === 'Semua' || g.kelas === filterKelas;
    const matchSub = filterSubject === 'Semua' || g.subject === filterSubject;
    const matchMat = filterMaterial === 'Semua' || g.materialTitle === filterMaterial;
    return matchSearch && matchKelas && matchSub && matchMat;
  });

  // Export CSV
  const handleExportCsv = () => {
    let csv = 'NISN,Nama,Kelas,Mata Pelajaran,Materi,Uji Pemahaman,Kuis Akhir,Nilai Akhir,Predikat,Diperbarui\n';
    filteredGrades.forEach((g) => {
      csv += `"${g.nisn}","${g.nama}","${g.kelas}","${g.subject}","${g.materialTitle}","${g.ujiPemahamanScore ?? '-'}","${g.kuisAkhirScore ?? '-'}","${g.finalScore ?? '-'}","${g.predicate}","${g.updatedAt}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_nilai_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

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
    <div className="w-full max-w-[1020px] mx-auto flex flex-col gap-4 py-2">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 print:hidden">
        <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF]">Rekap Nilai</h1>

        <div className="flex items-center gap-2">
          {/* Refresh Icon */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#ECFEFF] flex items-center text-xs font-semibold cursor-pointer disabled:opacity-50"
            aria-label="Muat ulang dari spreadsheet"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#2DD4BF]' : ''} />
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#ECFEFF] flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Download size={14} />
            <span>Ekspor</span>
          </button>

          {/* Cetak */}
          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#ECFEFF] flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              setLocalGradeSettings(gradeSettings);
              setSettingsModalOpen(true);
            }}
            className="h-9 px-3 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Settings size={14} />
            <span>Pengaturan Nilai</span>
          </button>
        </div>
      </div>

      {/* Filters (Hidden during print) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 print:hidden">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#0F766E]/40 border border-white/20 text-sm text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A5D8D3]" />
        </div>

        <div>
          <CustomDropdown
            value={filterKelas}
            options={uniqueClasses}
            onChange={(val) => {
              setFilterKelas(val);
              setFilterMaterial('Semua');
            }}
          />
        </div>

        <div>
          <CustomDropdown
            value={filterSubject}
            options={uniqueSubjects}
            onChange={(val) => {
              setFilterSubject(val);
              setFilterMaterial('Semua');
            }}
          />
        </div>

        <div>
          <CustomDropdown
            value={filterMaterial}
            options={materialOptions}
            onChange={(val) => setFilterMaterial(val)}
          />
        </div>
      </div>

      {/* Recap Table / Cards */}
      {filteredGrades.length === 0 ? (
        <GlassCard className="p-8 text-center text-[#A5D8D3]/70">
          <p className="text-base font-medium">Belum ada nilai</p>
        </GlassCard>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="flex flex-col gap-2.5 sm:hidden print:hidden">
            {filteredGrades.map((g) => (
              <GlassCard key={g.id} className="p-3.5 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#ECFEFF]">{g.nama}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#A5D8D3]">
                      <span>{g.nisn}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#2DD4BF]">{g.kelas}</span>
                    </div>
                  </div>
                  {g.predicate && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg border shrink-0 ${getBadgeStyle(
                        g.predicate
                      )}`}
                    >
                      {g.predicate}
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#ECFEFF]/80">
                  <span className="font-semibold text-[#2DD4BF]">{g.subject}: </span>
                  <span>{g.materialTitle}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-[#A5D8D3] block">Uji</span>
                    <span className="font-semibold">{g.ujiPemahamanScore ?? '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A5D8D3] block">Kuis</span>
                    <span className="font-semibold">{g.kuisAkhirScore ?? '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A5D8D3] block">Akhir</span>
                    <span className="font-bold text-[#2DD4BF]">{g.finalScore ?? '-'}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Desktop Table View (also formatted cleanly for Print) */}
          <GlassCard className="hidden sm:block overflow-hidden p-0 print:block print:bg-white print:text-black print:border-black">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm divide-y divide-white/10 print:divide-black">
                <thead className="bg-white/5 text-xs text-[#A5D8D3] uppercase font-semibold print:text-black">
                  <tr>
                    <th className="px-3.5 py-3">Nama</th>
                    <th className="px-3.5 py-3">NISN</th>
                    <th className="px-3.5 py-3">Kelas</th>
                    <th className="px-3.5 py-3">Mata Pelajaran</th>
                    <th className="px-3.5 py-3">Materi</th>
                    <th className="px-3.5 py-3 text-center">Uji</th>
                    <th className="px-3.5 py-3 text-center">Kuis</th>
                    <th className="px-3.5 py-3 text-center">Akhir</th>
                    <th className="px-3.5 py-3 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 print:divide-black">
                  {filteredGrades.map((g) => (
                    <tr key={g.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-3.5 py-3 font-semibold text-[#ECFEFF] print:text-black">
                        {g.nama}
                      </td>
                      <td className="px-3.5 py-3 text-[#A5D8D3] font-mono text-xs print:text-black">
                        {g.nisn}
                      </td>
                      <td className="px-3.5 py-3 font-bold text-[#2DD4BF] print:text-black">
                        {g.kelas}
                      </td>
                      <td className="px-3.5 py-3 text-[#ECFEFF] print:text-black">{g.subject}</td>
                      <td className="px-3.5 py-3 text-[#ECFEFF]/90 print:text-black">
                        {g.materialTitle}
                      </td>
                      <td className="px-3.5 py-3 text-center text-[#ECFEFF]/90 print:text-black">
                        {g.ujiPemahamanScore ?? '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center text-[#ECFEFF]/90 print:text-black">
                        {g.kuisAkhirScore ?? '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center font-bold text-[#2DD4BF] print:text-black">
                        {g.finalScore ?? '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        {g.predicate && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${getBadgeStyle(
                              g.predicate
                            )} print:border-black print:text-black`}
                          >
                            {g.predicate}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      {/* Pengaturan Nilai Dialog */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[6px]">
          <GlassCard className="w-full max-w-[400px] p-5 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#ECFEFF]">Pengaturan Nilai</h3>

            <div className="flex flex-col gap-3 text-left">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">
                    Bobot Uji Pemahaman (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={localGradeSettings.ujiWeight}
                    onChange={(e) =>
                      setLocalGradeSettings({
                        ...localGradeSettings,
                        ujiWeight: Number(e.target.value),
                        kuisWeight: 100 - Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">
                    Bobot Kuis Akhir (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={localGradeSettings.kuisWeight}
                    onChange={(e) =>
                      setLocalGradeSettings({
                        ...localGradeSettings,
                        kuisWeight: Number(e.target.value),
                        ujiWeight: 100 - Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">KKM</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={localGradeSettings.kkm}
                  onChange={(e) =>
                    setLocalGradeSettings({ ...localGradeSettings, kkm: Number(e.target.value) })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#A5D8D3] mb-1 block">Batas A</label>
                  <input
                    type="number"
                    value={localGradeSettings.predA}
                    onChange={(e) =>
                      setLocalGradeSettings({ ...localGradeSettings, predA: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2 rounded-xl bg-white/5 border border-white/15 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#A5D8D3] mb-1 block">Batas B</label>
                  <input
                    type="number"
                    value={localGradeSettings.predB}
                    onChange={(e) =>
                      setLocalGradeSettings({ ...localGradeSettings, predB: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2 rounded-xl bg-white/5 border border-white/15 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#A5D8D3] mb-1 block">Batas C</label>
                  <input
                    type="number"
                    value={localGradeSettings.predC}
                    onChange={(e) =>
                      setLocalGradeSettings({ ...localGradeSettings, predC: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2 rounded-xl bg-white/5 border border-white/15 text-xs text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="min-h-[40px] rounded-xl border border-white/20 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveGradeSettings(localGradeSettings);
                    setSettingsModalOpen(false);
                  }}
                  className="min-h-[40px] rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
