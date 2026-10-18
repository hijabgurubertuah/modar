// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

/**
 * ATURAN DESAIN PERMANEN (designSystem)
 * 
 * 1. PRINSIP UTAMA:
 *    - Tampilan minimalis, bersih, ringkas, profesional, dan siap produksi.
 *    - DILARANG menampilkan teks petunjuk, penjelasan fungsi, tips, catatan, perhatian, format file, batas ukuran,
 *      atau keterangan teknis (Drive, Apps Script, Firebase, base64, dsb).
 *    - Teks antarmuka HANYA berupa:
 *      a. Konten asli aplikasi
 *      b. Judul halaman / bagian (1 frasa singkat)
 *      c. Label tombol / menu (kata kerja singkat 1-3 kata)
 *      d. Label kolom isian (frasa singkat di atas kolom, tanda * untuk wajib)
 *      e. Pesan galat validasi (hanya saat terjadi kesalahan)
 *      f. Notifikasi singkat aksi ("Berhasil disimpan", "Tautan disalin")
 *      g. Judul singkat keadaan kosong ("Belum ada data", "Belum ada materi", "Belum ada nilai")
 *      h. Lencana status singkat ("Offline")
 *    - Placeholder kolom dikosongkan atau hanya contoh isi murni (bukan kalimat perintah).
 * 
 * 2. PALET WARNA RESMI:
 *    - Utama (Primary Dark Teal): #0F766E
 *    - Sekunder (Deep Teal): #134E4A
 *    - Aksen Terang (Light Teal): #2DD4BF
 *    - Aksen Hangat (Warm Amber): #FBBF24
 *    - Latar Gradasi Diagonal: #042F2E, #0B4F4A, lalu #0F766E
 *    - Teks Utama: #ECFEFF
 *    - Teks Sekunder: #A5D8D3
 *    - Bahaya / Belum Dijawab: #EF4444
 *    - Sukses / Sudah Dijawab: #22C55E (#34D399)
 * 
 * 3. PERMUKAAN KACA (GLASSMORPHISM):
 *    - Kartu & Wadah Standar: background rgba(15, 118, 110, 0.40), backdrop-blur 16-20px, border rgba(255, 255, 255, 0.15), rounded 20px
 *    - Isi Materi / Bacaan: background rgba(15, 118, 110, 0.55), teks sangat kontras dan mudah dibaca
 *    - Tombol Pegangan Sidebar HP: 25px x 120px, background rgba(15, 118, 110, 0.12), border rgba(255,255,255,0.08)
 * 
 * 4. PENGECUALIAN KHUSUS:
 *    - Tidak ada hamburger di header Ruang Belajar Siswa (HP tidak punya header).
 *    - Header HP Admin hanya logo + nama singkat (tanpa tombol).
 *    - Tombol pegangan sidebar HP menempel di tepi kiri tengah layar (25x120px).
 *    - Kolom pilihan (dropdown) terbuka langsung di kolomnya (tanpa bottom-sheet atau popup browser).
 *    - Tab halaman materi (tinggi 36px, lebar min 32px) berangka saja ("1", "2", ...).
 */

export const DESIGN_SYSTEM = {
  colors: {
    primary: '#0F766E',
    secondary: '#134E4A',
    accent: '#2DD4BF',
    accentWarm: '#FBBF24',
    bgGradient: ['#042F2E', '#0B4F4A', '#0F766E'],
    textPrimary: '#ECFEFF',
    textSecondary: '#A5D8D3',
    danger: '#EF4444',
    success: '#22C55E',
  },
  typography: {
    headingFont: 'Plus Jakarta Sans, sans-serif',
    bodyFont: 'Inter, sans-serif',
  },
  glass: {
    cardBg: 'rgba(15, 118, 110, 0.40)',
    contentBg: 'rgba(15, 118, 110, 0.55)',
    border: 'rgba(255, 255, 255, 0.15)',
    blur: '18px',
    radius: '20px',
  },
  subjectPalette: [
    '#2DD4BF',
    '#38BDF8',
    '#34D399',
    '#FBBF24',
    '#FB923C',
    '#A78BFA',
    '#F472B6',
    '#60A5FA',
  ],
} as const;

export function getSubjectColor(subjectName: string): string {
  if (!subjectName) return DESIGN_SYSTEM.subjectPalette[0];
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DESIGN_SYSTEM.subjectPalette.length;
  return DESIGN_SYSTEM.subjectPalette[index];
}
