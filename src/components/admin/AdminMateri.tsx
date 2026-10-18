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
import { GameViewer } from '../siswa/GameViewer';
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
    const allSubjects = Array.from(
      new Set(materials.filter((m) => m.grade === activeGradeTab).map((m) => m.subject))
    ).sort();

    const filteredMaterials = materials.filter((m) => {
      const matchGrade = m.grade === activeGradeTab;
      const matchSearch = searchQuery.trim() === '' || m.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGrade && matchSearch;
    });

    return (
      <div className="flex flex-col h-full p-2.5 gap-2">
        {/* Grade Level 3-Tab selector: VII, VIII, IX */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/20 border border-white/10 shrink-0">
          {(['VII', 'VIII', 'IX'] as GradeLevel[]).map((grd) => (
            <button
              key={grd}
              type="button"
              onClick={() => setActiveGradeTab(grd)}
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

        {/* Slim Search input */}
        <div className="relative shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-xl bg-white/5 border border-white/15 text-xs text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A5D8D3]" />
        </div>

        {/* Tambah Materi Action Item */}
        <button
          type="button"
          onClick={() => {
            const newUniqueId = generateUniqueMaterialId(materials.map((m) => m.uniqueId));
            setEditingMaterial({
              id: `mat-${Date.now()}`,
              uniqueId: newUniqueId,
              title: '',
              subject: allSubjects[0] || 'Matematika',
              grade: activeGradeTab,
              status: 'Tampil',
              order: filteredMaterials.length + 1,
              password: '',
            });
            setInfoModalOpen(true);
            onCloseDrawer();
          }}
          className="w-full min-h-[40px] px-3 rounded-xl bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Materi</span>
        </button>

        {/* Grouped materials list by subject */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-1 pr-1">
          {filteredMaterials.length === 0 ? (
            <div className="px-3 py-6 text-xs text-[#A5D8D3]/60 text-center">
              Belum ada materi
            </div>
          ) : (
            allSubjects.map((sub) => {
              const subMats = filteredMaterials
                .filter((m) => m.subject === sub)
                .sort((a, b) => a.order - b.order);

              if (subMats.length === 0) return null;

              return (
                <div key={sub} className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#2DD4BF] uppercase px-2 py-0.5">
                    {sub}
                  </span>
                  <div className="flex flex-col gap-1">
                    {subMats.map((mat) => {
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

                          {/* Quick Action Icons */}
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
                                setEditingMaterial({ ...mat });
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
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ADD PAGE (+) Handler: inserts new Materi page right before FinalQuiz or at the end (max 30 pages)
  const handleAddPage = () => {
    if (!selectedMaterial || currentMaterialPages.length >= 30) return;

    const hasKuisAkhir = currentMaterialPages.some((p) => p.type === 'KuisAkhir');
    const newPageNum = hasKuisAkhir ? currentMaterialPages.length : currentMaterialPages.length + 1;

    // Shift existing pages if inserted before KuisAkhir
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

  // SAVE ACTIVE PAGE CHANGES
  const handleSavePage = () => {
    if (pageDraft) {
      savePage(pageDraft);
      setIsDraftDirty(false);
    }
  };

  // PAGE OPERATIONS (move left, move right, duplicate, delete)
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

  // BLOCK EDITORS (In-place)
  const handleUpdateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    if (!pageDraft) return;
    setPageDraft({
      ...pageDraft,
      blocks: pageDraft.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    });
    setIsDraftDirty(true);
  };

  const handleAddBlock = (type: ContentBlock['type']) => {
    if (!pageDraft) return;
    const newBlock: ContentBlock = {
      id: `b-${Date.now()}`,
      type,
      content: '',
      textStyle: type === 'text' ? 'paragraph' : undefined,
      tableData: type === 'table' ? [['Kolom 1', 'Kolom 2'], ['Isi 1', 'Isi 2']] : undefined,
    };
    setPageDraft({
      ...pageDraft,
      blocks: [...pageDraft.blocks, newBlock],
    });
    setIsDraftDirty(true);
  };

  const handleRemoveBlock = (blockId: string) => {
    if (!pageDraft) return;
    setPageDraft({
      ...pageDraft,
      blocks: pageDraft.blocks.filter((b) => b.id !== blockId),
    });
    setIsDraftDirty(true);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!pageDraft) return;
    const newBlocks = [...pageDraft.blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    setPageDraft({ ...pageDraft, blocks: newBlocks });
    setIsDraftDirty(true);
  };

  // UJI PEMAHAMAN IN-PLACE EDITOR
  const handleUpdateUji = (updates: any) => {
    if (!pageDraft) return;
    setPageDraft({
      ...pageDraft,
      ujiPemahaman: {
        ...(pageDraft.ujiPemahaman || {
          enabled: false,
          question: '',
          options: [],
          correctAnswerId: '',
          delaySeconds: 10,
        }),
        ...updates,
      },
    });
    setIsDraftDirty(true);
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Desktop Column 2: Sidebar Materi (232px) */}
      <aside className="hidden lg:flex flex-col w-[232px] shrink-0 h-screen sticky top-0 border-r border-white/15 bg-[#073D39]/50 backdrop-blur-[16px] z-10">
        {renderSidebarMateri()}
      </aside>

      {/* Mobile Drawer: Sidebar Materi */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        variant="compact"
        ariaLabel="Menu materi"
      >
        {renderSidebarMateri()}
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col p-1 sm:p-3 pb-20 max-w-[820px] mx-auto">
      {/* If no material exists yet, show empty state with Add Material button */}
      {!selectedMaterial ? (
        <GlassCard className="p-8 text-center flex flex-col items-center gap-4 my-8">
          <p className="text-base font-semibold text-[#A5D8D3]">Belum ada materi</p>
          <button
            type="button"
            onClick={() => {
              const newUniqueId = generateUniqueMaterialId(materials.map((m) => m.uniqueId));
              setEditingMaterial({
                id: `mat-${Date.now()}`,
                uniqueId: newUniqueId,
                title: '',
                subject: 'Matematika',
                grade: activeGradeTab,
                status: 'Tampil',
                order: 1,
              });
              setInfoModalOpen(true);
            }}
            className="min-h-[44px] px-5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-sm cursor-pointer"
          >
            Tambah Materi
          </button>
        </GlassCard>
      ) : (
        <>
          {/* Top Page Tabs Bar (Identical to Student View + Add Page (+) Tab) */}
          <div className="flex flex-wrap items-center justify-center gap-1 w-full px-1 py-1">
            {currentMaterialPages.map((p) => {
              const isTabActive = p.pageNumber === activePageNum;
              const hasUnsavedDot = isTabActive && isDraftDirty;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActivePageNum(p.pageNumber);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative h-9 rounded-[12px] text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center select-none ${
                    isTabActive
                      ? 'w-[68px] bg-[#2DD4BF]/60 text-[#ECFEFF] border border-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                      : 'w-[42px] min-w-[32px] bg-[#0F766E]/40 hover:bg-[#0F766E]/60 text-[#A5D8D3] border border-white/15'
                  }`}
                >
                  <span>{p.pageNumber}</span>
                  {hasUnsavedDot && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FBBF24]" />
                  )}
                </button>
              );
            })}

            {/* Add Page Tab (+) next to last page tab (hidden during preview) */}
            {!isPreviewMode && currentMaterialPages.length < 30 && (
              <button
                type="button"
                onClick={handleAddPage}
                className="h-9 w-[42px] min-w-[32px] rounded-[12px] border border-dashed border-[#2DD4BF] bg-transparent text-[#2DD4BF] flex items-center justify-center hover:bg-[#2DD4BF]/15 transition-colors cursor-pointer"
                aria-label="Tambah halaman"
              >
                <Plus size={18} />
              </button>
            )}
          </div>

          {/* Page Card: Preview or In-Place Edit */}
          {pageDraft && (
            <GlassCard
              isReadingArea={pageDraft.type === 'Materi'}
              className="p-4 sm:p-7 flex flex-col text-[#ECFEFF]"
            >
              {isPreviewMode ? (
                /* PREVIEW MODE: Exact student view */
                <div className="flex flex-col gap-5">
                  {pageDraft.type === 'Materi' && (
                    <div className="flex flex-col gap-4">
                      {pageDraft.blocks.map((b) => (
                        <div key={b.id}>
                          {b.type === 'text' && (
                            <p className="text-base sm:text-[17px] leading-[1.7]">{b.content}</p>
                          )}
                          {b.type === 'image' && b.imageSrc && (
                            <img src={b.imageSrc} alt="" className="rounded-xl max-h-96 object-contain" />
                          )}
                          {b.type === 'video' && b.videoUrl && (
                            <div className="aspect-video w-full rounded-2xl overflow-hidden">
                              <iframe title="Video" src={b.videoUrl} className="w-full h-full" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {pageDraft.type === 'Game' && <GameViewer htmlCode={pageDraft.gameHtml} />}
                </div>
              ) : (
                /* EDIT MODE */
                <div className="flex flex-col gap-6">
                  {/* EDIT MODE: Page Type = Materi */}
                  {pageDraft.type === 'Materi' && (
                    <div className="flex flex-col gap-5">
                      {/* Blocks List with in-place controls */}
                      <div className="flex flex-col gap-4">
                        {pageDraft.blocks.map((b, idx) => (
                          <div
                            key={b.id}
                            className="group relative p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-[#2DD4BF]/30 transition-colors"
                          >
                            {/* Block Action Controls (reorder, delete) */}
                            <div className="absolute right-2 top-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 z-10">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveBlock(idx, 'up')}
                                className="p-1 rounded bg-black/40 hover:bg-black/60 text-white disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === pageDraft.blocks.length - 1}
                                onClick={() => handleMoveBlock(idx, 'down')}
                                className="p-1 rounded bg-black/40 hover:bg-black/60 text-white disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveBlock(b.id)}
                                className="p-1 rounded bg-red-500/30 hover:bg-red-500/50 text-red-200 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Block Type Editor */}
                            {b.type === 'text' && (
                              <div className="flex flex-col gap-2 pr-20">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={b.textStyle || 'paragraph'}
                                    onChange={(e) =>
                                      handleUpdateBlock(b.id, {
                                        textStyle: e.target.value as any,
                                      })
                                    }
                                    className="bg-black/30 border border-white/15 rounded-lg px-2 py-1 text-xs text-[#2DD4BF] outline-none"
                                  >
                                    <option value="title">Judul</option>
                                    <option value="subtitle">Subjudul</option>
                                    <option value="paragraph">Paragraf</option>
                                    <option value="quote">Kutipan</option>
                                  </select>
                                </div>
                                <textarea
                                  rows={b.textStyle === 'title' ? 1 : 4}
                                  value={b.content || ''}
                                  onChange={(e) => handleUpdateBlock(b.id, { content: e.target.value })}
                                  className="w-full bg-transparent border border-white/10 rounded-xl p-3 text-base text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
                                />
                              </div>
                            )}

                            {b.type === 'image' && (
                              <div className="flex flex-col gap-2">
                                <ImageUploader
                                  value={b.imageSrc || ''}
                                  sourceType={b.imageSourceType || 'tautan'}
                                  onChange={(val, srcType) =>
                                    handleUpdateBlock(b.id, { imageSrc: val, imageSourceType: srcType })
                                  }
                                />
                              </div>
                            )}

                            {b.type === 'video' && (
                              <div className="flex flex-col gap-2">
                                <label className="text-xs text-[#A5D8D3]">URL Video YouTube</label>
                                <input
                                  type="text"
                                  value={b.videoUrl || ''}
                                  onChange={(e) => handleUpdateBlock(b.id, { videoUrl: e.target.value })}
                                  placeholder="https://www.youtube.com/embed/..."
                                  className="w-full h-11 px-3 rounded-xl bg-black/20 border border-white/15 text-sm text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
                                />
                              </div>
                            )}

                            {b.type === 'document' && (
                              <div className="flex flex-col gap-2">
                                <label className="text-xs text-[#A5D8D3]">URL Dokumen PDF</label>
                                <input
                                  type="text"
                                  value={b.docUrl || ''}
                                  onChange={(e) => handleUpdateBlock(b.id, { docUrl: e.target.value })}
                                  placeholder="https://..."
                                  className="w-full h-11 px-3 rounded-xl bg-black/20 border border-white/15 text-sm text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
                                />
                              </div>
                            )}

                            {b.type === 'table' && (
                              <div className="flex flex-col gap-2 overflow-x-auto">
                                <table className="w-full text-xs">
                                  <tbody>
                                    {(b.tableData || []).map((row, r) => (
                                      <tr key={r}>
                                        {row.map((cell, c) => (
                                          <td key={c} className="p-1">
                                            <input
                                              type="text"
                                              value={cell}
                                              onChange={(e) => {
                                                const newTable = [...(b.tableData || [])];
                                                newTable[r][c] = e.target.value;
                                                handleUpdateBlock(b.id, { tableData: newTable });
                                              }}
                                              className="w-full h-8 px-2 rounded bg-black/30 border border-white/10 text-white"
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {b.type === 'divider' && (
                              <hr className="my-2 border-white/20" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Block Bar (Teks, Gambar, Video, Dokumen, Tabel, Pemisah) */}
                      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-black/20 border border-white/10">
                        <button
                          type="button"
                          onClick={() => handleAddBlock('text')}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
                        >
                          <FileText size={14} />
                          <span>Teks</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('image')}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon size={14} />
                          <span>Gambar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('video')}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
                        >
                          <Video size={14} />
                          <span>Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('document')}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
                        >
                          <FileCode size={14} />
                          <span>Dokumen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('table')}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
                        >
                          <TableIcon size={14} />
                          <span>Tabel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('divider')}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
                        >
                          <Minus size={14} />
                          <span>Pemisah</span>
                        </button>
                      </div>

                      {/* Uji Pemahaman In-Place Editor */}
                      <div className="pt-6 border-t border-white/15 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#ECFEFF]">Uji Pemahaman</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateUji({
                                enabled: !(pageDraft.ujiPemahaman?.enabled),
                              })
                            }
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                              pageDraft.ujiPemahaman?.enabled
                                ? 'bg-[#2DD4BF] text-[#042F2E]'
                                : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {pageDraft.ujiPemahaman?.enabled ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </div>

                        {pageDraft.ujiPemahaman?.enabled && (
                          <div className="flex flex-col gap-3 mt-1">
                            <input
                              type="text"
                              value={pageDraft.ujiPemahaman.question || ''}
                              onChange={(e) => handleUpdateUji({ question: e.target.value })}
                              placeholder="Pertanyaan Uji Pemahaman"
                              className="w-full h-11 px-3 rounded-xl bg-black/20 border border-white/15 text-sm text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
                            />

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#A5D8D3]">Waktu Muncul (detik)</span>
                              <input
                                type="number"
                                min={0}
                                max={300}
                                value={pageDraft.ujiPemahaman.delaySeconds ?? 10}
                                onChange={(e) =>
                                  handleUpdateUji({ delaySeconds: Number(e.target.value) })
                                }
                                className="w-20 h-9 px-2 rounded-lg bg-black/20 border border-white/15 text-xs text-[#ECFEFF]"
                              />
                            </div>

                            {/* Options */}
                            <div className="flex flex-col gap-2 mt-2">
                              {pageDraft.ujiPemahaman.options.map((opt, oIdx) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="correctUji"
                                    checked={pageDraft.ujiPemahaman?.correctAnswerId === opt.id}
                                    onChange={() => handleUpdateUji({ correctAnswerId: opt.id })}
                                    className="accent-[#2DD4BF] cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const updatedOpts = [...pageDraft.ujiPemahaman!.options];
                                      updatedOpts[oIdx].text = e.target.value;
                                      handleUpdateUji({ options: updatedOpts });
                                    }}
                                    className="flex-1 h-10 px-3 rounded-xl bg-black/20 border border-white/15 text-sm text-[#ECFEFF]"
                                  />
                                  {pageDraft.ujiPemahaman!.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedOpts = pageDraft.ujiPemahaman!.options.filter(
                                          (x) => x.id !== opt.id
                                        );
                                        handleUpdateUji({ options: updatedOpts });
                                      }}
                                      className="p-2 text-red-300 hover:text-red-400 cursor-pointer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              ))}

                              {pageDraft.ujiPemahaman.options.length < 5 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextId = `opt-${Date.now()}`;
                                    handleUpdateUji({
                                      options: [
                                        ...pageDraft.ujiPemahaman!.options,
                                        { id: nextId, text: '' },
                                      ],
                                    });
                                  }}
                                  className="w-fit px-3 py-1.5 rounded-lg border border-dashed border-[#2DD4BF] text-[#2DD4BF] text-xs font-semibold cursor-pointer mt-1"
                                >
                                  Tambah Opsi
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: Page Type = Game */}
                  {pageDraft.type === 'Game' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[#2DD4BF]">Kode HTML Game</label>
                        <textarea
                          rows={12}
                          value={pageDraft.gameHtml || ''}
                          onChange={(e) => {
                            setPageDraft({ ...pageDraft, gameHtml: e.target.value });
                            setIsDraftDirty(true);
                          }}
                          className="w-full font-mono text-xs p-3 rounded-xl bg-black/40 border border-white/15 text-emerald-300 outline-none focus:border-[#2DD4BF]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[#A5D8D3]">Pratinjau Game</label>
                        <GameViewer htmlCode={pageDraft.gameHtml} />
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: Page Type = Kuis Akhir */}
                  {pageDraft.type === 'KuisAkhir' && pageDraft.kuisAkhir && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-[#ECFEFF]">Editor Kuis Akhir</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#A5D8D3]">Batas Percobaan</span>
                          <input
                            type="number"
                            min={0}
                            value={pageDraft.kuisAkhir.maxAttempts || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              setPageDraft({
                                ...pageDraft,
                                kuisAkhir: { ...pageDraft.kuisAkhir!, maxAttempts: val },
                              });
                              setIsDraftDirty(true);
                            }}
                            className="w-16 h-8 px-2 rounded-lg bg-black/20 border border-white/15 text-xs text-center"
                          />
                        </div>
                      </div>

                      {/* Questions Editor */}
                      <div className="flex flex-col gap-4">
                        {pageDraft.kuisAkhir.questions.map((q, qIdx) => (
                          <div key={q.id} className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-[#2DD4BF]">Soal {qIdx + 1}</span>
                              {pageDraft.kuisAkhir!.questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedQ = pageDraft.kuisAkhir!.questions.filter((x) => x.id !== q.id);
                                    setPageDraft({
                                      ...pageDraft,
                                      kuisAkhir: { ...pageDraft.kuisAkhir!, questions: updatedQ },
                                    });
                                    setIsDraftDirty(true);
                                  }}
                                  className="text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>

                            <textarea
                              rows={2}
                              value={q.question}
                              onChange={(e) => {
                                const updatedQ = [...pageDraft.kuisAkhir!.questions];
                                updatedQ[qIdx].question = e.target.value;
                                setPageDraft({
                                  ...pageDraft,
                                  kuisAkhir: { ...pageDraft.kuisAkhir!, questions: updatedQ },
                                });
                                setIsDraftDirty(true);
                              }}
                              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm"
                            />

                            {/* CBT Options */}
                            <div className="flex flex-col gap-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`kuis-correct-${q.id}`}
                                    checked={q.correctAnswerId === opt.id}
                                    onChange={() => {
                                      const updatedQ = [...pageDraft.kuisAkhir!.questions];
                                      updatedQ[qIdx].correctAnswerId = opt.id;
                                      setPageDraft({
                                        ...pageDraft,
                                        kuisAkhir: { ...pageDraft.kuisAkhir!, questions: updatedQ },
                                      });
                                      setIsDraftDirty(true);
                                    }}
                                    className="accent-[#2DD4BF]"
                                  />
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const updatedQ = [...pageDraft.kuisAkhir!.questions];
                                      updatedQ[qIdx].options[oIdx].text = e.target.value;
                                      setPageDraft({
                                        ...pageDraft,
                                        kuisAkhir: { ...pageDraft.kuisAkhir!, questions: updatedQ },
                                      });
                                      setIsDraftDirty(true);
                                    }}
                                    className="flex-1 h-9 px-2.5 rounded-lg bg-black/20 border border-white/10 text-xs"
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
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          )}

          {/* Bottom Fixed Glass Control Bar (48px high, safe area respected) */}
          <div
            className="fixed bottom-0 left-0 right-0 z-40 h-12 bg-[#073D39]/90 backdrop-blur-[16px] border-t border-white/15 px-4 flex items-center justify-between"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {isPreviewMode ? (
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="h-8 px-4 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            ) : (
              <>
                {/* Left: Preview icon & Page Menu icon */}
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

                  {/* Page Menu Popup Opening Upwards */}
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

                {/* Right: Simpan Perubahan Button */}
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
        </>
      )}

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
    </div>
  );
};
