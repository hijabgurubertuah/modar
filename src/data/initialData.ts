// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import { Student, Material, MaterialPage, GradeRecap, GradeSettings, CMSSettings, SyncConfig } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', nisn: '0123456701', nama: 'Ahmad Fauzi', kelas: 'VII A' },
  { id: 'std-2', nisn: '0123456702', nama: 'Siti Aisyah', kelas: 'VII A' },
  { id: 'std-3', nisn: '0123456703', nama: 'Rizky Pratama', kelas: 'VII A' },
  { id: 'std-4', nisn: '88123456', nama: 'Tengku Zulkifli', kelas: 'VII A' },
  { id: 'std-5', nisn: '99012345', nama: 'Wan Nurhaliza', kelas: 'VII A' },
  { id: 'std-6', nisn: '123456789011', nama: 'Raja Syarifah', kelas: 'VII A' },

  { id: 'std-7', nisn: '0123456704', nama: 'Nur Alya Putri', kelas: 'VII B' },
  { id: 'std-8', nisn: '0123456705', nama: 'Muhammad Dzaky', kelas: 'VII B' },
  { id: 'std-9', nisn: '0123456706', nama: 'Dewi Lestari', kelas: 'VII B' },
  { id: 'std-10', nisn: '77234561', nama: 'Megat Iskandar', kelas: 'VII B' },
  { id: 'std-11', nisn: '0123456713', nama: 'Syarifah Khadijah', kelas: 'VII B' },
  { id: 'std-12', nisn: '123456789012', nama: 'Dato Hairul', kelas: 'VII B' },

  { id: 'std-13', nisn: '0123456707', nama: 'Farhan Hidayat', kelas: 'VIII A' },
  { id: 'std-14', nisn: '0123456708', nama: 'Annisa Rahmah', kelas: 'VIII A' },
  { id: 'std-15', nisn: '0123456709', nama: 'Reza Maulana', kelas: 'VIII A' },
  { id: 'std-16', nisn: '88345672', nama: 'Tengku Mahkota', kelas: 'VIII A' },
  { id: 'std-17', nisn: '0123456714', nama: 'Putri Balqis', kelas: 'VIII A' },
  { id: 'std-18', nisn: '123456789013', nama: 'Wan Muhammad Ariff', kelas: 'VIII A' },

  { id: 'std-19', nisn: '0123456710', nama: 'Putri Ramadhani', kelas: 'IX A' },
  { id: 'std-20', nisn: '0123456711', nama: 'Aditya Saputra', kelas: 'IX A' },
  { id: 'std-21', nisn: '0123456712', nama: 'Nabila Azzahra', kelas: 'IX A' },
  { id: 'std-22', nisn: '99456781', nama: 'Zainal Abidin', kelas: 'IX A' },
  { id: 'std-23', nisn: '0123456715', nama: 'Tengku Farah', kelas: 'IX A' },
  { id: 'std-24', nisn: '123456789014', nama: 'Raja Firdaus', kelas: 'IX A' },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    uniqueId: 'mat7bila',
    title: 'Bilangan Bulat dan Operasinya',
    subject: 'Matematika',
    grade: 'VII',
    status: 'Tampil',
    order: 1,
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'mat-2',
    uniqueId: 'mat7peca',
    title: 'Pecahan dan Desimal',
    subject: 'Matematika',
    grade: 'VII',
    status: 'Tampil',
    order: 2,
    password: 'mtk123',
    createdAt: '2026-03-02T08:00:00Z',
    updatedAt: '2026-03-02T08:00:00Z',
  },
  {
    id: 'mat-3',
    uniqueId: 'ipa7klas',
    title: 'Klasifikasi Makhluk Hidup',
    subject: 'IPA',
    grade: 'VII',
    status: 'Tampil',
    order: 1,
    createdAt: '2026-03-03T08:00:00Z',
    updatedAt: '2026-03-03T08:00:00Z',
  },
  {
    id: 'mat-4',
    uniqueId: 'ind7desk',
    title: 'Teks Deskripsi',
    subject: 'Bahasa Indonesia',
    grade: 'VII',
    status: 'Tampil',
    order: 1,
    createdAt: '2026-03-04T08:00:00Z',
    updatedAt: '2026-03-04T08:00:00Z',
  },
  {
    id: 'mat-5',
    uniqueId: 'ing8desc',
    title: 'Descriptive Text',
    subject: 'Bahasa Inggris',
    grade: 'VIII',
    status: 'Tampil',
    order: 1,
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-05T08:00:00Z',
  },
  {
    id: 'mat-6',
    uniqueId: 'ips8sosb',
    title: 'Keragaman Sosial Budaya',
    subject: 'IPS',
    grade: 'VIII',
    status: 'Tampil',
    order: 1,
    createdAt: '2026-03-06T08:00:00Z',
    updatedAt: '2026-03-06T08:00:00Z',
  },
  {
    id: 'mat-7',
    uniqueId: 'ppk9norm',
    title: 'Norma dalam Kehidupan Bermasyarakat',
    subject: 'PPKn',
    grade: 'IX',
    status: 'Tampil',
    order: 1,
    createdAt: '2026-03-07T08:00:00Z',
    updatedAt: '2026-03-07T08:00:00Z',
  },
];

export const INITIAL_PAGES: MaterialPage[] = [
  // Material 1: Bilangan Bulat dan Operasinya (5 pages)
  {
    id: 'page-1-1',
    materialId: 'mat-1',
    pageNumber: 1,
    type: 'Materi',
    blocks: [
      {
        id: 'b-1-1-1',
        type: 'text',
        textStyle: 'title',
        content: 'Pengenalan Bilangan Bulat',
      },
      {
        id: 'b-1-1-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Bilangan bulat adalah himpunan bilangan yang terdiri dari bilangan bulat negatif, bilangan nol, dan bilangan bulat positif. Pada garis bilangan horizontal, bilangan bulat positif terletak di sebelah kanan angka nol, sedangkan bilangan bulat negatif terletak di sebelah kiri angka nol. Nilai bilangan semakin ke kanan semakin besar, dan semakin ke kiri semakin kecil.',
      },
      {
        id: 'b-1-1-3',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Dalam kehidupan sehari-hari, bilangan negatif sering digunakan untuk menyatakan suhu di bawah titik beku (misalnya -5°C di pegunungan bersalju) atau kedalaman di bawah permukaan laut. Bilangan positif digunakan untuk menyatakan ketinggian atau keuntungan.',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Manakah pernyataan yang benar mengenai urutan nilai bilangan bulat berikut?',
      options: [
        { id: 'opt-a', text: '-15 > -8' },
        { id: 'opt-b', text: '-12 < -5' },
        { id: 'opt-c', text: '0 < -4' },
        { id: 'opt-d', text: '-3 > 2' },
      ],
      correctAnswerId: 'opt-b',
      delaySeconds: 5,
    },
  },
  {
    id: 'page-1-2',
    materialId: 'mat-1',
    pageNumber: 2,
    type: 'Materi',
    blocks: [
      {
        id: 'b-1-2-1',
        type: 'text',
        textStyle: 'title',
        content: 'Penjumlahan dan Pengurangan Bilangan Bulat',
      },
      {
        id: 'b-1-2-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Penjumlahan dua bilangan bertanda sama dilakukan dengan menjumlahkan kedua nilai mutlaknya lalu memberikan tanda yang sama. Contoh: (-7) + (-8) = -15. Jika kedua bilangan berlawanan tanda, kurangkan nilai mutlak yang lebih besar dengan yang lebih kecil, lalu gunakan tanda dari bilangan dengan nilai mutlak terbesar. Contoh: 14 + (-9) = 5.',
      },
      {
        id: 'b-1-2-3',
        type: 'table',
        tableData: [
          ['Operasi', 'Aturan Tanda', 'Contoh'],
          ['Positif + Positif', 'Hasil Positif', '6 + 9 = 15'],
          ['Negatif + Negatif', 'Hasil Negatif', '(-4) + (-5) = -9'],
          ['Positif - Negatif', 'Berubah jadi Penjumlahan', '8 - (-3) = 11'],
        ],
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Berapakah hasil dari kalkulasi (-18) - (-25)?',
      options: [
        { id: 'opt-2a', text: '-43' },
        { id: 'opt-2b', text: '7' },
        { id: 'opt-2c', text: '-7' },
        { id: 'opt-2d', text: '43' },
      ],
      correctAnswerId: 'opt-2b',
      delaySeconds: 10,
    },
  },
  {
    id: 'page-1-3',
    materialId: 'mat-1',
    pageNumber: 3,
    type: 'Materi',
    blocks: [
      {
        id: 'b-1-3-1',
        type: 'text',
        textStyle: 'title',
        content: 'Perkalian dan Pembagian Bilangan Bulat',
      },
      {
        id: 'b-1-3-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Hasil kali atau hasil bagi dari dua bilangan bulat yang bertanda sama selalu menghasilkan bilangan positif. Sebaliknya, perkalian atau pembagian dua bilangan bulat dengan tanda berlawanan selalu menghasilkan bilangan negatif.',
      },
      {
        id: 'b-1-3-3',
        type: 'text',
        textStyle: 'quote',
        content: 'Ingat rumus tanda: (+) x (+) = (+), (-) x (-) = (+), (+) x (-) = (-), (-) x (+) = (-).',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Berapakah hasil dari (-6) x 7 : (-2)?',
      options: [
        { id: 'opt-3a', text: '-21' },
        { id: 'opt-3b', text: '21' },
        { id: 'opt-3c', text: '14' },
        { id: 'opt-3d', text: '-14' },
      ],
      correctAnswerId: 'opt-3b',
      delaySeconds: 15,
    },
  },
  {
    id: 'page-1-4',
    materialId: 'mat-1',
    pageNumber: 4,
    type: 'Game',
    blocks: [],
    gameHtml: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    margin: 0;
    padding: 16px;
    background: #042F2E;
    color: #ECFEFF;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 90vh;
    box-sizing: border-box;
  }
  .card {
    background: rgba(15, 118, 110, 0.45);
    border: 1px solid rgba(45, 212, 191, 0.3);
    border-radius: 16px;
    padding: 24px;
    max-width: 360px;
    width: 100%;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  }
  .score { font-size: 14px; color: #2DD4BF; margin-bottom: 12px; font-weight: 600; }
  .problem { font-size: 32px; font-weight: 700; margin: 16px 0; color: #ECFEFF; letter-spacing: 1px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
  button {
    background: #0F766E;
    color: #ECFEFF;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 12px;
    padding: 14px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.15s;
  }
  button:hover { background: #134E4A; border-color: #2DD4BF; }
  button:active { transform: scale(0.96); }
  .feedback { margin-top: 14px; font-size: 15px; min-height: 22px; font-weight: 600; }
</style>
</head>
<body>
<div class="card">
  <div class="score" id="scoreDisplay">Skor: 0</div>
  <div class="problem" id="problemDisplay">...</div>
  <div class="grid" id="optionsGrid"></div>
  <div class="feedback" id="feedbackDisplay"></div>
</div>
<script>
  let score = 0;
  let currentAns = 0;

  function generateQuestion() {
    const ops = ['+', '-', 'x'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 21) - 10;
    let b = Math.floor(Math.random() * 21) - 10;
    if (op === 'x') {
      a = Math.floor(Math.random() * 13) - 6;
      b = Math.floor(Math.random() * 13) - 6;
      currentAns = a * b;
    } else if (op === '+') {
      currentAns = a + b;
    } else {
      currentAns = a - b;
    }
    const bStr = b < 0 ? '(' + b + ')' : b;
    document.getElementById('problemDisplay').textContent = a + ' ' + (op === 'x' ? '×' : op) + ' ' + bStr;
    const choices = new Set([currentAns]);
    while (choices.size < 4) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      choices.add(currentAns + offset);
    }
    const arr = Array.from(choices).sort(() => Math.random() - 0.5);
    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';
    arr.forEach(val => {
      const btn = document.createElement('button');
      btn.textContent = val;
      btn.onclick = () => checkAnswer(val);
      grid.appendChild(btn);
    });
  }

  function checkAnswer(chosen) {
    const fb = document.getElementById('feedbackDisplay');
    if (chosen === currentAns) {
      score += 10;
      fb.style.color = '#34D399';
      fb.textContent = 'Tepat!';
      document.getElementById('scoreDisplay').textContent = 'Skor: ' + score;
      setTimeout(() => {
        fb.textContent = '';
        generateQuestion();
      }, 700);
    } else {
      fb.style.color = '#F87171';
      fb.textContent = 'Coba lagi';
      setTimeout(() => { fb.textContent = ''; }, 600);
    }
  }

  generateQuestion();
</script>
</body>
</html>`,
  },
  {
    id: 'page-1-5',
    materialId: 'mat-1',
    pageNumber: 5,
    type: 'KuisAkhir',
    blocks: [],
    kuisAkhir: {
      maxAttempts: 0,
      questions: [
        {
          id: 'q1',
          question: 'Nilai dari 15 + (-27) adalah...',
          options: [
            { id: 'q1a', text: '12' },
            { id: 'q1b', text: '-12' },
            { id: 'q1c', text: '42' },
            { id: 'q1d', text: '-42' },
          ],
          correctAnswerId: 'q1b',
        },
        {
          id: 'q2',
          question: 'Hasil dari (-8) - (-14) adalah...',
          options: [
            { id: 'q2a', text: '-22' },
            { id: 'q2b', text: '6' },
            { id: 'q2c', text: '-6' },
            { id: 'q2d', text: '22' },
          ],
          correctAnswerId: 'q2b',
        },
        {
          id: 'q3',
          question: 'Hasil perkalian (-9) x (-8) adalah...',
          options: [
            { id: 'q3a', text: '72' },
            { id: 'q3b', text: '-72' },
            { id: 'q3c', text: '64' },
            { id: 'q3d', text: '-64' },
          ],
          correctAnswerId: 'q3a',
        },
        {
          id: 'q4',
          question: 'Hasil dari 48 : (-6) adalah...',
          options: [
            { id: 'q4a', text: '8' },
            { id: 'q4b', text: '-8' },
            { id: 'q4c', text: '-7' },
            { id: 'q4d', text: '7' },
          ],
          correctAnswerId: 'q4b',
        },
        {
          id: 'q5',
          question: 'Suhu di kota A adalah -4°C, sedangkan suhu di kota B adalah 21°C. Selisih suhu kedua kota adalah...',
          options: [
            { id: 'q5a', text: '17°C' },
            { id: 'q5b', text: '25°C' },
            { id: 'q5c', text: '-17°C' },
            { id: 'q5d', text: '-25°C' },
          ],
          correctAnswerId: 'q5b',
        },
        {
          id: 'q6',
          question: 'Hasil dari 12 x (-3) + 20 adalah...',
          options: [
            { id: 'q6a', text: '-16' },
            { id: 'q6b', text: '16' },
            { id: 'q6c', text: '-56' },
            { id: 'q6d', text: '56' },
          ],
          correctAnswerId: 'q6a',
        },
        {
          id: 'q7',
          question: 'Urutan bilangan -11, 4, -3, 0, 8, -7 dari yang terkecil adalah...',
          options: [
            { id: 'q7a', text: '-11, -7, -3, 0, 4, 8' },
            { id: 'q7b', text: '8, 4, 0, -3, -7, -11' },
            { id: 'q7c', text: '-3, -7, -11, 0, 4, 8' },
            { id: 'q7d', text: '0, -3, -7, -11, 4, 8' },
          ],
          correctAnswerId: 'q7a',
        },
        {
          id: 'q8',
          question: 'Berapakah hasil dari (-50) : 5 x (-2)?',
          options: [
            { id: 'q8a', text: '-20' },
            { id: 'q8b', text: '20' },
            { id: 'q8c', text: '5' },
            { id: 'q8d', text: '-5' },
          ],
          correctAnswerId: 'q8b',
        },
        {
          id: 'q9',
          question: 'Jika m = -4 dan n = 6, maka nilai dari 2m - 3n adalah...',
          options: [
            { id: 'q9a', text: '-26' },
            { id: 'q9b', text: '10' },
            { id: 'q9c', text: '-10' },
            { id: 'q9d', text: '26' },
          ],
          correctAnswerId: 'q9a',
        },
        {
          id: 'q10',
          question: 'Seorang penyelam berada pada kedalaman 12 meter di bawah permukaan laut. Penyelam tersebut kemudian naik sejauh 5 meter. Posisi penyelam sekarang adalah...',
          options: [
            { id: 'q10a', text: '17 meter di bawah laut' },
            { id: 'q10b', text: '7 meter di bawah laut' },
            { id: 'q10c', text: '7 meter di atas laut' },
            { id: 'q10d', text: '12 meter di bawah laut' },
          ],
          correctAnswerId: 'q10b',
        },
      ],
    },
  },

  // Material 2: Pecahan dan Desimal (3 pages, password protected)
  {
    id: 'page-2-1',
    materialId: 'mat-2',
    pageNumber: 1,
    type: 'Materi',
    blocks: [
      {
        id: 'b-2-1-1',
        type: 'text',
        textStyle: 'title',
        content: 'Bentuk Pecahan Biasa dan Campuran',
      },
      {
        id: 'b-2-1-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Pecahan dinyatakan dalam bentuk a/b dengan a sebagai pembilang dan b sebagai penyebut (b ≠ 0). Pecahan murni adalah pecahan yang pembilangnya lebih kecil dari penyebutnya, sedangkan pecahan campuran terdiri dari bilangan bulat dan pecahan murni.',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Bentuk pecahan campuran dari 17/5 adalah...',
      options: [
        { id: 'opt-21a', text: '2 3/5' },
        { id: 'opt-21b', text: '3 2/5' },
        { id: 'opt-21c', text: '3 1/5' },
        { id: 'opt-21d', text: '4 1/5' },
      ],
      correctAnswerId: 'opt-21b',
      delaySeconds: 8,
    },
  },
  {
    id: 'page-2-2',
    materialId: 'mat-2',
    pageNumber: 2,
    type: 'Materi',
    blocks: [
      {
        id: 'b-2-2-1',
        type: 'text',
        textStyle: 'title',
        content: 'Mengubah Pecahan ke Bentuk Desimal',
      },
      {
        id: 'b-2-2-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Untuk mengubah pecahan biasa ke bentuk desimal, kita dapat membagi pembilang dengan penyebut secara bersusun atau mengubah penyebut menjadi bilangan kelipatan 10 (10, 100, 1000).',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Bentuk desimal dari 3/8 adalah...',
      options: [
        { id: 'opt-22a', text: '0,35' },
        { id: 'opt-22b', text: '0,375' },
        { id: 'opt-22c', text: '0,38' },
        { id: 'opt-22d', text: '0,325' },
      ],
      correctAnswerId: 'opt-22b',
      delaySeconds: 10,
    },
  },
  {
    id: 'page-2-3',
    materialId: 'mat-2',
    pageNumber: 3,
    type: 'Materi',
    blocks: [
      {
        id: 'b-2-3-1',
        type: 'text',
        textStyle: 'title',
        content: 'Operasi Hitung Pecahan',
      },
      {
        id: 'b-2-3-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Pada penjumlahan dan pengurangan pecahan dengan penyebut berbeda, penyebut harus disamakan terlebih dahulu menggunakan KPK. Pada perkalian, kalikan pembilang dengan pembilang dan penyebut dengan penyebut.',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Hasil dari 2/3 + 1/4 adalah...',
      options: [
        { id: 'opt-23a', text: '3/7' },
        { id: 'opt-23b', text: '11/12' },
        { id: 'opt-23c', text: '9/12' },
        { id: 'opt-23d', text: '7/12' },
      ],
      correctAnswerId: 'opt-23b',
      delaySeconds: 8,
    },
  },

  // Material 3: Klasifikasi Makhluk Hidup (4 pages)
  {
    id: 'page-3-1',
    materialId: 'mat-3',
    pageNumber: 1,
    type: 'Materi',
    blocks: [
      {
        id: 'b-3-1-1',
        type: 'text',
        textStyle: 'title',
        content: 'Ciri-Ciri Makhluk Hidup',
      },
      {
        id: 'b-3-1-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Semua organisme hidup menunjukkan ciri-ciri khusus yang membedakannya dari benda mati, yaitu bernapas, bergerak, membutuhkan nutrisi, tumbuh dan berkembang, berkembang biak (reproduksi), peka terhadap rangsang (iritabilitas), mengeluarkan zat sisa (ekskresi), serta mampu beradaptasi dengan lingkungan.',
      },
      {
        id: 'b-3-1-3',
        type: 'image',
        imageSrc: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        imageSourceType: 'tautan',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Menutupnya daun putri malu ketika disentuh merupakan contoh ciri makhluk hidup...',
      options: [
        { id: 'opt-31a', text: 'Bernapas' },
        { id: 'opt-31b', text: 'Peka terhadap rangsang' },
        { id: 'opt-31c', text: 'Tumbuh dan berkembang' },
        { id: 'opt-31d', text: 'Memerlukan nutrisi' },
      ],
      correctAnswerId: 'opt-31b',
      delaySeconds: 5,
    },
  },
  {
    id: 'page-3-2',
    materialId: 'mat-3',
    pageNumber: 2,
    type: 'Materi',
    blocks: [
      {
        id: 'b-3-2-1',
        type: 'text',
        textStyle: 'title',
        content: 'Sistem Lima Kingdom',
      },
      {
        id: 'b-3-2-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Robert H. Whittaker mengusulkan klasifikasi makhluk hidup ke dalam lima kingdom: Monera (bakteri dan alga biru tanpa membran inti), Protista (organisme eukariotik sederhana), Fungi (jamur saprofit atau parasit), Plantae (tumbuhan berklorofil autotrof), dan Animalia (hewan multiseluler heterotrof).',
      },
      {
        id: 'b-3-2-3',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/F38BmgPcZ_I',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Kingdom yang beranggotakan organisme prokariotik (tidak memiliki membran inti sel) adalah...',
      options: [
        { id: 'opt-32a', text: 'Protista' },
        { id: 'opt-32b', text: 'Fungi' },
        { id: 'opt-32c', text: 'Monera' },
        { id: 'opt-32d', text: 'Plantae' },
      ],
      correctAnswerId: 'opt-32c',
      delaySeconds: 10,
    },
  },
  {
    id: 'page-3-3',
    materialId: 'mat-3',
    pageNumber: 3,
    type: 'Materi',
    blocks: [
      {
        id: 'b-3-3-1',
        type: 'text',
        textStyle: 'title',
        content: 'Tingkatan Takson dan Kunci Determinasi',
      },
      {
        id: 'b-3-3-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Urutan tingkatan takson dari yang tertinggi hingga terendah pada hewan adalah Kingdom, Filum, Kelas, Ordo, Famili, Genus, dan Spesies. Kunci determinasi format dikotom digunakan untuk mengidentifikasi nama atau kelompok organisme berdasarkan ciri morfologinya.',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Tingkatan takson tepat di bawah Kelas pada tumbuhan adalah...',
      options: [
        { id: 'opt-33a', text: 'Filum' },
        { id: 'opt-33b', text: 'Ordo (Bangsa)' },
        { id: 'opt-33c', text: 'Famili (Suku)' },
        { id: 'opt-33d', text: 'Genus (Marga)' },
      ],
      correctAnswerId: 'opt-33b',
      delaySeconds: 8,
    },
  },
  {
    id: 'page-3-4',
    materialId: 'mat-3',
    pageNumber: 4,
    type: 'KuisAkhir',
    blocks: [],
    kuisAkhir: {
      maxAttempts: 0,
      questions: [
        {
          id: 'q31',
          question: 'Tujuan utama klasifikasi makhluk hidup adalah...',
          options: [
            { id: 'a', text: 'Mempermudah mempelajari dan mengenali makhluk hidup' },
            { id: 'b', text: 'Menambah jumlah populasi makhluk hidup' },
            { id: 'c', text: 'Mengubah bentuk morfologi makhluk hidup' },
            { id: 'd', text: 'Memusnahkan spesies yang merugikan' },
          ],
          correctAnswerId: 'a',
        },
        {
          id: 'q32',
          question: 'Bakteri tergolong ke dalam kingdom...',
          options: [
            { id: 'a', text: 'Monera' },
            { id: 'b', text: 'Protista' },
            { id: 'c', text: 'Fungi' },
            { id: 'd', text: 'Animalia' },
          ],
          correctAnswerId: 'a',
        },
        {
          id: 'q33',
          question: 'Amoeba dan Paramecium tergolong ke dalam kingdom...',
          options: [
            { id: 'a', text: 'Monera' },
            { id: 'b', text: 'Protista' },
            { id: 'c', text: 'Plantae' },
            { id: 'd', text: 'Fungi' },
          ],
          correctAnswerId: 'b',
        },
        {
          id: 'q34',
          question: 'Urutan taksonomi dari yang paling luas ke paling spesifik adalah...',
          options: [
            { id: 'a', text: 'Kingdom - Filum - Kelas - Ordo - Famili - Genus - Spesies' },
            { id: 'b', text: 'Kingdom - Kelas - Filum - Famili - Ordo - Genus - Spesies' },
            { id: 'c', text: 'Spesies - Genus - Famili - Ordo - Kelas - Filum - Kingdom' },
            { id: 'd', text: 'Kingdom - Ordo - Filum - Kelas - Famili - Genus - Spesies' },
          ],
          correctAnswerId: 'a',
        },
        {
          id: 'q35',
          question: 'Nama ilmiah padi adalah Oryza sativa. Kata Oryza menunjukkan tingkatan...',
          options: [
            { id: 'a', text: 'Spesies' },
            { id: 'b', text: 'Genus' },
            { id: 'c', text: 'Famili' },
            { id: 'd', text: 'Ordo' },
          ],
          correctAnswerId: 'b',
        },
        {
          id: 'q36',
          question: 'Ciri khas organisme kingdom Fungi (jamur) adalah...',
          options: [
            { id: 'a', text: 'Memiliki klorofil dan bersifat autotrof' },
            { id: 'b', text: 'Eukariotik dan berdinding sel dari kitin' },
            { id: 'c', text: 'Prokariotik dan bergerak bebas' },
            { id: 'd', text: 'Dapat melakukan fotosintesis aktif' },
          ],
          correctAnswerId: 'b',
        },
        {
          id: 'q37',
          question: 'Organel tempat terjadinya sintesis makanan (fotosintesis) pada tumbuhan adalah...',
          options: [
            { id: 'a', text: 'Mitokondria' },
            { id: 'b', text: 'Kloroplas' },
            { id: 'c', text: 'Ribosom' },
            { id: 'd', text: 'Badan Golgi' },
          ],
          correctAnswerId: 'b',
        },
        {
          id: 'q38',
          question: 'Hewan yang tidak memiliki tulang belakang disebut...',
          options: [
            { id: 'a', text: 'Vertebrata' },
            { id: 'b', text: 'Invertebrata' },
            { id: 'c', text: 'Mamalia' },
            { id: 'd', text: 'Karnivora' },
          ],
          correctAnswerId: 'b',
        },
      ],
    },
  },

  // Material 4: Bahasa Indonesia Teks Deskripsi (Kelas VII)
  {
    id: 'page-4-1',
    materialId: 'mat-4',
    pageNumber: 1,
    type: 'Materi',
    blocks: [
      {
        id: 'b-4-1-1',
        type: 'text',
        textStyle: 'title',
        content: 'Pengertian dan Ciri Teks Deskripsi',
      },
      {
        id: 'b-4-1-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Teks deskripsi adalah teks yang melukiskan sesuatu sesuai dengan keadaan sebenarnya sehingga pembaca dapat melihat, mendengar, mencium, dan merasakan apa yang dilukiskan itu sesuai dengan citra penulisnya.',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Tujuan utama dari penulisan teks deskripsi adalah...',
      options: [
        { id: 'a', text: 'Mempengaruhi pembaca agar membeli produk' },
        { id: 'b', text: 'Menggambarkan objek secara rinci dan konkret' },
        { id: 'c', text: 'Menjelaskan langkah kerja suatu percobaan' },
        { id: 'd', text: 'Menceritakan alur cerita khayalan' },
      ],
      correctAnswerId: 'b',
      delaySeconds: 5,
    },
  },

  // Material 5: Bahasa Inggris Descriptive Text (Kelas VIII)
  {
    id: 'page-5-1',
    materialId: 'mat-5',
    pageNumber: 1,
    type: 'Materi',
    blocks: [
      {
        id: 'b-5-1-1',
        type: 'text',
        textStyle: 'title',
        content: 'Descriptive Text Structure',
      },
      {
        id: 'b-5-1-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'A descriptive text describes a particular person, place, or thing. The generic structure consists of Identification (introducing the object) and Description (describing parts, qualities, or characteristics).',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'What is the purpose of the Identification paragraph in descriptive text?',
      options: [
        { id: 'a', text: 'To conclude the story' },
        { id: 'b', text: 'To introduce the object to be described' },
        { id: 'c', text: 'To tell a past event in chronological order' },
        { id: 'd', text: 'To explain steps of an experiment' },
      ],
      correctAnswerId: 'b',
      delaySeconds: 5,
    },
  },

  // Material 6: IPS Keragaman Sosial Budaya (Kelas VIII)
  {
    id: 'page-6-1',
    materialId: 'mat-6',
    pageNumber: 1,
    type: 'Materi',
    blocks: [
      {
        id: 'b-6-1-1',
        type: 'text',
        textStyle: 'title',
        content: 'Faktor Keragaman Budaya Indonesia',
      },
      {
        id: 'b-6-1-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Keragaman budaya di Indonesia dipengaruhi oleh letak strategis di jalur pelayaran dunia, kondisi geografis kepulauan, perbedaan kondisi alam antarwilayah, serta keterbukaan masyarakat terhadap kebudayaan luar.',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Sikap yang tepat dalam menghadapi keragaman budaya adalah...',
      options: [
        { id: 'a', text: 'Etnosentrisme berlebihan' },
        { id: 'b', text: 'Toleransi dan saling menghormati' },
        { id: 'c', text: 'Menolak semua kebudayaan daerah lain' },
        { id: 'd', text: 'Menyeragamkan seluruh adat istiadat' },
      ],
      correctAnswerId: 'b',
      delaySeconds: 5,
    },
  },

  // Material 7: PPKn Norma dalam Kehidupan Bermasyarakat (Kelas IX)
  {
    id: 'page-7-1',
    materialId: 'mat-7',
    pageNumber: 1,
    type: 'Materi',
    blocks: [
      {
        id: 'b-7-1-1',
        type: 'text',
        textStyle: 'title',
        content: 'Macam-Macam Norma dalam Masyarakat',
      },
      {
        id: 'b-7-1-2',
        type: 'text',
        textStyle: 'paragraph',
        content: 'Norma adalah kaidah atau pedoman bertingkah laku. Ada empat norma utama dalam kehidupan bermasyarakat: norma agama, norma kesusilaan, norma kesopanan, dan norma hukum. Norma hukum bersifat tegas, mengikat, dan memiliki sanksi yang dipaksakan oleh aparat negara.',
      },
    ],
    ujiPemahaman: {
      enabled: true,
      question: 'Norma yang bersumber dari hati nurani manusia mengenai baik dan buruk adalah norma...',
      options: [
        { id: 'a', text: 'Hukum' },
        { id: 'b', text: 'Kesusilaan' },
        { id: 'c', text: 'Kesopanan' },
        { id: 'd', text: 'Kebiasaan' },
      ],
      correctAnswerId: 'b',
      delaySeconds: 5,
    },
  },
];

export const INITIAL_GRADES: GradeRecap[] = [
  {
    id: 'grd-1',
    nisn: '0123456701',
    nama: 'Ahmad Fauzi',
    kelas: 'VII A',
    subject: 'Matematika',
    materialId: 'mat-1',
    materialTitle: 'Bilangan Bulat dan Operasinya',
    ujiPemahamanScore: 100,
    kuisAkhirScore: 90,
    finalScore: 93,
    predicate: 'A',
    updatedAt: '2026-03-08T10:30:00Z',
  },
  {
    id: 'grd-2',
    nisn: '0123456701',
    nama: 'Ahmad Fauzi',
    kelas: 'VII A',
    subject: 'IPA',
    materialId: 'mat-3',
    materialTitle: 'Klasifikasi Makhluk Hidup',
    ujiPemahamanScore: 85,
    kuisAkhirScore: 87,
    finalScore: 86,
    predicate: 'B',
    updatedAt: '2026-03-09T11:00:00Z',
  },
  {
    id: 'grd-3',
    nisn: '0123456702',
    nama: 'Siti Aisyah',
    kelas: 'VII A',
    subject: 'Matematika',
    materialId: 'mat-1',
    materialTitle: 'Bilangan Bulat dan Operasinya',
    ujiPemahamanScore: 100,
    kuisAkhirScore: 95,
    finalScore: 97,
    predicate: 'A',
    updatedAt: '2026-03-08T14:15:00Z',
  },
  {
    id: 'grd-4',
    nisn: '0123456703',
    nama: 'Rizky Pratama',
    kelas: 'VII A',
    subject: 'Matematika',
    materialId: 'mat-1',
    materialTitle: 'Bilangan Bulat dan Operasinya',
    ujiPemahamanScore: 66,
    kuisAkhirScore: 60,
    finalScore: 62,
    predicate: 'D',
    updatedAt: '2026-03-08T16:00:00Z',
  },
  {
    id: 'grd-5',
    nisn: '0123456707',
    nama: 'Farhan Hidayat',
    kelas: 'VIII A',
    subject: 'Bahasa Inggris',
    materialId: 'mat-5',
    materialTitle: 'Descriptive Text',
    ujiPemahamanScore: 100,
    kuisAkhirScore: null,
    finalScore: 100,
    predicate: 'A',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'grd-6',
    nisn: '0123456710',
    nama: 'Putri Ramadhani',
    kelas: 'IX A',
    subject: 'PPKn',
    materialId: 'mat-7',
    materialTitle: 'Norma dalam Kehidupan Bermasyarakat',
    ujiPemahamanScore: 75,
    kuisAkhirScore: null,
    finalScore: 75,
    predicate: 'C',
    updatedAt: '2026-03-11T13:40:00Z',
  },
];

export const INITIAL_GRADE_SETTINGS: GradeSettings = {
  ujiWeight: 30,
  kuisWeight: 70,
  kkm: 75,
  predA: 90,
  predB: 80,
  predC: 70,
};

export const INITIAL_CMS_SETTINGS: CMSSettings = {
  identity: {
    appName: 'Modul Belajar Daring',
    institutionName: 'SMP NEGERI 1 BENGKALIS',
    shortName: 'SMPN 1 Bengkalis',
    logoUrl: 'https://i.ibb.co.com/nqfqhc29/kdu.png',
    logoSource: 'tautan',
    faviconUrl: 'https://i.ibb.co.com/nqfqhc29/kdu.png',
    copyrightText: '© SMP NEGERI 1 BENGKALIS',
    pageTitle: 'Modul Belajar Daring - SMP NEGERI 1 BENGKALIS',
    metaDescription: 'Media pembelajaran daring resmi SMP NEGERI 1 BENGKALIS.',
  },
  loginScreen: {
    welcomeTitle: 'Selamat Datang di Pembelajaran Daring',
    institutionDisplay: 'SMP NEGERI 1 BENGKALIS',
    welcomeSubtitle: 'Belajar kapan saja, di mana saja',
    passwordLabel: 'Kata Sandi',
    buttonLabel: 'Masuk',
    errorMessage: 'Kata sandi tidak sesuai',
    logoRotateEnabled: true,
    logoRotateSpeed: 6,
    bgType: 'gradasi',
    bgImageUrl: '',
  },
  theme: {
    primaryColor: '#0F766E',
    secondaryColor: '#134E4A',
    accentColor: '#2DD4BF',
    warmAccentColor: '#FBBF24',
    bgGradient1: '#042F2E',
    bgGradient2: '#0B4F4A',
    bgGradient3: '#0F766E',
    textPrimary: '#ECFEFF',
    textSecondary: '#A5D8D3',
    glassOpacity: 0.40,
    glassBlur: 18,
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: 20,
  },
  sidebarMenu: {
    labelMataPelajaran: 'Mata Pelajaran',
    labelRekapNilai: 'Rekap Nilai',
    labelKeluar: 'Keluar',
    labelBackSubject: 'Mata Pelajaran',
    showProfileCard: true,
    showProgressBar: true,
  },
  materialDisplay: {
    tabNormalColor: 'rgba(15, 118, 110, 0.40)',
    tabActiveColor: 'rgba(45, 212, 191, 0.55)',
    pagePaddingX: 8,
    bodyFontSize: 16,
    maxReadWidth: 820,
    showCompletedBadge: true,
    emptyStateText: 'Belum ada materi',
  },
  ujiAndKuis: {
    popupSuccessText: 'Kamu sudah menguasai materi ini',
    popupDuration: 1.8,
    defaultUjiDelay: 10,
    labelMundur: 'Mundur',
    labelLanjut: 'Lanjut',
    labelSelesai: 'Selesai',
    labelKembali: 'Kembali',
    labelSelesaikan: 'Selesaikan',
    textUnansweredConfirm: 'Masih ada soal yang belum dijawab',
    textQuizResult: 'Hasil Evaluasi Belajar',
    colorUnanswered: '#EF4444',
    colorAnswered: '#22C55E',
  },
  rekapNilaiDisplay: {
    pageTitle: 'Rekap Nilai',
    colSubject: 'Mata Pelajaran',
    colMaterial: 'Materi',
    colUji: 'Uji Pemahaman',
    colKuis: 'Kuis Akhir',
    colFinal: 'Nilai Akhir',
    colPredicate: 'Predikat',
    labelAvgFinal: 'Rata-rata Nilai Akhir',
    labelCompletedCount: 'Materi Tuntas',
    labelAttemptedCount: 'Materi Dikerjakan',
    showSummaryCards: true,
    showChart: true,
    colorPredA: '#34D399',
    colorPredB: '#2DD4BF',
    colorPredC: '#FBBF24',
    colorPredD: '#FB923C',
  },
  textsAndMessages: {
    errorLogin: 'Kata sandi tidak sesuai',
    countdownLogin: 'Tunggu',
    notifSaved: 'Berhasil disimpan',
    notifLinkCopied: 'Tautan disalin',
    emptyMaterial: 'Belum ada materi',
    notFound404: 'Halaman Tidak Ditemukan',
    offlineBadge: 'Offline',
    wrongGradeText: 'Materi ini bukan untuk kelas Anda',
    materialUnavailable: 'Materi tidak tersedia',
    passwordModalTitle: 'Kata Sandi Materi',
    passwordModalBtn: 'Buka',
    passwordModalError: 'Kata sandi materi salah',
    homeTitle: 'Mata Pelajaran',
    gradePrefix: 'Kelas',
  },
  features: {
    logoRotate: true,
    completedBadge: true,
    rememberLastMaterial: true,
    summaryCards: true,
    gradeChart: true,
  },
};

export const INITIAL_SYNC_CONFIG: SyncConfig = {
  webAppUrl: '',
  token: '',
  driveFolderId: '',
  spreadsheetId: '',
  tabSiswa: 'Siswa',
  tabRekapNilai: 'Rekap Nilai',
};
