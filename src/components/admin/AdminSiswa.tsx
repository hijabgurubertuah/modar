// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useRef } from 'react';
import { Plus, Search, RefreshCw, Upload, Download, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { CustomDropdown } from '../common/CustomDropdown';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { fetchStudentsFromSheetApi } from '../../services/appsScript';

export const AdminSiswa: React.FC = () => {
  const { students, saveStudent, deleteStudent, importStudents, syncConfig, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [modalError, setModalError] = useState('');

  // Delete Confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Reloading from sheet state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hidden file input for CSV Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unique classes for filter
  const uniqueClasses = ['Semua', ...Array.from(new Set(students.map((s) => s.kelas))).sort()];

  // Filter & Search
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      search.trim() === '' ||
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.toLowerCase().includes(search.toLowerCase());
    const matchKelas = filterKelas === 'Semua' || s.kelas === filterKelas;
    return matchSearch && matchKelas;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  // Reload from sheet
  const handleRefresh = async () => {
    if (!syncConfig.webAppUrl || !syncConfig.token) {
      showToast('Konfigurasi sinkronisasi belum lengkap', 'error');
      return;
    }
    setIsRefreshing(true);
    const remote = await fetchStudentsFromSheetApi(syncConfig.webAppUrl, syncConfig.token);
    setIsRefreshing(false);
    if (remote) {
      importStudents(remote);
      showToast('Data siswa diperbarui dari spreadsheet');
    } else {
      showToast('Gagal memuat data dari spreadsheet', 'error');
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    let csv = 'Nama,NISN,Kelas\n';
    filteredStudents.forEach((s) => {
      csv += `"${s.nama}","${s.nisn}","${s.kelas}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_siswa_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Import
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      if (lines.length <= 1) return;

      const imported: Student[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 3 && parts[1]) {
          imported.push({
            id: `std-imp-${Date.now()}-${i}`,
            nama: parts[0],
            nisn: parts[1],
            kelas: parts[2],
          });
        }
      }
      if (imported.length > 0) {
        importStudents(imported);
        showToast(`${imported.length} siswa berhasil diimpor`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save student
  const handleSaveStudent = () => {
    if (!editingStudent?.nama?.trim()) {
      setModalError('Nama wajib diisi');
      return;
    }
    const cleanNisn = (editingStudent?.nisn || '').trim();
    if (!cleanNisn) {
      setModalError('NISN wajib diisi');
      return;
    }
    // Alphanumeric 1-30 chars
    if (!/^[a-zA-Z0-9]{1,30}$/.test(cleanNisn)) {
      setModalError('NISN hanya boleh huruf dan angka tanpa spasi');
      return;
    }
    // Check duplicate NISN
    const duplicate = students.find(
      (s) => s.nisn.toLowerCase() === cleanNisn.toLowerCase() && s.id !== editingStudent.id
    );
    if (duplicate) {
      setModalError('NISN sudah terdaftar');
      return;
    }
    if (!editingStudent?.kelas?.trim()) {
      setModalError('Kelas wajib diisi');
      return;
    }

    saveStudent({
      id: editingStudent.id || `std-${Date.now()}`,
      nama: editingStudent.nama.trim(),
      nisn: cleanNisn,
      kelas: editingStudent.kelas.trim(),
    });
    setModalOpen(false);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto flex flex-col gap-4 py-2">
      {/* Top Bar: Title & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF]">Data Siswa</h1>

        <div className="flex items-center gap-2">
          {/* Refresh Icon */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#ECFEFF] flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
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

          {/* Import CSV */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCsv}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#ECFEFF] flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Upload size={14} />
            <span>Impor</span>
          </button>

          {/* Add Student */}
          <button
            type="button"
            onClick={() => {
              setEditingStudent({ nama: '', nisn: '', kelas: 'VII A' });
              setModalError('');
              setModalOpen(true);
            }}
            className="h-9 px-4 rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a4] text-[#042F2E] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus size={16} />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filters: Search & Class Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Content: Mobile Cards / Desktop Table */}
      {paginatedStudents.length === 0 ? (
        <GlassCard className="p-8 text-center text-[#A5D8D3]/70">
          <p className="text-base font-medium">Belum ada data</p>
        </GlassCard>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="flex flex-col gap-2 sm:hidden">
            {paginatedStudents.map((s) => (
              <GlassCard key={s.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#ECFEFF]">{s.nama}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#A5D8D3]">
                    <span>NISN: {s.nisn}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#2DD4BF]">{s.kelas}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStudent({ ...s });
                      setModalError('');
                      setModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#2DD4BF] cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentToDelete(s);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Desktop Table View */}
          <GlassCard className="hidden sm:block overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm divide-y divide-white/10">
                <thead className="bg-white/5 text-xs text-[#A5D8D3] uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">NISN</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-[#ECFEFF]">{s.nama}</td>
                      <td className="px-4 py-3.5 text-[#A5D8D3] font-mono">{s.nisn}</td>
                      <td className="px-4 py-3.5 font-bold text-[#2DD4BF]">{s.kelas}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudent({ ...s });
                              setModalError('');
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#2DD4BF] cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStudentToDelete(s);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 px-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-[#A5D8D3]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 px-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold cursor-pointer"
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {modalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[6px]">
          <GlassCard className="w-full max-w-[380px] p-5 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#ECFEFF]">
              {editingStudent.id ? 'Ubah Siswa' : 'Tambah Siswa'}
            </h3>

            <div className="flex flex-col gap-3 text-left">
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Nama *</label>
                <input
                  type="text"
                  value={editingStudent.nama || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, nama: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">NISN *</label>
                <input
                  type="text"
                  value={editingStudent.nisn || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, nisn: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Kelas *</label>
                <input
                  type="text"
                  value={editingStudent.kelas || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, kelas: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>

              {modalError && (
                <p className="text-xs text-red-300 text-center">{modalError}</p>
              )}

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[40px] rounded-xl border border-white/20 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveStudent}
                  className="min-h-[40px] rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title={`Hapus siswa ${studentToDelete?.nama}?`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        isDangerous
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
            setDeleteConfirmOpen(false);
          }
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};
