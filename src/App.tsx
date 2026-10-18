// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { SiswaLayout } from './components/siswa/SiswaLayout';
import { BerandaSiswa } from './components/siswa/BerandaSiswa';
import { MateriViewer } from './components/siswa/MateriViewer';
import { RekapNilaiSiswa } from './components/siswa/RekapNilaiSiswa';
import { AdminLayout, AdminMenuKey } from './components/admin/AdminLayout';
import { AdminMateri } from './components/admin/AdminMateri';
import { AdminSiswa } from './components/admin/AdminSiswa';
import { AdminNilai } from './components/admin/AdminNilai';
import { AdminCMS } from './components/admin/AdminCMS';
import { AdminSinkronisasi } from './components/admin/AdminSinkronisasi';
import { AdminFirebaseUsage } from './components/admin/AdminFirebaseUsage';
import { AdminKataSandi } from './components/admin/AdminKataSandi';
import { Toast } from './components/common/Toast';
import { OfflineBadge } from './components/common/OfflineBadge';

export default function App() {
  const { session, materials, toastMessage, toastType } = useApp();

  // Current Hash Route
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || '');

  // Sub-drawer states for mobile Admin
  const [materiDrawerOpen, setMateriDrawerOpen] = useState(false);
  const [cmsDrawerOpen, setCmsDrawerOpen] = useState(false);

  // Active subject in Siswa portal
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Admin Preview Mode State
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync title from CMS settings
  useEffect(() => {
    document.title = 'Modul Belajar Daring - SMP NEGERI 1 BENGKALIS';
  }, []);

  // NOT LOGGED IN: Entire app is closed, show LoginScreen
  if (!session && !previewMode) {
    return (
      <>
        <LoginScreen />
        <Toast message={toastMessage} type={toastType} />
        <OfflineBadge />
      </>
    );
  }

  // Parse Hash
  const hash = currentHash.replace(/^#/, '');

  // ADMIN ROLE ROUTING
  if (session?.role === 'admin' && !previewMode) {
    let adminMenu: AdminMenuKey = 'materi';
    if (hash.startsWith('admin/siswa')) adminMenu = 'siswa';
    else if (hash.startsWith('admin/nilai')) adminMenu = 'nilai';
    else if (hash.startsWith('admin/cms')) adminMenu = 'cms';
    else if (hash.startsWith('admin/sinkronisasi')) adminMenu = 'sinkronisasi';
    else if (hash.startsWith('admin/firebase')) adminMenu = 'firebase';
    else if (hash.startsWith('admin/kata-sandi')) adminMenu = 'kata-sandi';
    else if (hash.startsWith('admin/materi')) adminMenu = 'materi';
    else if (hash.startsWith('materi/')) {
      // Opening material link while logged in as admin opens AdminMateri
      adminMenu = 'materi';
    }

    return (
      <>
        <AdminLayout
          currentMenu={adminMenu}
          onSelectMenu={(menu) => {
            window.location.hash = `#admin/${menu}`;
          }}
          onTopHandleClick={() => {
            if (adminMenu === 'materi') setMateriDrawerOpen((prev) => !prev);
            if (adminMenu === 'cms') setCmsDrawerOpen((prev) => !prev);
          }}
          isTopHandleOpen={
            adminMenu === 'materi'
              ? materiDrawerOpen
              : adminMenu === 'cms'
              ? cmsDrawerOpen
              : false
          }
        >
          {adminMenu === 'materi' && (
            <AdminMateri
              isDrawerOpen={materiDrawerOpen}
              onCloseDrawer={() => setMateriDrawerOpen(false)}
            />
          )}
          {adminMenu === 'siswa' && <AdminSiswa />}
          {adminMenu === 'nilai' && <AdminNilai />}
          {adminMenu === 'cms' && (
            <AdminCMS
              isDrawerOpen={cmsDrawerOpen}
              onCloseDrawer={() => setCmsDrawerOpen(false)}
              onOpenPreview={() => setPreviewMode(true)}
            />
          )}
          {adminMenu === 'sinkronisasi' && <AdminSinkronisasi />}
          {adminMenu === 'firebase' && <AdminFirebaseUsage />}
          {adminMenu === 'kata-sandi' && <AdminKataSandi />}
        </AdminLayout>

        <Toast message={toastMessage} type={toastType} />
        <OfflineBadge />
      </>
    );
  }

  // SISWA ROLE ROUTING (or Admin in Preview Mode)
  // If student tries to open admin link, redirect to #beranda
  if (hash.startsWith('admin/')) {
    window.location.hash = '#beranda';
    return null;
  }

  // Determine active view
  let activeView: 'beranda' | 'materi' | 'rekap' | 'notFound' = 'beranda';
  let targetMaterialUniqueId: string | undefined;

  if (hash === 'rekap-nilai') {
    activeView = 'rekap';
  } else if (hash.startsWith('materi/')) {
    activeView = 'materi';
    targetMaterialUniqueId = hash.replace('materi/', '');
  } else if (hash === 'beranda' || hash === '' || hash === 'login') {
    activeView = 'beranda';
  } else {
    activeView = 'notFound';
  }

  // Find target material to determine active subject
  const currentMaterial = targetMaterialUniqueId
    ? materials.find((m) => m.uniqueId === targetMaterialUniqueId)
    : null;

  const effectiveSubject = currentMaterial ? currentMaterial.subject : selectedSubject || undefined;

  return (
    <>
      {/* If in preview mode, show top banner to exit preview */}
      {previewMode && (
        <div className="fixed top-2 right-2 z-50">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="h-8 px-4 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-xs shadow-xl cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      )}

      <SiswaLayout
        activeSubject={effectiveSubject}
        activeMaterialId={currentMaterial?.id}
        onSelectMaterial={(matId) => {
          const mat = materials.find((m) => m.id === matId);
          if (mat) {
            window.location.hash = `#materi/${mat.uniqueId}`;
          }
        }}
        onBackToSubjects={() => {
          setSelectedSubject(null);
          window.location.hash = '#beranda';
        }}
      >
        {activeView === 'beranda' && (
          <BerandaSiswa
            onSelectSubject={(subjectName) => {
              setSelectedSubject(subjectName);
              // Open first material of that subject
              const firstMat = materials.find(
                (m) =>
                  m.grade === (session?.gradeLevel || 'VII') &&
                  m.subject.toLowerCase() === subjectName.toLowerCase() &&
                  m.status === 'Tampil'
              );
              if (firstMat) {
                window.location.hash = `#materi/${firstMat.uniqueId}`;
              }
            }}
          />
        )}

        {activeView === 'materi' && (
          <MateriViewer uniqueId={targetMaterialUniqueId} />
        )}

        {activeView === 'rekap' && <RekapNilaiSiswa />}

        {activeView === 'notFound' && (
          <div className="w-full max-w-[480px] mx-auto py-16 text-center">
            <h2 className="text-xl font-bold text-[#ECFEFF] mb-2">Halaman Tidak Ditemukan</h2>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#beranda';
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-bold text-sm cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </SiswaLayout>

      <Toast message={toastMessage} type={toastType} />
      <OfflineBadge />
    </>
  );
}
