// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  isReadingArea?: boolean; // denser surface (~55%) for optimal reading contrast
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  isReadingArea = false,
  onClick,
  style = {},
}) => {
  const bgStyle = isReadingArea
    ? 'bg-[#0F766E]/55 backdrop-blur-[18px] border-white/20'
    : 'bg-[#0F766E]/40 backdrop-blur-[16px] border-white/15';

  return (
    <div
      onClick={onClick}
      style={style}
      className={`rounded-[20px] border shadow-lg text-[#ECFEFF] transition-all duration-200 ${bgStyle} ${className}`}
    >
      {children}
    </div>
  );
};
