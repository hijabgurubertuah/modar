// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import { GradeLevel, UserSession } from '../types';

const STORAGE_KEYS = {
  SESSION: 'mbd_session',
  ADMIN_PASSWORD_HASH: 'mbd_admin_pwd_hash',
  UNLOCKED_MATERIALS: 'mbd_unlocked_materials',
  LAST_OPENED_PAGES: 'mbd_last_opened_pages',
  STUDENT_UJI_STATE: 'mbd_student_uji_state',
  STUDENT_QUIZ_ANSWERS: 'mbd_student_quiz_answers',
  PENDING_GRADES: 'mbd_pending_grades',
  OFFLINE_CACHE: 'mbd_offline_cache',
  CMS_SETTINGS: 'mbd_cms_settings',
  GRADE_SETTINGS: 'mbd_grade_settings',
  MATERIALS: 'mbd_materials',
  PAGES: 'mbd_pages',
  STUDENTS: 'mbd_students',
  GRADES: 'mbd_grades',
  SYNC_CONFIG: 'mbd_sync_config',
  FIREBASE_USAGE: 'mbd_firebase_usage',
};

// SHA-256 hash helper with salt
export async function hashPassword(password: string): Promise<string> {
  const salt = 'SMPN1_BENGKALIS_SALT_2026_';
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extract grade level from class string according to loose specification
export function extractGradeLevel(kelas: string | undefined): GradeLevel | null {
  if (!kelas) return null;
  // Normalize string: remove spaces, dots, dashes, lowercase
  const clean = kelas.toLowerCase().replace(/[\s.\-_]/g, '');
  
  // Check Roman VIII before VII
  if (clean.startsWith('viii') || clean.startsWith('8')) {
    return 'VIII';
  }
  if (clean.startsWith('vii') || clean.startsWith('7')) {
    return 'VII';
  }
  if (clean.startsWith('ix') || clean.startsWith('9')) {
    return 'IX';
  }
  return null;
}

// Generate unique 8-character alphanumeric ID for materials
export function generateUniqueMaterialId(existingIds: string[] = []): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  do {
    id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingIds.includes(id));
  return id;
}

// User Session Management
export function getSavedSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const session: UserSession = JSON.parse(raw);
    
    // Admin session expires after 30 minutes of inactivity
    if (session.role === 'admin') {
      const thirtyMinutes = 30 * 60 * 1000;
      if (Date.now() - session.lastActive > thirtyMinutes) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        return null;
      }
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function updateSessionActivity(): void {
  try {
    const session = getSavedSession();
    if (session) {
      session.lastActive = Date.now();
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  } catch {
    // ignore
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch {
    // ignore
  }
}

// Material password unlocked persistence per student & material
export function isMaterialUnlocked(studentNisn: string, materialId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_MATERIALS);
    if (!raw) return false;
    const map = JSON.parse(raw);
    return !!map[`${studentNisn}_${materialId}`];
  } catch {
    return false;
  }
}

export function setMaterialUnlocked(studentNisn: string, materialId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_MATERIALS);
    const map = raw ? JSON.parse(raw) : {};
    map[`${studentNisn}_${materialId}`] = true;
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_MATERIALS, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// Student Uji Pemahaman answered correctly state
export function isUjiAnsweredCorrectly(studentNisn: string, pageId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_UJI_STATE);
    if (!raw) return false;
    const map = JSON.parse(raw);
    return !!map[`${studentNisn}_${pageId}`];
  } catch {
    return false;
  }
}

export function setUjiAnsweredCorrectly(studentNisn: string, pageId: string, attempts: number): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_UJI_STATE);
    const map = raw ? JSON.parse(raw) : {};
    map[`${studentNisn}_${pageId}`] = { answered: true, attempts };
    localStorage.setItem(STORAGE_KEYS.STUDENT_UJI_STATE, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// Student Quiz Answers State
export function getStudentQuizAnswers(studentNisn: string, materialId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_QUIZ_ANSWERS);
    if (!raw) return {};
    const map = JSON.parse(raw);
    return map[`${studentNisn}_${materialId}`] || {};
  } catch {
    return {};
  }
}

export function saveStudentQuizAnswers(studentNisn: string, materialId: string, answers: Record<string, string>): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_QUIZ_ANSWERS);
    const map = raw ? JSON.parse(raw) : {};
    map[`${studentNisn}_${materialId}`] = answers;
    localStorage.setItem(STORAGE_KEYS.STUDENT_QUIZ_ANSWERS, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// Remember last opened material & page per subject
export function getLastOpenedSubjectPage(studentNisn: string, subjectName: string): { materialId?: string; pageNumber?: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_OPENED_PAGES);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[`${studentNisn}_${subjectName.toLowerCase()}`] || null;
  } catch {
    return null;
  }
}

export function setLastOpenedSubjectPage(studentNisn: string, subjectName: string, materialId: string, pageNumber: number): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_OPENED_PAGES);
    const map = raw ? JSON.parse(raw) : {};
    map[`${studentNisn}_${subjectName.toLowerCase()}`] = { materialId, pageNumber };
    localStorage.setItem(STORAGE_KEYS.LAST_OPENED_PAGES, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getCompletedPages(studentNisn: string, materialId: string): number {
  try {
    const raw = localStorage.getItem('mbd_completed_pages');
    if (!raw) return 1;
    const map = JSON.parse(raw);
    const val = map[`${studentNisn}_${materialId}`];
    return typeof val === 'number' ? val : 1;
  } catch {
    return 1;
  }
}

export function setCompletedPages(studentNisn: string, materialId: string, count: number): void {
  try {
    const raw = localStorage.getItem('mbd_completed_pages');
    const map = raw ? JSON.parse(raw) : {};
    const current = map[`${studentNisn}_${materialId}`] || 1;
    if (count > current) {
      map[`${studentNisn}_${materialId}`] = count;
      localStorage.setItem('mbd_completed_pages', JSON.stringify(map));
    }
  } catch {
    // ignore
  }
}

