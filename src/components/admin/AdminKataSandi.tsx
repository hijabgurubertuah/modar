// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';

export const AdminKataSandi: React.FC = () => {
  const { changeAdminPassword } = useApp();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!oldPassword) {
      setErrorMessage('Kata sandi lama wajib diisi');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Ulangi kata sandi tidak cocok');
      return;
    }

    const res = await changeAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMessage(res.error || 'Gagal mengubah kata sandi');
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-4 py-2">
      <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF] px-1">Ubah Kata Sandi</h1>

      <GlassCard className="p-5 sm:p-7 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
          <div>
            <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">
              Kata Sandi Lama *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white/5 border border-white/15 text-sm text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5D8D3] hover:text-[#ECFEFF] p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">
              Kata Sandi Baru *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/15 text-sm text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A5D8D3] mb-1 block">
              Ulangi Kata Sandi Baru *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/15 text-sm text-[#ECFEFF] outline-none focus:border-[#2DD4BF]"
            />
          </div>

          {errorMessage && (
            <div className="text-xs text-red-300 bg-red-950/40 border border-red-500/30 rounded-lg p-2.5 text-center">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[44px] mt-2 rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a4] text-[#042F2E] font-bold text-sm transition-colors cursor-pointer shadow-md"
          >
            Simpan
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
