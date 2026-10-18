// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Check,
  Eye,
  Type,
  Layout,
  HelpCircle,
  Award,
  MessageSquare,
  ToggleLeft,
  Palette,
} from 'lucide-react';
import { CMSSettings } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { ImageUploader } from '../common/ImageUploader';
import { CustomDropdown } from '../common/CustomDropdown';
import { Drawer } from '../common/Drawer';

export type CMSPaneKey =
  | 'identity'
  | 'loginScreen'
  | 'theme'
  | 'sidebarMenu'
  | 'materialDisplay'
  | 'ujiAndKuis'
  | 'rekapNilaiDisplay'
  | 'textsAndMessages'
  | 'features'
  | 'preview';

interface AdminCMSProps {
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
  onOpenPreview: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  isDrawerOpen = false,
  onCloseDrawer = () => {},
  onOpenPreview,
}) => {
  const { cmsSettings, saveCmsPane } = useApp();

  const [activePane, setActivePane] = useState<CMSPaneKey>(() => {
    return (localStorage.getItem('mbd_cms_last_pane') as CMSPaneKey) || 'identity';
  });

  // Local draft of CMS settings (saved only when clicking "Simpan")
  const [draft, setDraft] = useState<CMSSettings>(() => JSON.parse(JSON.stringify(cmsSettings)));
  const [dirtyPanes, setDirtyPanes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem('mbd_cms_last_pane', activePane);
  }, [activePane]);

  const updateDraftPane = <K extends keyof CMSSettings>(paneKey: K, updates: Partial<CMSSettings[K]>) => {
    setDraft((prev) => ({
      ...prev,
      [paneKey]: {
        ...prev[paneKey],
        ...updates,
      },
    }));
    setDirtyPanes((prev) => ({ ...prev, [paneKey]: true }));
  };

  const handleSavePane = <K extends keyof CMSSettings>(paneKey: K) => {
    saveCmsPane(paneKey, draft[paneKey]);
    setDirtyPanes((prev) => ({ ...prev, [paneKey]: false }));
  };

  const cmsNavItems: { key: CMSPaneKey; label: string; icon: React.ReactNode }[] = [
    { key: 'identity', label: 'Identitas', icon: <Type size={16} /> },
    { key: 'loginScreen', label: 'Layar Login', icon: <Layout size={16} /> },
    { key: 'theme', label: 'Tema', icon: <Palette size={16} /> },
    { key: 'sidebarMenu', label: 'Sidebar dan Menu', icon: <Sliders size={16} /> },
    { key: 'materialDisplay', label: 'Tampilan Materi', icon: <Layout size={16} /> },
    { key: 'ujiAndKuis', label: 'Uji Pemahaman dan Kuis', icon: <HelpCircle size={16} /> },
    { key: 'rekapNilaiDisplay', label: 'Rekap Nilai', icon: <Award size={16} /> },
    { key: 'textsAndMessages', label: 'Teks dan Pesan', icon: <MessageSquare size={16} /> },
    { key: 'features', label: 'Fitur', icon: <ToggleLeft size={16} /> },
    { key: 'preview', label: 'Pratinjau', icon: <Eye size={16} /> },
  ];

  // Render Sidebar CMS
  const renderSidebarCMS = () => (
    <div className="flex flex-col h-full p-2.5 gap-1 overflow-y-auto">
      <span className="text-[11px] font-bold text-[#2DD4BF] uppercase px-2.5 py-1">
        Pengaturan CMS
      </span>
      <div className="flex flex-col gap-0.5 mt-1">
        {cmsNavItems.map((item) => {
          const isActive = activePane === item.key;
          const isDirty = dirtyPanes[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.key === 'preview') {
                  onOpenPreview();
                } else {
                  setActivePane(item.key);
                }
                onCloseDrawer();
              }}
              className={`w-full min-h-[44px] px-3 rounded-xl flex items-center justify-between text-left text-[15px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold border border-[#2DD4BF]/40'
                  : 'text-[#ECFEFF]/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-[#2DD4BF]' : 'text-[#A5D8D3]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {isDirty && <span className="w-2 h-2 rounded-full bg-[#FBBF24] shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex w-full min-h-screen">
      {/* Desktop Column 2: Sidebar CMS (232px) */}
      <aside className="hidden lg:flex flex-col w-[232px] shrink-0 h-screen sticky top-0 border-r border-white/15 bg-[#073D39]/50 backdrop-blur-[16px] z-10">
        {renderSidebarCMS()}
      </aside>

      {/* Mobile Drawer: Sidebar CMS */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        variant="compact"
        ariaLabel="Menu CMS"
      >
        {renderSidebarCMS()}
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col p-2 sm:p-4 pb-20 max-w-[820px] mx-auto">
      {/* Pane 1: Identitas */}
      {activePane === 'identity' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Identitas</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Nama Aplikasi *</label>
              <input
                type="text"
                value={draft.identity.appName}
                onChange={(e) => updateDraftPane('identity', { appName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Nama Lembaga *</label>
              <input
                type="text"
                value={draft.identity.institutionName}
                onChange={(e) => updateDraftPane('identity', { institutionName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Nama Singkat Header HP Admin</label>
              <input
                type="text"
                value={draft.identity.shortName}
                onChange={(e) => updateDraftPane('identity', { shortName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <ImageUploader
                label="Logo Lembaga"
                value={draft.identity.logoUrl}
                sourceType={draft.identity.logoSource}
                onChange={(val, srcType) =>
                  updateDraftPane('identity', { logoUrl: val, logoSource: srcType })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Teks Hak Cipta</label>
              <input
                type="text"
                value={draft.identity.copyrightText}
                onChange={(e) => updateDraftPane('identity', { copyrightText: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.identity}
            onClick={() => handleSavePane('identity')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}

      {/* Pane 2: Layar Login */}
      {activePane === 'loginScreen' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Layar Login</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Judul Sambutan</label>
              <input
                type="text"
                value={draft.loginScreen.welcomeTitle}
                onChange={(e) => updateDraftPane('loginScreen', { welcomeTitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Nama Lembaga Tampil</label>
              <input
                type="text"
                value={draft.loginScreen.institutionDisplay}
                onChange={(e) => updateDraftPane('loginScreen', { institutionDisplay: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Kalimat Sambutan</label>
              <input
                type="text"
                value={draft.loginScreen.welcomeSubtitle}
                onChange={(e) => updateDraftPane('loginScreen', { welcomeSubtitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Label Kata Sandi</label>
                <input
                  type="text"
                  value={draft.loginScreen.passwordLabel}
                  onChange={(e) => updateDraftPane('loginScreen', { passwordLabel: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Label Tombol</label>
                <input
                  type="text"
                  value={draft.loginScreen.buttonLabel}
                  onChange={(e) => updateDraftPane('loginScreen', { buttonLabel: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rotateCheck"
                  checked={draft.loginScreen.logoRotateEnabled}
                  onChange={(e) => updateDraftPane('loginScreen', { logoRotateEnabled: e.target.checked })}
                  className="accent-[#2DD4BF]"
                />
                <label htmlFor="rotateCheck" className="text-xs text-[#ECFEFF] cursor-pointer">Logo Berputar</label>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Kecepatan Putar (detik)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={draft.loginScreen.logoRotateSpeed}
                  onChange={(e) => updateDraftPane('loginScreen', { logoRotateSpeed: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.loginScreen}
            onClick={() => handleSavePane('loginScreen')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}

      {/* Pane 3: Tema */}
      {activePane === 'theme' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Tema</h2>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Warna Utama</label>
              <input
                type="color"
                value={draft.theme.primaryColor}
                onChange={(e) => updateDraftPane('theme', { primaryColor: e.target.value })}
                className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-white/15"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Warna Aksen Terang</label>
              <input
                type="color"
                value={draft.theme.accentColor}
                onChange={(e) => updateDraftPane('theme', { accentColor: e.target.value })}
                className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-white/15"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Warna Aksen Hangat</label>
              <input
                type="color"
                value={draft.theme.warmAccentColor}
                onChange={(e) => updateDraftPane('theme', { warmAccentColor: e.target.value })}
                className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-white/15"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Gradasi Latar 1</label>
              <input
                type="color"
                value={draft.theme.bgGradient1}
                onChange={(e) => updateDraftPane('theme', { bgGradient1: e.target.value })}
                className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-white/15"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.theme}
            onClick={() => handleSavePane('theme')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}

      {/* Pane 4: Sidebar dan Menu */}
      {activePane === 'sidebarMenu' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Sidebar dan Menu</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Label Mata Pelajaran</label>
              <input
                type="text"
                value={draft.sidebarMenu.labelMataPelajaran}
                onChange={(e) => updateDraftPane('sidebarMenu', { labelMataPelajaran: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Label Rekap Nilai</label>
              <input
                type="text"
                value={draft.sidebarMenu.labelRekapNilai}
                onChange={(e) => updateDraftPane('sidebarMenu', { labelRekapNilai: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Label Keluar</label>
              <input
                type="text"
                value={draft.sidebarMenu.labelKeluar}
                onChange={(e) => updateDraftPane('sidebarMenu', { labelKeluar: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 text-xs text-[#ECFEFF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.sidebarMenu.showProfileCard}
                  onChange={(e) => updateDraftPane('sidebarMenu', { showProfileCard: e.target.checked })}
                  className="accent-[#2DD4BF]"
                />
                <span>Tampilkan Kartu Profil</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#ECFEFF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.sidebarMenu.showProgressBar}
                  onChange={(e) => updateDraftPane('sidebarMenu', { showProgressBar: e.target.checked })}
                  className="accent-[#2DD4BF]"
                />
                <span>Tampilkan Bilah Progres</span>
              </label>
            </div>
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.sidebarMenu}
            onClick={() => handleSavePane('sidebarMenu')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}

      {/* Pane 5: Tampilan Materi */}
      {activePane === 'materialDisplay' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Tampilan Materi</h2>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Ukuran Huruf Isi (px)</label>
              <input
                type="number"
                value={draft.materialDisplay.bodyFontSize}
                onChange={(e) => updateDraftPane('materialDisplay', { bodyFontSize: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Lebar Maksimal Baca (px)</label>
              <input
                type="number"
                value={draft.materialDisplay.maxReadWidth}
                onChange={(e) => updateDraftPane('materialDisplay', { maxReadWidth: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.materialDisplay}
            onClick={() => handleSavePane('materialDisplay')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}

      {/* Pane 6: Uji Pemahaman dan Kuis */}
      {activePane === 'ujiAndKuis' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Uji Pemahaman dan Kuis</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Teks Popup Berhasil</label>
              <input
                type="text"
                value={draft.ujiAndKuis.popupSuccessText}
                onChange={(e) => updateDraftPane('ujiAndKuis', { popupSuccessText: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Lama Popup (detik)</label>
                <input
                  type="number"
                  step="0.1"
                  value={draft.ujiAndKuis.popupDuration}
                  onChange={(e) => updateDraftPane('ujiAndKuis', { popupDuration: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Waktu Muncul Awal (detik)</label>
                <input
                  type="number"
                  value={draft.ujiAndKuis.defaultUjiDelay}
                  onChange={(e) => updateDraftPane('ujiAndKuis', { defaultUjiDelay: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Label Mundur</label>
                <input
                  type="text"
                  value={draft.ujiAndKuis.labelMundur}
                  onChange={(e) => updateDraftPane('ujiAndKuis', { labelMundur: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Label Lanjut</label>
                <input
                  type="text"
                  value={draft.ujiAndKuis.labelLanjut}
                  onChange={(e) => updateDraftPane('ujiAndKuis', { labelLanjut: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Label Selesai</label>
                <input
                  type="text"
                  value={draft.ujiAndKuis.labelSelesai}
                  onChange={(e) => updateDraftPane('ujiAndKuis', { labelSelesai: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.ujiAndKuis}
            onClick={() => handleSavePane('ujiAndKuis')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}

      {/* Pane 7: Rekap Nilai */}
      {activePane === 'rekapNilaiDisplay' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Rekap Nilai</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Judul Halaman</label>
              <input
                type="text"
                value={draft.rekapNilaiDisplay.pageTitle}
                onChange={(e) => updateDraftPane('rekapNilaiDisplay', { pageTitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 text-xs text-[#ECFEFF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.rekapNilaiDisplay.showSummaryCards}
                  onChange={(e) => updateDraftPane('rekapNilaiDisplay', { showSummaryCards: e.target.checked })}
                  className="accent-[#2DD4BF]"
                />
                <span>Tampilkan Kartu Ringkasan</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#ECFEFF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.rekapNilaiDisplay.showChart}
                  onChange={(e) => updateDraftPane('rekapNilaiDisplay', { showChart: e.target.checked })}
                  className="accent-[#2DD4BF]"
                />
                <span>Tampilkan Grafik</span>
              </label>
            </div>
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.rekapNilaiDisplay}
            onClick={() => handleSavePane('rekapNilaiDisplay')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}

      {/* Pane 8: Teks dan Pesan */}
      {activePane === 'textsAndMessages' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Teks dan Pesan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Galat Kata Sandi Login</label>
              <input
                type="text"
                value={draft.textsAndMessages.errorLogin}
                onChange={(e) => updateDraftPane('textsAndMessages', { errorLogin: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Galat Kata Sandi Materi</label>
              <input
                type="text"
                value={draft.textsAndMessages.passwordModalError}
                onChange={(e) => updateDraftPane('textsAndMessages', { passwordModalError: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Teks Materi Salah Kelas</label>
              <input
                type="text"
                value={draft.textsAndMessages.wrongGradeText}
                onChange={(e) => updateDraftPane('textsAndMessages', { wrongGradeText: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Teks Materi Tidak Tersedia</label>
              <input
                type="text"
                value={draft.textsAndMessages.materialUnavailable}
                onChange={(e) => updateDraftPane('textsAndMessages', { materialUnavailable: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.textsAndMessages}
            onClick={() => handleSavePane('textsAndMessages')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}

      {/* Pane 9: Fitur */}
      {activePane === 'features' && (
        <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#ECFEFF]">Fitur</h2>
          <div className="flex flex-col gap-3">
            {[
              { key: 'logoRotate', label: 'Logo Berputar 3D' },
              { key: 'completedBadge', label: 'Penanda Materi Dikerjakan' },
              { key: 'rememberLastMaterial', label: 'Ingat Materi Terakhir' },
              { key: 'summaryCards', label: 'Kartu Ringkasan Nilai' },
              { key: 'gradeChart', label: 'Grafik Batang Nilai' },
            ].map((f) => (
              <label key={f.key} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(draft.features as any)[f.key]}
                  onChange={(e) =>
                    updateDraftPane('features', { [f.key]: e.target.checked } as any)
                  }
                  className="accent-[#2DD4BF]"
                />
                <span className="text-sm text-[#ECFEFF]">{f.label}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={!dirtyPanes.features}
            onClick={() => handleSavePane('features')}
            className="w-fit self-end mt-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </GlassCard>
      )}
      </div>
    </div>
  );
};
