// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { Copy, Check, Link, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { SyncConfig } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { generateAppsScriptCode, testConnectionApi } from '../../services/appsScript';

export const AdminSinkronisasi: React.FC = () => {
  const { syncConfig, saveSyncConfig, showToast } = useApp();

  const [localConfig, setLocalConfig] = useState<SyncConfig>(syncConfig);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const scriptCode = generateAppsScriptCode(localConfig);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    showToast('Kode disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!localConfig.webAppUrl) {
      setTestStatus('failed');
      return;
    }
    setIsTesting(true);
    setTestStatus('idle');
    const ok = await testConnectionApi(localConfig.webAppUrl, localConfig.token);
    setIsTesting(false);
    setTestStatus(ok ? 'success' : 'failed');
  };

  const handleSave = () => {
    saveSyncConfig(localConfig);
  };

  return (
    <div className="w-full max-w-[880px] mx-auto flex flex-col gap-4 py-2">
      <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF] px-1">Sinkronisasi</h1>

      {/* Code Box */}
      <GlassCard className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#2DD4BF]">Google Apps Script</span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="h-8 px-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#ECFEFF] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-[#2DD4BF]" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
          </button>
        </div>

        <textarea
          readOnly
          rows={11}
          value={scriptCode}
          className="w-full font-mono text-xs p-3 rounded-xl bg-black/40 border border-white/10 text-emerald-300 outline-none select-all"
        />
      </GlassCard>

      {/* Configuration Inputs */}
      <GlassCard className="p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">URL Web App</label>
            <input
              type="text"
              value={localConfig.webAppUrl}
              onChange={(e) => setLocalConfig({ ...localConfig, webAppUrl: e.target.value })}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Token</label>
              <input
                type="text"
                value={localConfig.token}
                onChange={(e) => setLocalConfig({ ...localConfig, token: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">ID Folder Drive</label>
              <input
                type="text"
                value={localConfig.driveFolderId}
                onChange={(e) => setLocalConfig({ ...localConfig, driveFolderId: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">ID Spreadsheet</label>
              <input
                type="text"
                value={localConfig.spreadsheetId}
                onChange={(e) => setLocalConfig({ ...localConfig, spreadsheetId: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Nama Tab Siswa</label>
              <input
                type="text"
                value={localConfig.tabSiswa}
                onChange={(e) => setLocalConfig({ ...localConfig, tabSiswa: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">Nama Tab Rekap Nilai</label>
              <input
                type="text"
                value={localConfig.tabRekapNilai}
                onChange={(e) => setLocalConfig({ ...localConfig, tabRekapNilai: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-1">
          {/* Uji Koneksi Button & Status Badge */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTesting || !localConfig.webAppUrl}
              onClick={handleTestConnection}
              className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {isTesting && <Loader2 size={14} className="animate-spin text-[#2DD4BF]" />}
              <span>Uji Koneksi</span>
            </button>

            {testStatus === 'success' && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 size={13} />
                <span>Terhubung</span>
              </span>
            )}
            {testStatus === 'failed' && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold">
                <AlertCircle size={13} />
                <span>Gagal</span>
              </span>
            )}
          </div>

          {/* Simpan Button */}
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-6 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
