// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Award,
  Sliders,
  RefreshCw,
  Database,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SideHandle } from '../common/SideHandle';
import { Drawer } from '../common/Drawer';

export type AdminMenuKey =
  | 'materi'
  | 'siswa'
  | 'nilai'
  | 'cms'
  | 'sinkronisasi'
  | 'firebase'
  | 'kata-sandi';

interface AdminLayoutProps {
  currentMenu: AdminMenuKey;
  onSelectMenu: (menu: AdminMenuKey) => void;
  children: React.ReactNode;
  onTopHandleClick?: () => void;
  isTopHandleOpen?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentMenu,
  onSelectMenu,
  children,
  onTopHandleClick = () => {},
  isTopHandleOpen = false,
}) => {
  const { logout, cmsSettings } = useApp();
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  const isDualHandle = currentMenu === 'materi' || currentMenu === 'cms';

  const adminMenuItems: { key: AdminMenuKey; label: string; icon: React.ReactNode }[] = [
    { key: 'materi', label: 'Materi', icon: <BookOpen size={20} /> },
    { key: 'siswa', label: 'Siswa', icon: <Users size={20} /> },
    { key: 'nilai', label: 'Nilai', icon: <Award size={20} /> },
    { key: 'cms', label: 'CMS', icon: <Sliders size={20} /> },
    { key: 'sinkronisasi', label: 'Sinkronisasi', icon: <RefreshCw size={20} /> },
    { key: 'firebase', label: 'Penggunaan Firebase', icon: <Database size={20} /> },
    { key: 'kata-sandi', label: 'Kata Sandi', icon: <KeyRound size={20} /> },
  ];

  const handleMenuClick = (key: AdminMenuKey) => {
    setAdminDrawerOpen(false);
    onSelectMenu(key);
    window.location.hash = `#admin/${key}`;
  };

  // Render Sidebar Admin items
  const renderAdminSidebarItems = () => (
    <div className="flex flex-col h-full p-3 justify-between">
      <div className="flex flex-col gap-2">
        {/* Admin Brand / Logo */}
        <div className="flex items-center gap-3 px-3 py-3 border-b border-white/10">
          {cmsSettings.identity.logoUrl && (
            <img
              src={cmsSettings.identity.logoUrl}
              alt=""
              className="w-8 h-8 object-contain shrink-0"
            />
          )}
          <span className="text-base font-bold text-[#ECFEFF] truncate">
            {cmsSettings.identity.shortName || 'Panel Admin'}
          </span>
        </div>

        {/* Menu Items (min 48px, 16px font as specified for Admin Sidebar) */}
        <nav className="flex flex-col gap-1 mt-2">
          {adminMenuItems.map((item) => {
            const isActive = currentMenu === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleMenuClick(item.key)}
                className={`w-full min-h-[48px] px-3.5 rounded-xl flex items-center gap-3 text-[16px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold border border-[#2DD4BF]/30'
                    : 'text-[#ECFEFF]/90 hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-[#2DD4BF]' : 'text-[#A5D8D3]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <button
        type="button"
        onClick={() => {
          setAdminDrawerOpen(false);
          logout();
        }}
        className="w-full min-h-[48px] px-3.5 rounded-xl flex items-center gap-3 text-[16px] text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer mt-auto"
      >
        <LogOut size={20} className="text-red-400" />
        <span>Keluar</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative bg-[#042F2E] text-[#ECFEFF] select-none">
      {/* Background Gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${cmsSettings.theme.bgGradient1} 0%, ${cmsSettings.theme.bgGradient2} 50%, ${cmsSettings.theme.bgGradient3} 100%)`,
        }}
      />

      {/* Mobile Header: only shown on non-materi screens */}
      {currentMenu !== 'materi' && (
        <header
          className="lg:hidden w-full h-14 shrink-0 px-4 flex items-center gap-2.5 border-b border-white/10 bg-[#073D39]/80 backdrop-blur-[16px] sticky top-0 z-30"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          {cmsSettings.identity.logoUrl && (
            <img
              src={cmsSettings.identity.logoUrl}
              alt=""
              className="w-7 h-7 object-contain shrink-0"
            />
          )}
          <span className="text-sm sm:text-base font-bold text-[#ECFEFF] truncate">
            {cmsSettings.identity.shortName || 'Panel Admin'}
          </span>
        </header>
      )}

      {/* Mobile Side Handle Button(s) */}
      {isDualHandle ? (
        <SideHandle
          mode="dual"
          onTopClick={onTopHandleClick}
          isTopOpen={isTopHandleOpen}
          topAriaLabel="Buka menu layar"
          onBottomClick={() => setAdminDrawerOpen((prev) => !prev)}
          isBottomOpen={adminDrawerOpen}
          bottomAriaLabel="Buka menu admin"
        />
      ) : (
        <SideHandle
          mode="single"
          iconTypeSingle="grid"
          onSingleClick={() => setAdminDrawerOpen((prev) => !prev)}
          isOpen={adminDrawerOpen}
          singleAriaLabel="Buka menu admin"
        />
      )}

      {/* Mobile Main Admin Drawer */}
      <Drawer
        isOpen={adminDrawerOpen}
        onClose={() => setAdminDrawerOpen(false)}
        variant="admin"
        ariaLabel="Menu panel admin"
      >
        {renderAdminSidebarItems()}
      </Drawer>

      {/* Desktop Persistent Left Column 1: Admin Sidebar (232px) */}
      <aside className="hidden lg:flex flex-col w-[232px] shrink-0 h-screen sticky top-0 border-r border-white/15 bg-[#073D39]/80 backdrop-blur-[20px] z-20">
        {renderAdminSidebarItems()}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
};
