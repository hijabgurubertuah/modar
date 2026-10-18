// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  Lock,
  EyeOff,
  Link as LinkIcon,
  Pencil,
  ArrowUp,
  ArrowDown,
  Check,
  Search,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  Table as TableIcon,
  Minus,
} from 'lucide-react';
import { Material, MaterialPage, GradeLevel, ContentBlock, PageType, CBTQuestion } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { CustomDropdown } from '../common/CustomDropdown';
import { ImageUploader } from '../common/ImageUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Drawer } from '../common/Drawer';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';
import { MateriViewer } from '../siswa/MateriViewer';
import { generateUniqueMaterialId } from '../../services/storage';

interface AdminMateriProps {
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

export const AdminMateri: React.FC<AdminMateriProps> = ({ isDrawerOpen = false, onCloseDrawer = () => {} }) => {
  const { materials, pages, saveMaterial, deleteMaterial, savePage, deletePage, reorderPages, showToast, cmsSettings } = useApp();

  // Active Grade Level in Sidebar (VII, VIII, IX)
  const [activeGradeTab, setActiveGradeTab] = useState<GradeLevel>('VII');

  // Search in Sidebar Materi
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Subject per Grade
  const [selectedSubjectPerGrade, setSelectedSubjectPerGrade] = useState<Record<GradeLevel, string>>({
    VII: 'Matematika',
    VIII: 'Bahasa Inggris',
    IX: 'PPKn',
  });

  // Selected Material in Editor
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(() => {
    return materials[0]?.id || '';
  });

  // Active Material Object
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId) || materials[0];

  // Selected Page Number (1-indexed)
  const [activePageNum, setActivePageNum] = useState<number>(1);

  // Preview Mode Toggle
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Page Menu Dropdown State
  const [isPageMenuOpen, setIsPageMenuOpen] = useState<boolean>(false);

  // Local Page Draft (unsaved changes)
  const currentSavedPage = pages.find(
    (p) => p.materialId === selectedMaterial?.id && p.pageNumber === activePageNum
  );
  const [pageDraft, setPageDraft] = useState<MaterialPage | null>(null);
  const [isDraftDirty, setIsDraftDirty] = useState<boolean>(false);

  // Info Materi Dialog State
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Partial<Material> | null>(null);

  // Delete Confirmations
  const [deletePageConfirmOpen, setDeletePageConfirmOpen] = useState(false);
  const [deleteMaterialConfirmOpen, setDeleteMaterialConfirmOpen] = useState(false);
  const [materialToDeleteId, setMaterialToDeleteId] = useState<string | null>(null);

  // Sync draft when material or page changes
  useEffect(() => {
    if (currentSavedPage) {
      setPageDraft(JSON.parse(JSON.stringify(currentSavedPage)));
      setIsDraftDirty(false);
    } else {
      setPageDraft(null);
      setIsDraftDirty(false);
    }
  }, [selectedMaterialId, activePageNum, pages]);

  // All pages for currently selected material
  const currentMaterialPages = selectedMaterial
    ? pages
        .filter((p) => p.materialId === selectedMaterial.id)
        .sort((a, b) => a.pageNumber - b.pageNumber)
    : [];

  // Render Sidebar Materi content
  const renderSidebarMateri = () => {
    const currentGradeSubjects = Array.from(
      new Set(
        materials
          .filter((m) => m.grade === activeGradeTab)
          .map((m) => m.subject.trim())
      )
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const activeSubject = selectedSubjectPerGrade[activeGradeTab] || currentGradeSubjects[0] || '';

    const filteredMaterials = materials.filter((m) => {
      const matchGrade = m.grade === activeGradeTab;
      const matchSubject = activeSubject ? m.subject.toLowerCase().trim() === activeSubject.toLowerCase().trim() : true;
      const matchSearch = searchQuery.trim() === '' || m.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGrade && matchSubject && matchSearch;
    }).sort((a, b) => a.order - b.order);

    return (
      <div className="flex flex-col h-full p-2.5 gap-2">
        {/* Top Sticky Container (4 parts) */}
        <div className="shrink-0 flex flex-col gap-2 bg-[#073D39] pb-2 border-b border-white/10 z-10">
          {/* 1. Grade Level 3-Tab selector: VII, VIII, IX */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/20 border border-white/10">
            {(['VII', 'VIII', 'IX'] as GradeLevel[]).map((grd) => (
              <button
                key={grd}
                type="button"
                onClick={() => {
                  setActiveGradeTab(grd);
                  const subs = Array.from(new Set(materials.filter((m) => m.grade === grd).map((m) => m.subject.trim())));
                  subs.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
                  if (subs.length > 0 && !selectedSubjectPerGrade[grd]) {
                    setSelectedSubjectPerGrade((prev) => ({ ...prev, [grd]: subs[0] }));
                  }
                }}
                className={`h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeGradeTab === grd
                    ? 'bg-[#2DD4BF] text-[#042F2E]'
                    : 'text-[#A5D8D3] hover:text-[#ECFEFF]'
                }`}
              >
                {grd}
              </button>
            ))}
          </div>

          {/* 2. Mata Pelajaran Dropdown */}
          <CustomDropdown
            label="Mata Pelajaran"
            value={activeSubject}
            options={currentGradeSubjects}
            onChange={(val) => {
              setSelectedSubjectPerGrade((prev) => ({ ...prev, [activeGradeTab]: val }));
            }}
          />

          {/* 3. Slim Search input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi..."
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-white/5 border border-white/15 text-xs text-[#ECFEFF] placeholder-[#A5D8D3]/50 outline-none focus:border-[#2DD4BF]"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A5D8D3]" />
          </div>

          {/* 4. Tambah Materi Action Item */}
          <button
            type="button"
            onClick={() => {
              const newUniqueId = generateUniqueMaterialId(materials.map((m) => m.uniqueId));
              setEditingMaterial({
                id: `mat-${Date.now()}`,
                uniqueId: newUniqueId,
                title: '',
                subject: activeSubject || currentGradeSubjects[0] || 'Matematika',
                grade: activeGradeTab,
                status: 'Tampil',
                order: filteredMaterials.length + 1,
                password: '',
                pageLockEnabled: true,
              });
              setInfoModalOpen(true);
              onCloseDrawer();
            }}
            className="w-full min-h-[38px] px-3 rounded-xl bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Materi</span>
          </button>
        </div>

        {/* Scrollable Material List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-1">
          {currentGradeSubjects.length === 0 || filteredMaterials.length === 0 ? (
            <div className="px-3 py-8 text-xs text-[#A5D8D3]/60 text-center">
              Belum ada materi
            </div>
          ) : (
            filteredMaterials.map((mat) => {
              const isSelected = mat.id === selectedMaterialId;

              return (
                <div
                  key={mat.id}
                  className={`min-h-[42px] px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-[#2DD4BF]/20 border-[#2DD4BF]/50 text-[#ECFEFF]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-[#ECFEFF]/90'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMaterialId(mat.id);
                      setActivePageNum(1);
                      onCloseDrawer();
                    }}
                    className="flex-1 min-w-0 text-left text-xs font-medium truncate cursor-pointer"
                  >
                    {mat.title}
                  </button>

                  <div className="flex items-center gap-1 shrink-0 text-[#A5D8D3]">
                    {mat.password && <Lock size={13} className="text-[#FBBF24]" />}
                    {mat.status === 'Sembunyi' && <EyeOff size={13} className="text-white/40" />}
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/#materi/${mat.uniqueId}`;
                        navigator.clipboard.writeText(url);
                        showToast(cmsSettings.textsAndMessages.notifLinkCopied);
                      }}
                      className="p-1 hover:text-[#2DD4BF] cursor-pointer"
                      aria-label="Salin tautan"
                    >
                      <LinkIcon size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMaterial({ ...mat, pageLockEnabled: mat.pageLockEnabled !== false });
                        setInfoModalOpen(true);
                        onCloseDrawer();
                      }}
                      className="p-1 hover:text-[#2DD4BF] cursor-pointer"
                      aria-label="Edit info materi"
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ADD PAGE (+) Handler
  const handleAddPage = () => {
    if (!selectedMaterial || currentMaterialPages.length >= 30) return;

    const hasKuisAkhir = currentMaterialPages.some((p) => p.type === 'KuisAkhir');
    const newPageNum = hasKuisAkhir ? currentMaterialPages.length : currentMaterialPages.length + 1;

    const shiftedPages = currentMaterialPages.map((p) => {
      if (hasKuisAkhir && p.type === 'KuisAkhir') {
        return { ...p, pageNumber: p.pageNumber + 1 };
      }
      return p;
    });

    const newPage: MaterialPage = {
      id: `p-${Date.now()}`,
      materialId: selectedMaterial.id,
      pageNumber: newPageNum,
      type: 'Materi',
      blocks: [
        {
          id: `b-${Date.now()}-1`,
          type: 'text',
          textStyle: 'title',
          content: 'Halaman Baru',
        },
        {
          id: `b-${Date.now()}-2`,
          type: 'text',
          textStyle: 'paragraph',
          content: '',
        },
      ],
      ujiPemahaman: {
        enabled: false,
        question: '',
        options: [
          { id: 'opt-1', text: '' },
          { id: 'opt-2', text: '' },
        ],
        correctAnswerId: 'opt-1',
        delaySeconds: 10,
      },
    };

    savePage(newPage);
    reorderPages(selectedMaterial.id, [...shiftedPages, newPage]);
    setActivePageNum(newPageNum);
  };

  const handleSavePage = () => {
    if (pageDraft) {
      savePage(pageDraft);
      setIsDraftDirty(false);
    }
  };

  const handleMovePageLeft = () => {
    if (activePageNum <= 1) return;
    const prevPage = currentMaterialPages.find((p) => p.pageNumber === activePageNum - 1);
    const currPage = currentMaterialPages.find((p) => p.pageNumber === activePageNum);
    if (!prevPage || !currPage) return;

    const updated = currentMaterialPages.map((p) => {
      if (p.id === currPage.id) return { ...p, pageNumber: activePageNum - 1 };
      if (p.id === prevPage.id) return { ...p, pageNumber: activePageNum };
      return p;
    });
    reorderPages(selectedMaterial.id, updated);
    setActivePageNum(activePageNum - 1);
    setIsPageMenuOpen(false);
  };

  const handleMovePageRight = () => {
    if (activePageNum >= currentMaterialPages.length) return;
    const nextPage = currentMaterialPages.find((p) => p.pageNumber === activePageNum + 1);
    const currPage = currentMaterialPages.find((p) => p.pageNumber === activePageNum);
    if (!nextPage || !currPage) return;

    const updated = currentMaterialPages.map((p) => {
      if (p.id === currPage.id) return { ...p, pageNumber: activePageNum + 1 };
      if (p.id === nextPage.id) return { ...p, pageNumber: activePageNum };
      return p;
    });
    reorderPages(selectedMaterial.id, updated);
    setActivePageNum(activePageNum + 1);
    setIsPageMenuOpen(false);
  };

  const handleDuplicatePage = () => {
    if (!currentSavedPage || currentMaterialPages.length >= 30) return;
    const dup: MaterialPage = {
      ...JSON.parse(JSON.stringify(currentSavedPage)),
      id: `p-${Date.now()}`,
      pageNumber: activePageNum + 1,
    };
    const updated = currentMaterialPages.map((p) => {
      if (p.pageNumber > activePageNum) {
        return { ...p, pageNumber: p.pageNumber + 1 };
      }
      return p;
    });
    savePage(dup);
    reorderPages(selectedMaterial.id, [...updated, dup]);
    setActivePageNum(activePageNum + 1);
    setIsPageMenuOpen(false);
  };

  const handleDeleteActivePage = () => {
    if (currentMaterialPages.length <= 1) {
      alert('Materi harus memiliki minimal 1 halaman');
      return;
    }
    if (currentSavedPage) {
      deletePage(currentSavedPage.id);
      setActivePageNum((prev) => Math.max(1, prev - 1));
      setDeletePageConfirmOpen(false);
      setIsPageMenuOpen(false);
    }
  };

  const handleChangePageType = (newType: PageType) => {
    if (!pageDraft) return;
    setPageDraft({
      ...pageDraft,
      type: newType,
      gameHtml: newType === 'Game' && !pageDraft.gameHtml ? '<h1>Game</h1>' : pageDraft.gameHtml,
      kuisAkhir: newType === 'KuisAkhir' && !pageDraft.kuisAkhir ? { maxAttempts: 0, questions: [{ id: 'q1', question: '', options: [{ id: '1', text: '' }, { id: '2', text: '' }], correctAnswerId: '1' }] } : pageDraft.kuisAkhir,
    });
    setIsDraftDirty(true);
    setIsPageMenuOpen(false);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    if (!pageDraft) return;
    setPageDraft({
      ...pageDraft,
      blocks: pageDraft.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    });
    setIsDraftDirty(true);
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Desktop Column 2: Sidebar Materi (240px) */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r border-white/15 bg-[#073D39]/50 backdrop-blur-[16px] z-10">
        {renderSidebarMateri()}
      </aside>

      {/* Mobile Drawer: Sidebar Materi */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        variant="compact"
        ariaLabel="Daftar Materi"
      >
        {renderSidebarMateri()}
      </Drawer>

      {/* Main Editor Content Area */}
      <div className="flex-1 min-w-0 flex flex-col p-2 sm:p-4 pb-20 max-w-[820px] mx-auto">
        {isPreviewMode ? (
          <div className="w-full">
            <MateriViewer materialId={selectedMaterial?.id} isPreview={true} />
          </div>
        ) : !selectedMaterial ? (
          <GlassCard className="p-8 text-center text-[#A5D8D3]">
            <p>Belum ada materi dipilih</p>
          </GlassCard>
        ) : (
          <>
            {/* Header: Title and Page Tabs Bar */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
                    {selectedMaterial.subject} • Kelas {selectedMaterial.grade}
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF] truncate">
                    {selectedMaterial.title}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingMaterial({ ...selectedMaterial, pageLockEnabled: selectedMaterial.pageLockEnabled !== false });
                    setInfoModalOpen(true);
                  }}
                  className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#ECFEFF] flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil size={13} />
                  <span>Info</span>
                </button>
              </div>

              {/* Numbered Page Tabs + Add Page Button */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                {currentMaterialPages.map((page) => {
                  const isTabActive = page.pageNumber === activePageNum;

                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => {
                        setActivePageNum(page.pageNumber);
                      }}
                      className={`h-9 rounded-[12px] text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 select-none ${
                        isTabActive
                          ? 'w-[68px] bg-[#2DD4BF]/60 text-[#ECFEFF] border border-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                          : 'w-[42px] bg-[#0F766E]/40 hover:bg-[#0F766E]/60 text-[#A5D8D3] border border-white/15'
                      }`}
                    >
                      {page.pageNumber}
                    </button>
                  );
                })}

                {/* Add Page Button */}
                <button
                  type="button"
                  onClick={handleAddPage}
                  className="h-9 w-9 rounded-[12px] bg-white/10 hover:bg-white/20 text-[#2DD4BF] border border-white/15 flex items-center justify-center shrink-0 cursor-pointer"
                  title="Tambah Halaman"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Page Editor Card */}
            {pageDraft && (
              <GlassCard isReadingArea={pageDraft.type === 'Materi'} className="p-4 sm:p-7 flex flex-col gap-6">
                {pageDraft.type === 'Materi' && (
                  <div className="flex flex-col gap-5">
                    {pageDraft.blocks.map((block) => {
                      if (block.type === 'text') {
                        return (
                          <div key={block.id} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[#A5D8D3] uppercase font-bold tracking-wider">
                                {block.textStyle}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStyle = block.textStyle === 'title' ? 'subtitle' : block.textStyle === 'subtitle' ? 'paragraph' : block.textStyle === 'paragraph' ? 'quote' : 'title';
                                    handleUpdateBlock(block.id, { textStyle: nextStyle });
                                  }}
                                  className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#A5D8D3] cursor-pointer"
                                >
                                  Ganti Gaya
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (pageDraft.blocks.length <= 1) return;
                                    setPageDraft({
                                      ...pageDraft,
                                      blocks: pageDraft.blocks.filter((b) => b.id !== block.id),
                                    });
                                    setIsDraftDirty(true);
                                  }}
                                  className="p-1 text-red-300 hover:text-red-400 cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <AutoResizeTextarea
                              value={block.content || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                              placeholder={`Tulis ${block.textStyle}...`}
                              className={`w-full p-3 rounded-xl bg-black/20 border border-white/15 text-[#ECFEFF] outline-none focus:border-[#2DD4BF] ${
                                block.textStyle === 'title'
                                  ? 'text-xl font-bold'
                                  : block.textStyle === 'subtitle'
                                  ? 'text-lg font-semibold text-[#2DD4BF]'
                                  : block.textStyle === 'quote'
                                  ? 'italic text-base'
                                  : 'text-base'
                              }`}
                            />
                          </div>
                        );
                      }

                      if (block.type === 'image') {
                        return (
                          <div key={block.id} className="flex flex-col gap-2 p-3 rounded-2xl bg-black/20 border border-white/15">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#2DD4BF]">Gambar Isi</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPageDraft({
                                    ...pageDraft,
                                    blocks: pageDraft.blocks.filter((b) => b.id !== block.id),
                                  });
                                  setIsDraftDirty(true);
                                }}
                                className="p-1 text-red-300 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <ImageUploader
                              value={block.imageSrc || ''}
                              onChange={(url) => handleUpdateBlock(block.id, { imageSrc: url })}
                            />
                          </div>
                        );
                      }

                      if (block.type === 'table' && block.tableData) {
                        return (
                          <div key={block.id} className="flex flex-col gap-2 p-3 rounded-2xl bg-black/20 border border-white/15">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#2DD4BF]">Tabel</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPageDraft({
                                    ...pageDraft,
                                    blocks: pageDraft.blocks.filter((b) => b.id !== block.id),
                                  });
                                  setIsDraftDirty(true);
                                }}
                                className="p-1 text-red-300 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="overflow-x-auto space-y-2">
                              {block.tableData.map((row, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-2">
                                  {row.map((cell, cIdx) => (
                                    <AutoResizeTextarea
                                      key={cIdx}
                                      value={cell}
                                      onChange={(e) => {
                                        const newTable = block.tableData!.map((rw, ri) =>
                                          ri === rIdx ? rw.map((cl, ci) => (ci === cIdx ? e.target.value : cl)) : rw
                                        );
                                        handleUpdateBlock(block.id, { tableData: newTable });
                                      }}
                                      className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-[#ECFEFF]"
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}

                    {/* Add Block Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          const newB: ContentBlock = {
                            id: `b-${Date.now()}`,
                            type: 'text',
                            textStyle: 'paragraph',
                            content: '',
                          };
                          setPageDraft({ ...pageDraft, blocks: [...pageDraft.blocks, newB] });
                          setIsDraftDirty(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#2DD4BF] cursor-pointer"
                      >
                        + Teks
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newB: ContentBlock = {
                            id: `b-${Date.now()}`,
                            type: 'image',
                            imageSrc: '',
                          };
                          setPageDraft({ ...pageDraft, blocks: [...pageDraft.blocks, newB] });
                          setIsDraftDirty(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#2DD4BF] cursor-pointer"
                      >
                        + Gambar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newB: ContentBlock = {
                            id: `b-${Date.now()}`,
                            type: 'table',
                            tableData: [['Kolom 1', 'Kolom 2'], ['Data 1', 'Data 2']],
                          };
                          setPageDraft({ ...pageDraft, blocks: [...pageDraft.blocks, newB] });
                          setIsDraftDirty(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#2DD4BF] cursor-pointer"
                      >
                        + Tabel
                      </button>
                    </div>

                    {/* Uji Pemahaman Editor */}
                    <div className="mt-6 pt-6 border-t border-white/20 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2DD4BF]">Uji Pemahaman</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pageDraft.ujiPemahaman?.enabled || false}
                            onChange={(e) => {
                              const enabled = e.target.checked;
                              setPageDraft({
                                ...pageDraft,
                                ujiPemahaman: {
                                  enabled,
                                  question: pageDraft.ujiPemahaman?.question || '',
                                  options: pageDraft.ujiPemahaman?.options || [
                                    { id: 'opt-1', text: '' },
                                    { id: 'opt-2', text: '' },
                                  ],
                                  correctAnswerId: pageDraft.ujiPemahaman?.correctAnswerId || 'opt-1',
                                  delaySeconds: pageDraft.ujiPemahaman?.delaySeconds ?? 10,
                                },
                              });
                              setIsDraftDirty(true);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2DD4BF]"></div>
                        </label>
                      </div>

                      {pageDraft.ujiPemahaman?.enabled && (
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Waktu Muncul (detik)</label>
                            <input
                              type="number"
                              min={0}
                              value={pageDraft.ujiPemahaman.delaySeconds ?? 10}
                              onChange={(e) => {
                                setPageDraft({
                                  ...pageDraft,
                                  ujiPemahaman: { ...pageDraft.ujiPemahaman!, delaySeconds: Number(e.target.value) },
                                });
                                setIsDraftDirty(true);
                              }}
                              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Pertanyaan</label>
                            <AutoResizeTextarea
                              value={pageDraft.ujiPemahaman.question}
                              onChange={(e) => {
                                setPageDraft({
                                  ...pageDraft,
                                  ujiPemahaman: { ...pageDraft.ujiPemahaman!, question: e.target.value },
                                });
                                setIsDraftDirty(true);
                              }}
                              placeholder="Tulis pertanyaan..."
                              className="w-full p-3 rounded-xl bg-black/20 border border-white/15 text-sm text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#A5D8D3]">Pilihan Jawaban</label>
                            {pageDraft.ujiPemahaman.options.map((opt, oIdx) => (
                              <div key={opt.id} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${pageDraft.id}`}
                                  checked={pageDraft.ujiPemahaman?.correctAnswerId === opt.id}
                                  onChange={() => {
                                    setPageDraft({
                                      ...pageDraft,
                                      ujiPemahaman: { ...pageDraft.ujiPemahaman!, correctAnswerId: opt.id },
                                    });
                                    setIsDraftDirty(true);
                                  }}
                                  className="accent-[#2DD4BF]"
                                />
                                <AutoResizeTextarea
                                  value={opt.text}
                                  onChange={(e) => {
                                    const newOpts = pageDraft.ujiPemahaman!.options.map((o) =>
                                      o.id === opt.id ? { ...o, text: e.target.value } : o
                                    );
                                    setPageDraft({
                                      ...pageDraft,
                                      ujiPemahaman: { ...pageDraft.ujiPemahaman!, options: newOpts },
                                    });
                                    setIsDraftDirty(true);
                                  }}
                                  placeholder={`Pilihan ${String.fromCharCode(65 + oIdx)}`}
                                  className="flex-1 p-2 rounded-xl bg-white/5 border border-white/15 text-xs text-[#ECFEFF]"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {pageDraft.type === 'Game' && (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-[#2DD4BF]">Kode HTML Game</label>
                    <textarea
                      rows={10}
                      value={pageDraft.gameHtml || ''}
                      onChange={(e) => {
                        setPageDraft({ ...pageDraft, gameHtml: e.target.value });
                        setIsDraftDirty(true);
                      }}
                      className="w-full p-3 rounded-xl bg-black/40 border border-white/15 font-mono text-xs text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
                    />
                  </div>
                )}

                {pageDraft.type === 'KuisAkhir' && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-[#2DD4BF]">Kuis Akhir (CBT)</h3>
                    {pageDraft.kuisAkhir?.questions.map((q, qIdx) => (
                      <div key={q.id} className="p-4 rounded-2xl bg-black/20 border border-white/15 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#A5D8D3]">Soal {qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newQ = pageDraft.kuisAkhir!.questions.filter((item) => item.id !== q.id);
                              setPageDraft({
                                ...pageDraft,
                                kuisAkhir: { ...pageDraft.kuisAkhir!, questions: newQ },
                              });
                              setIsDraftDirty(true);
                            }}
                            className="p-1 text-red-300 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <AutoResizeTextarea
                          value={q.question}
                          onChange={(e) => {
                            const newQ = pageDraft.kuisAkhir!.questions.map((item) =>
                              item.id === q.id ? { ...item, question: e.target.value } : item
                            );
                            setPageDraft({
                              ...pageDraft,
                              kuisAkhir: { ...pageDraft.kuisAkhir!, questions: newQ },
                            });
                            setIsDraftDirty(true);
                          }}
                          placeholder="Pertanyaan kuis..."
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-[#ECFEFF]"
                        />
                        <div className="flex flex-col gap-2">
                          {q.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`q-corr-${q.id}`}
                                checked={q.correctAnswerId === opt.id}
                                onChange={() => {
                                  const newQ = pageDraft.kuisAkhir!.questions.map((item) =>
                                    item.id === q.id ? { ...item, correctAnswerId: opt.id } : item
                                  );
                                  setPageDraft({
                                    ...pageDraft,
                                    kuisAkhir: { ...pageDraft.kuisAkhir!, questions: newQ },
                                  });
                                  setIsDraftDirty(true);
                                }}
                                className="accent-[#2DD4BF]"
                              />
                              <AutoResizeTextarea
                                value={opt.text}
                                onChange={(e) => {
                                  const newOpts = q.options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o));
                                  const newQ = pageDraft.kuisAkhir!.questions.map((item) =>
                                    item.id === q.id ? { ...item, options: newOpts } : item
                                  );
                                  setPageDraft({
                                    ...pageDraft,
                                    kuisAkhir: { ...pageDraft.kuisAkhir!, questions: newQ },
                                  });
                                  setIsDraftDirty(true);
                                }}
                                placeholder={`Opsi ${opt.id}`}
                                className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-[#ECFEFF]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newQ: CBTQuestion = {
                          id: `q-${Date.now()}`,
                          question: '',
                          options: [
                            { id: 'a', text: '' },
                            { id: 'b', text: '' },
                            { id: 'c', text: '' },
                            { id: 'd', text: '' },
                          ],
                          correctAnswerId: 'a',
                        };
                        setPageDraft({
                          ...pageDraft,
                          kuisAkhir: {
                            ...pageDraft.kuisAkhir!,
                            questions: [...pageDraft.kuisAkhir!.questions, newQ],
                          },
                        });
                        setIsDraftDirty(true);
                      }}
                      className="w-fit px-4 py-2 rounded-xl bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 text-xs font-bold cursor-pointer"
                    >
                      Tambah Soal
                    </button>
                  </div>
                )}
              </GlassCard>
            )}
          </>
        )}

        {/* Bottom Fixed Glass Control Bar */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 h-12 bg-[#073D39]/90 backdrop-blur-[16px] border-t border-white/15 px-4 flex items-center justify-between"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {isPreviewMode ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className="h-8 px-4 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs cursor-pointer shadow-md"
              >
                Tutup Pratinjau
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 relative">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-[#ECFEFF] flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  aria-label="Pratinjau"
                >
                  <Eye size={16} className="text-[#2DD4BF]" />
                  <span>Pratinjau</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPageMenuOpen((prev) => !prev)}
                  className="h-8 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#ECFEFF] flex items-center cursor-pointer"
                  aria-label="Menu halaman"
                >
                  <SlidersHorizontal size={16} />
                </button>

                {isPageMenuOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-48 rounded-xl bg-[#0B4F4A]/95 border border-white/20 shadow-2xl p-1 flex flex-col divide-y divide-white/10 text-xs z-50">
                    <div className="p-1 flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#A5D8D3] px-2 py-1 uppercase font-bold">
                        Jenis Halaman
                      </span>
                      {(['Materi', 'Game', 'KuisAkhir'] as PageType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleChangePageType(t)}
                          className="px-2 py-1.5 rounded-lg flex items-center justify-between text-left hover:bg-white/10 cursor-pointer"
                        >
                          <span>{t}</span>
                          {pageDraft?.type === t && <Check size={14} className="text-[#2DD4BF]" />}
                        </button>
                      ))}
                    </div>

                    <div className="p-1 flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={handleMovePageLeft}
                        disabled={activePageNum <= 1}
                        className="px-2 py-1.5 rounded-lg text-left hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                      >
                        Geser ke Kiri
                      </button>
                      <button
                        type="button"
                        onClick={handleMovePageRight}
                        disabled={activePageNum >= currentMaterialPages.length}
                        className="px-2 py-1.5 rounded-lg text-left hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                      >
                        Geser ke Kanan
                      </button>
                      <button
                        type="button"
                        onClick={handleDuplicatePage}
                        className="px-2 py-1.5 rounded-lg text-left hover:bg-white/10 cursor-pointer"
                      >
                        Duplikat Halaman
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletePageConfirmOpen(true)}
                        className="px-2 py-1.5 rounded-lg text-left text-red-300 hover:bg-red-500/20 cursor-pointer"
                      >
                        Hapus Halaman
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!isDraftDirty}
                onClick={handleSavePage}
                className="h-8 px-4 rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a4] text-[#042F2E] font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                Simpan Perubahan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dialog Info Materi */}
      {infoModalOpen && editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[6px]">
          <GlassCard className="w-full max-w-[440px] p-5 flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#ECFEFF]">Info Materi</h3>

            <div className="flex flex-col gap-3 text-left">
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Judul *</label>
                <input
                  type="text"
                  value={editingMaterial.title || ''}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Mata Pelajaran"
                  required
                  allowCustomInput
                  value={editingMaterial.subject || ''}
                  options={Array.from(new Set(materials.map((m) => m.subject)))}
                  onChange={(val) => setEditingMaterial({ ...editingMaterial, subject: val })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <CustomDropdown
                    label="Kelas"
                    required
                    value={editingMaterial.grade || 'VII'}
                    options={['VII', 'VIII', 'IX']}
                    onChange={(val) => setEditingMaterial({ ...editingMaterial, grade: val as GradeLevel })}
                  />
                </div>
                <div>
                  <CustomDropdown
                    label="Status"
                    value={editingMaterial.status || 'Tampil'}
                    options={['Tampil', 'Sembunyi']}
                    onChange={(val) => setEditingMaterial({ ...editingMaterial, status: val as any })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Kata Sandi Materi</label>
                <input
                  type="text"
                  value={editingMaterial.password || ''}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, password: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-white/10 pt-3">
                <span className="text-xs font-semibold text-[#A5D8D3]">Kunci Halaman (Buka Urut)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMaterial.pageLockEnabled !== false}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, pageLockEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2DD4BF]"></div>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Tautan Materi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/#materi/${editingMaterial.uniqueId}`}
                    className="flex-1 h-9 px-3 rounded-xl bg-black/30 border border-white/10 text-xs text-[#A5D8D3]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/#materi/${editingMaterial.uniqueId}`;
                      navigator.clipboard.writeText(url);
                      showToast(cmsSettings.textsAndMessages.notifLinkCopied);
                    }}
                    className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                  >
                    Salin
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setMaterialToDeleteId(editingMaterial.id || null);
                    setDeleteMaterialConfirmOpen(true);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  Hapus Materi
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInfoModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingMaterial.title) {
                        alert('Judul wajib diisi');
                        return;
                      }
                      saveMaterial(editingMaterial as Material);
                      setSelectedMaterialId(editingMaterial.id!);
                      setInfoModalOpen(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-[#2DD4BF] text-[#042F2E] text-xs font-bold cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Page Confirm Dialog */}
      <ConfirmDialog
        isOpen={deletePageConfirmOpen}
        title="Hapus halaman ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        isDangerous
        onConfirm={handleDeleteActivePage}
        onCancel={() => setDeletePageConfirmOpen(false)}
      />

      {/* Delete Material Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteMaterialConfirmOpen}
        title="Hapus materi ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        isDangerous
        onConfirm={() => {
          if (materialToDeleteId) {
            deleteMaterial(materialToDeleteId);
            setDeleteMaterialConfirmOpen(false);
            setInfoModalOpen(false);
          }
        }}
        onCancel={() => setDeleteMaterialConfirmOpen(false)}
      />
    </div>
  );
};
