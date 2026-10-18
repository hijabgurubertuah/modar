// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';

export const LoginScreen: React.FC = () => {
  const { login, cmsSettings } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || isLoading) return;

    setErrorMessage('');
    setIsLoading(true);

    const res = await login(password);
    setIsLoading(false);

    if (res.success) {
      setFailedAttempts(0);
      // Route appropriately: if target URL in hash exists (like #materi/...), preserve it
      const currentHash = window.location.hash;
      if (currentHash && currentHash.startsWith('#materi/')) {
        // stay on same material route
        return;
      }
      // Check session
      // Admin goes to #admin/materi, Siswa goes to #beranda
      // We will let the top-level Router navigate based on session
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      setErrorMessage(res.error || cmsSettings.textsAndMessages.errorLogin);

      if (nextFailures >= 5) {
        setLockoutSeconds(30);
      }
    }
  };

  const loginSettings = cmsSettings.loginScreen;
  const identity = cmsSettings.identity;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${cmsSettings.theme.bgGradient1} 0%, ${cmsSettings.theme.bgGradient2} 50%, ${cmsSettings.theme.bgGradient3} 100%)`,
        }}
      />

      {/* Main Glass Login Card */}
      <GlassCard className="w-full max-w-[400px] p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Spinning Coin Logo */}
        {identity.logoUrl && (
          <div className="perspective-1000 mb-4">
            <img
              src={identity.logoUrl}
              alt=""
              className={`w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${
                loginSettings.logoRotateEnabled ? 'animate-coin-spin' : ''
              }`}
              style={{
                animationDuration: `${loginSettings.logoRotateSpeed || 6}s`,
                transformStyle: 'preserve-3d',
              }}
            />
          </div>
        )}

        {/* Welcome Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-[#ECFEFF] leading-snug">
          {loginSettings.welcomeTitle}
        </h1>

        {/* Institution & Subtitle */}
        <p className="text-sm sm:text-base font-semibold text-[#2DD4BF] mt-1">
          {loginSettings.institutionDisplay}
        </p>
        <p className="text-xs sm:text-sm text-[#A5D8D3] mt-0.5 mb-6">
          {loginSettings.welcomeSubtitle}
        </p>

        {/* Form with single password field */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#A5D8D3]">
              {loginSettings.passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={isLoading || lockoutSeconds > 0}
                autoFocus
                className="w-full min-h-[48px] px-3.5 pr-11 rounded-xl bg-[#0F766E]/40 border border-white/20 text-[#ECFEFF] placeholder-white/30 text-base focus:border-[#2DD4BF] focus:bg-[#134E4A]/80 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5D8D3] hover:text-[#ECFEFF] transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-xs sm:text-sm text-red-300 bg-red-950/40 border border-red-500/30 rounded-lg px-3 py-2 text-center">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || lockoutSeconds > 0}
            className="w-full min-h-[48px] mt-2 rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a4] text-[#042F2E] font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-md"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-[#042F2E]" />
            ) : lockoutSeconds > 0 ? (
              `${cmsSettings.textsAndMessages.countdownLogin} (${lockoutSeconds})`
            ) : (
              loginSettings.buttonLabel
            )}
          </button>
        </form>
      </GlassCard>

      {/* Copyright Footer */}
      {identity.copyrightText && (
        <p className="text-xs text-[#A5D8D3]/70 mt-6 text-center">
          {identity.copyrightText}
        </p>
      )}
    </div>
  );
};
