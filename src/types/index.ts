// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

export type GradeLevel = 'VII' | 'VIII' | 'IX';

export interface Student {
  id: string;
  nisn: string;
  nama: string;
  kelas: string; // e.g. "VII A", "VII B", "VIII A", "IX A"
}

export type MaterialStatus = 'Tampil' | 'Sembunyi';

export type PageType = 'Materi' | 'Game' | 'KuisAkhir';

export type BlockType = 'text' | 'image' | 'video' | 'document' | 'table' | 'divider';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content?: string; // Markdown or rich text
  textStyle?: 'title' | 'subtitle' | 'paragraph' | 'quote';
  imageSrc?: string;
  imageSourceType?: 'drive' | 'tautan';
  videoUrl?: string; // YouTube embed URL
  docUrl?: string; // PDF link / drive URL
  tableData?: string[][]; // 2D array of cells
}

export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
}

export interface UjiPemahamanData {
  enabled: boolean;
  question: string;
  questionImage?: string;
  options: QuestionOption[];
  correctAnswerId: string;
  delaySeconds: number; // default 10
}

export interface CBTQuestion {
  id: string;
  question: string;
  questionImage?: string;
  options: QuestionOption[];
  correctAnswerId: string;
}

export interface FinalQuizData {
  maxAttempts: number; // 0 for unlimited
  questions: CBTQuestion[];
}

export interface MaterialPage {
  id: string;
  materialId: string;
  pageNumber: number; // 1-indexed
  type: PageType;
  blocks: ContentBlock[];
  ujiPemahaman?: UjiPemahamanData;
  gameHtml?: string;
  kuisAkhir?: FinalQuizData;
}

export interface Material {
  id: string;
  uniqueId: string; // 8 char unique alphanumeric link identifier
  title: string;
  subject: string;
  grade: GradeLevel;
  status: MaterialStatus;
  order: number;
  password?: string; // Optional password for material
  createdAt: string;
  updatedAt: string;
}

export interface GradeRecap {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  subject: string;
  materialId: string;
  materialTitle: string;
  ujiPemahamanScore: number | null;
  kuisAkhirScore: number | null;
  finalScore: number | null;
  predicate: string; // A, B, C, D
  updatedAt: string;
}

export interface GradeSettings {
  ujiWeight: number; // default 30
  kuisWeight: number; // default 70
  kkm: number; // default 75
  predA: number; // default 90
  predB: number; // default 80
  predC: number; // default 70
}

export interface CMSSettings {
  identity: {
    appName: string;
    institutionName: string;
    shortName: string;
    logoUrl: string;
    logoSource: 'tautan' | 'drive';
    faviconUrl: string;
    copyrightText: string;
    pageTitle: string;
    metaDescription: string;
  };
  loginScreen: {
    welcomeTitle: string;
    institutionDisplay: string;
    welcomeSubtitle: string;
    passwordLabel: string;
    buttonLabel: string;
    errorMessage: string;
    logoRotateEnabled: boolean;
    logoRotateSpeed: number; // seconds
    bgType: 'gradasi' | 'gambar';
    bgImageUrl?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    warmAccentColor: string;
    bgGradient1: string;
    bgGradient2: string;
    bgGradient3: string;
    textPrimary: string;
    textSecondary: string;
    glassOpacity: number; // 0.2 - 0.9
    glassBlur: number; // 8 - 30 px
    fontFamily: string;
    borderRadius: number; // px
  };
  sidebarMenu: {
    labelMataPelajaran: string;
    labelRekapNilai: string;
    labelKeluar: string;
    labelBackSubject: string;
    showProfileCard: boolean;
    showProgressBar: boolean;
  };
  materialDisplay: {
    tabNormalColor: string;
    tabActiveColor: string;
    pagePaddingX: number; // px
    bodyFontSize: number; // px
    maxReadWidth: number; // px
    showCompletedBadge: boolean;
    emptyStateText: string;
  };
  ujiAndKuis: {
    popupSuccessText: string;
    popupDuration: number; // seconds, default 1.8
    defaultUjiDelay: number; // seconds, default 10
    labelMundur: string;
    labelLanjut: string;
    labelSelesai: string;
    labelKembali: string;
    labelSelesaikan: string;
    textUnansweredConfirm: string;
    textQuizResult: string;
    colorUnanswered: string;
    colorAnswered: string;
  };
  rekapNilaiDisplay: {
    pageTitle: string;
    colSubject: string;
    colMaterial: string;
    colUji: string;
    colKuis: string;
    colFinal: string;
    colPredicate: string;
    labelAvgFinal: string;
    labelCompletedCount: string;
    labelAttemptedCount: string;
    showSummaryCards: boolean;
    showChart: boolean;
    colorPredA: string;
    colorPredB: string;
    colorPredC: string;
    colorPredD: string;
  };
  textsAndMessages: {
    errorLogin: string;
    countdownLogin: string;
    notifSaved: string;
    notifLinkCopied: string;
    emptyMaterial: string;
    notFound404: string;
    offlineBadge: string;
    wrongGradeText: string;
    materialUnavailable: string;
    passwordModalTitle: string;
    passwordModalBtn: string;
    passwordModalError: string;
    homeTitle: string;
    gradePrefix: string;
  };
  features: {
    logoRotate: boolean;
    completedBadge: boolean;
    rememberLastMaterial: boolean;
    summaryCards: boolean;
    gradeChart: boolean;
  };
}

export interface SyncConfig {
  webAppUrl: string;
  token: string;
  driveFolderId: string;
  spreadsheetId: string;
  tabSiswa: string;
  tabRekapNilai: string;
}

export interface UserSession {
  role: 'admin' | 'siswa';
  nisn?: string;
  nama?: string;
  kelas?: string;
  gradeLevel?: GradeLevel;
  lastActive: number;
}
