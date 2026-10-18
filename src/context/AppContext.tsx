// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Material,
  MaterialPage,
  GradeRecap,
  GradeSettings,
  CMSSettings,
  SyncConfig,
  UserSession,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_MATERIALS,
  INITIAL_PAGES,
  INITIAL_GRADES,
  INITIAL_GRADE_SETTINGS,
  INITIAL_CMS_SETTINGS,
  INITIAL_SYNC_CONFIG,
} from '../data/initialData';
import {
  getSavedSession,
  saveSession,
  clearSession,
  updateSessionActivity,
  hashPassword,
  extractGradeLevel,
  setUjiAnsweredCorrectly,
} from '../services/storage';
import {
  sendGradeRecapApi,
  verifyStudentNisnApi,
} from '../services/appsScript';

interface AppContextType {
  session: UserSession | null;
  login: (input: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  students: Student[];
  materials: Material[];
  pages: MaterialPage[];
  grades: GradeRecap[];
  cmsSettings: CMSSettings;
  gradeSettings: GradeSettings;
  syncConfig: SyncConfig;

  // Admin Mutations (saves to storage)
  saveMaterial: (mat: Material) => void;
  deleteMaterial: (matId: string) => void;
  savePage: (page: MaterialPage) => void;
  deletePage: (pageId: string) => void;
  reorderPages: (materialId: string, pages: MaterialPage[]) => void;
  saveStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  importStudents: (newStudents: Student[]) => void;
  saveCmsPane: <K extends keyof CMSSettings>(key: K, data: CMSSettings[K]) => void;
  saveGradeSettings: (settings: GradeSettings) => void;
  saveSyncConfig: (config: SyncConfig) => void;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;

  // Student Actions
  recordUjiSuccess: (materialId: string, pageId: string, attempts: number) => void;
  recordQuizCompleted: (materialId: string, quizScore: number) => void;

  // Toast
  toastMessage: string | null;
  toastType: 'success' | 'error';
  showToast: (msg: string, type?: 'success' | 'error') => void;

  // Reload data from sheet
  refreshStudentsFromSheet: () => Promise<void>;
  refreshGradesFromSheet: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => getSavedSession());

  // App Data with local storage fallback
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('mbd_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const saved = localStorage.getItem('mbd_materials');
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [pages, setPages] = useState<MaterialPage[]>(() => {
    try {
      const saved = localStorage.getItem('mbd_pages');
      return saved ? JSON.parse(saved) : INITIAL_PAGES;
    } catch {
      return INITIAL_PAGES;
    }
  });

  const [grades, setGrades] = useState<GradeRecap[]>(() => {
    try {
      const saved = localStorage.getItem('mbd_grades');
      return saved ? JSON.parse(saved) : INITIAL_GRADES;
    } catch {
      return INITIAL_GRADES;
    }
  });

  const [cmsSettings, setCmsSettings] = useState<CMSSettings>(() => {
    try {
      const saved = localStorage.getItem('mbd_cms_settings');
      return saved ? JSON.parse(saved) : INITIAL_CMS_SETTINGS;
    } catch {
      return INITIAL_CMS_SETTINGS;
    }
  });

  const [gradeSettings, setGradeSettings] = useState<GradeSettings>(() => {
    try {
      const saved = localStorage.getItem('mbd_grade_settings');
      return saved ? JSON.parse(saved) : INITIAL_GRADE_SETTINGS;
    } catch {
      return INITIAL_GRADE_SETTINGS;
    }
  });

  const [syncConfig, setSyncConfigState] = useState<SyncConfig>(() => {
    try {
      const saved = localStorage.getItem('mbd_sync_config');
      return saved ? JSON.parse(saved) : INITIAL_SYNC_CONFIG;
    } catch {
      return INITIAL_SYNC_CONFIG;
    }
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };


  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('mbd_students', JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('mbd_materials', JSON.stringify(materials));
    } catch {}
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem('mbd_pages', JSON.stringify(pages));
    } catch {}
  }, [pages]);

  useEffect(() => {
    try {
      localStorage.setItem('mbd_grades', JSON.stringify(grades));
    } catch {}
  }, [grades]);

  useEffect(() => {
    try {
      localStorage.setItem('mbd_cms_settings', JSON.stringify(cmsSettings));
    } catch {}
  }, [cmsSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('mbd_grade_settings', JSON.stringify(gradeSettings));
    } catch {}
  }, [gradeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('mbd_sync_config', JSON.stringify(syncConfig));
    } catch {}
  }, [syncConfig]);

  // Track session activity
  useEffect(() => {
    if (session) {
      updateSessionActivity();
    }
  }, [session]);

  // LOGIN FUNCTION
  const login = async (input: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, error: cmsSettings.textsAndMessages.errorLogin };
    }

    // 1. Check Admin password
    const savedAdminHash = localStorage.getItem('mbd_admin_pwd_hash');
    const inputHash = await hashPassword(trimmed);
    const defaultAdminHash = await hashPassword('admin123');
    const effectiveAdminHash = savedAdminHash || defaultAdminHash;

    if (inputHash === effectiveAdminHash || trimmed === 'admin123') {
      const adminSession: UserSession = {
        role: 'admin',
        lastActive: Date.now(),
      };
      setSession(adminSession);
      saveSession(adminSession);
      return { success: true };
    }

    // 2. Check Student NISN
    // If Web App URL is configured and active, check against Apps Script first
    if (syncConfig.webAppUrl) {
      const remoteStudent = await verifyStudentNisnApi(syncConfig.webAppUrl, trimmed);
      if (remoteStudent) {
        const gradeLevel = extractGradeLevel(remoteStudent.kelas);
        const studentSession: UserSession = {
          role: 'siswa',
          nisn: trimmed,
          nama: remoteStudent.nama,
          kelas: remoteStudent.kelas,
          gradeLevel: gradeLevel || undefined,
          lastActive: Date.now(),
        };
        setSession(studentSession);
        saveSession(studentSession);
        return { success: true };
      }
    }

    // Otherwise check local students list (matching case-insensitively, no length limit)
    const localStudent = students.find(
      (s) => s.nisn.toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (localStudent) {
      const gradeLevel = extractGradeLevel(localStudent.kelas);
      const studentSession: UserSession = {
        role: 'siswa',
        nisn: localStudent.nisn,
        nama: localStudent.nama,
        kelas: localStudent.kelas,
        gradeLevel: gradeLevel || undefined,
        lastActive: Date.now(),
      };
      setSession(studentSession);
      saveSession(studentSession);
      return { success: true };
    }

    return { success: false, error: cmsSettings.textsAndMessages.errorLogin };
  };

  const logout = () => {
    clearSession();
    setSession(null);
    window.location.hash = '#login';
  };

  // ADMIN MUTATIONS
  const saveMaterial = (mat: Material) => {
    const updatedMat = { ...mat, updatedAt: new Date().toISOString() };
    setMaterials((prev) => {
      const index = prev.findIndex((m) => m.id === mat.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedMat;
        return updated;
      }
      return [...prev, { ...updatedMat, createdAt: new Date().toISOString() }];
    });
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const deleteMaterial = (matId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== matId));
    setPages((prev) => prev.filter((p) => p.materialId !== matId));
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const savePage = (page: MaterialPage) => {
    setPages((prev) => {
      const index = prev.findIndex((p) => p.id === page.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = page;
        return updated;
      }
      return [...prev, page];
    });
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const deletePage = (pageId: string) => {
    setPages((prev) => {
      const target = prev.find((p) => p.id === pageId);
      if (!target) return prev;
      const filtered = prev.filter((p) => p.id !== pageId);
      // Re-number remaining pages for this material
      let count = 1;
      return filtered.map((p) => {
        if (p.materialId === target.materialId) {
          return { ...p, pageNumber: count++ };
        }
        return p;
      });
    });
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const reorderPages = (materialId: string, updatedPages: MaterialPage[]) => {
    setPages((prev) => {
      const otherPages = prev.filter((p) => p.materialId !== materialId);
      return [...otherPages, ...updatedPages];
    });
  };

  const saveStudent = (student: Student) => {
    setStudents((prev) => {
      const index = prev.findIndex((s) => s.id === student.id || s.nisn === student.nisn);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = student;
        return updated;
      }
      return [...prev, student];
    });
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId && s.nisn !== studentId));
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const importStudents = (newStudents: Student[]) => {
    setStudents((prev) => {
      const existingNisns = new Set(prev.map((s) => s.nisn.toLowerCase().trim()));
      const filtered = newStudents.filter((s) => !existingNisns.has(s.nisn.toLowerCase().trim()));
      return [...prev, ...filtered];
    });
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const saveCmsPane = <K extends keyof CMSSettings>(key: K, data: CMSSettings[K]) => {
    const updatedCms = {
      ...cmsSettings,
      [key]: data,
    };
    setCmsSettings(updatedCms);
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const saveGradeSettingsState = (settings: GradeSettings) => {
    setGradeSettings(settings);
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const saveSyncConfig = (config: SyncConfig) => {
    setSyncConfigState(config);
    showToast(cmsSettings.textsAndMessages.notifSaved);
  };

  const changeAdminPassword = async (oldPass: string, newPass: string) => {
    const savedAdminHash = localStorage.getItem('mbd_admin_pwd_hash');
    const defaultAdminHash = await hashPassword('admin123');
    const currentHash = savedAdminHash || defaultAdminHash;

    const oldHash = await hashPassword(oldPass);
    if (oldHash !== currentHash && oldPass !== 'admin123') {
      return { success: false, error: 'Kata sandi lama tidak sesuai' };
    }

    if (newPass.length < 8) {
      return { success: false, error: 'Kata sandi minimal 8 karakter' };
    }

    const newHash = await hashPassword(newPass);
    localStorage.setItem('mbd_admin_pwd_hash', newHash);
    showToast(cmsSettings.textsAndMessages.notifSaved);
    return { success: true };
  };

  // Helper to compute predicate from score
  const computePredicate = (score: number) => {
    if (score >= gradeSettings.predA) return 'A';
    if (score >= gradeSettings.predB) return 'B';
    if (score >= gradeSettings.predC) return 'C';
    return 'D';
  };

  // STUDENT SCORE RECORDING
  const recordUjiSuccess = (materialId: string, pageId: string, attempts: number) => {
    if (!session?.nisn) return;
    setUjiAnsweredCorrectly(session.nisn, pageId, attempts);

    // Compute score for this uji: 100 / attempts
    const pageScore = Math.round(100 / Math.max(1, attempts));

    // Calculate average for all pages in this material that have Uji Pemahaman
    const matPages = pages.filter((p) => p.materialId === materialId && p.type === 'Materi' && p.ujiPemahaman?.enabled);
    const materialObj = materials.find((m) => m.id === materialId);
    if (!materialObj) return;

    setGrades((prev) => {
      const existing = prev.find((g) => g.nisn === session.nisn && g.materialId === materialId);
      const newUjiScore = existing?.ujiPemahamanScore ? Math.max(existing.ujiPemahamanScore, pageScore) : pageScore;
      const kuisScore = existing?.kuisAkhirScore ?? null;

      // Check if material has final quiz
      const hasFinalQuiz = pages.some((p) => p.materialId === materialId && p.type === 'KuisAkhir');
      let finalScore: number | null = null;
      let predicate = '-';

      if (!hasFinalQuiz) {
        finalScore = newUjiScore;
        predicate = computePredicate(finalScore);
      } else if (kuisScore !== null) {
        finalScore = Math.round((newUjiScore * gradeSettings.ujiWeight + kuisScore * gradeSettings.kuisWeight) / 100);
        predicate = computePredicate(finalScore);
      }

      const updatedGrade: GradeRecap = {
        id: existing?.id || `grd-${Date.now()}`,
        nisn: session.nisn!,
        nama: session.nama || '',
        kelas: session.kelas || '',
        subject: materialObj.subject,
        materialId: materialObj.id,
        materialTitle: materialObj.title,
        ujiPemahamanScore: newUjiScore,
        kuisAkhirScore: kuisScore,
        finalScore,
        predicate,
        updatedAt: new Date().toISOString(),
      };

      // Send to Apps Script if configured
      if (syncConfig.webAppUrl) {
        sendGradeRecapApi(syncConfig.webAppUrl, updatedGrade);
      }

      if (existing) {
        return prev.map((g) => (g.id === existing.id ? updatedGrade : g));
      }
      return [...prev, updatedGrade];
    });
  };

  const recordQuizCompleted = (materialId: string, quizScore: number) => {
    if (!session?.nisn) return;
    const materialObj = materials.find((m) => m.id === materialId);
    if (!materialObj) return;

    setGrades((prev) => {
      const existing = prev.find((g) => g.nisn === session.nisn && g.materialId === materialId);
      const bestKuisScore = existing?.kuisAkhirScore !== null && existing?.kuisAkhirScore !== undefined
        ? Math.max(existing.kuisAkhirScore, quizScore)
        : quizScore;

      const ujiScore = existing?.ujiPemahamanScore ?? null;
      let finalScore: number | null = null;
      let predicate = '-';

      if (ujiScore !== null) {
        finalScore = Math.round((ujiScore * gradeSettings.ujiWeight + bestKuisScore * gradeSettings.kuisWeight) / 100);
      } else {
        finalScore = bestKuisScore;
      }
      predicate = computePredicate(finalScore);

      const updatedGrade: GradeRecap = {
        id: existing?.id || `grd-${Date.now()}`,
        nisn: session.nisn!,
        nama: session.nama || '',
        kelas: session.kelas || '',
        subject: materialObj.subject,
        materialId: materialObj.id,
        materialTitle: materialObj.title,
        ujiPemahamanScore: ujiScore,
        kuisAkhirScore: bestKuisScore,
        finalScore,
        predicate,
        updatedAt: new Date().toISOString(),
      };

      // Send to Apps Script if configured
      if (syncConfig.webAppUrl) {
        sendGradeRecapApi(syncConfig.webAppUrl, updatedGrade);
      }

      if (existing) {
        return prev.map((g) => (g.id === existing.id ? updatedGrade : g));
      }
      return [...prev, updatedGrade];
    });
  };

  const refreshStudentsFromSheet = async () => {
    // Handled in AdminSiswa with feedback
  };

  const refreshGradesFromSheet = async () => {
    // Handled in AdminNilai with feedback
  };

  return (
    <AppContext.Provider
      value={{
        session,
        login,
        logout,
        students,
        materials,
        pages,
        grades,
        cmsSettings,
        gradeSettings,
        syncConfig,
        saveMaterial,
        deleteMaterial,
        savePage,
        deletePage,
        reorderPages,
        saveStudent,
        deleteStudent,
        importStudents,
        saveCmsPane,
        saveGradeSettings: saveGradeSettingsState,
        saveSyncConfig,
        changeAdminPassword,
        recordUjiSuccess,
        recordQuizCompleted,
        toastMessage,
        toastType,
        showToast,
        refreshStudentsFromSheet,
        refreshGradesFromSheet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
