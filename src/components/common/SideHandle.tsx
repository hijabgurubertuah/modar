// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { Menu, LayoutGrid } from 'lucide-react';

interface HandleProps {
  iconType?: 'menu' | 'grid';
  onClick: () => void;
  isOpen?: boolean;
  ariaLabel: string;
}

const SingleHandle: React.FC<HandleProps> = ({
  iconType = 'menu',
  onClick,
  isOpen = false,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      className={`group relative w-[25px] h-[120px] rounded-r-[16px] border-r border-t border-b border-white/10 bg-[#0F766E]/15 backdrop-blur-[6px] flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ease-out cursor-pointer active:scale-95 active:bg-[#0F766E]/60 select-none shadow-md ${
        isOpen ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-70 hover:opacity-100'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Top short vertical accent line (22px, 2px thick, rounded) */}
      <span className="w-[2px] h-[22px] rounded-full bg-[#2DD4BF] opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* Center Icon (18px) */}
      <span className="text-[#ECFEFF] opacity-80 group-hover:opacity-100 transition-opacity">
        {iconType === 'menu' ? <Menu size={18} /> : <LayoutGrid size={18} />}
      </span>

      {/* Bottom short vertical accent line */}
      <span className="w-[2px] h-[22px] rounded-full bg-[#2DD4BF] opacity-70 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

interface SideHandleContainerProps {
  // If dual, shows two stacked handles (top = screen drawer, bottom = admin drawer)
  mode: 'single' | 'dual';
  iconTypeSingle?: 'menu' | 'grid';
  onSingleClick?: () => void;
  onClick?: () => void;
  singleAriaLabel?: string;
  isSingleOpen?: boolean;
  isOpen?: boolean;

  // Dual mode props
  onTopClick?: () => void;
  isTopOpen?: boolean;
  topAriaLabel?: string;

  onBottomClick?: () => void;
  isBottomOpen?: boolean;
  bottomAriaLabel?: string;
}

export const SideHandle: React.FC<SideHandleContainerProps> = ({
  mode,
  iconTypeSingle = 'menu',
  onSingleClick,
  onClick,
  singleAriaLabel = 'Buka menu',
  isSingleOpen,
  isOpen,

  onTopClick = () => {},
  isTopOpen = false,
  topAriaLabel = 'Buka menu layar',

  onBottomClick = () => {},
  isBottomOpen = false,
  bottomAriaLabel = 'Buka menu admin',
}) => {
  const handleSingleClick = onClick || onSingleClick || (() => {});
  const singleOpen = isOpen !== undefined ? isOpen : isSingleOpen !== undefined ? isSingleOpen : false;
  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-40 lg:hidden flex flex-col items-start gap-[10px] pointer-events-auto"
      style={{
        paddingLeft: 'env(safe-area-inset-left, 0px)',
      }}
    >
      {mode === 'single' ? (
        <SingleHandle
          iconType={iconTypeSingle}
          onClick={handleSingleClick}
          isOpen={singleOpen}
          ariaLabel={singleAriaLabel}
        />
      ) : (
        <>
          <SingleHandle
            iconType="menu"
            onClick={onTopClick}
            isOpen={isTopOpen}
            ariaLabel={topAriaLabel}
          />
          <SingleHandle
            iconType="grid"
            onClick={onBottomClick}
            isOpen={isBottomOpen}
            ariaLabel={bottomAriaLabel}
          />
        </>
      )}
    </div>
  );
};
