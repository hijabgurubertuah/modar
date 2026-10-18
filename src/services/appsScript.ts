// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import { GradeRecap, Student, SyncConfig } from '../types';

export function generateAppsScriptCode(config: SyncConfig): string {
  return `/**
 * GOOGLE APPS SCRIPT - MODUL BELAJAR DARING
 * SMP NEGERI 1 BENGKALIS
 * 
 * Pengaturan:
 */
var SCRIPT_CONFIG = {
  TOKEN: "${config.token || 'KUNCI_TOKEN_RAHASIA_ADMIN_2026'}",
  SPREADSHEET_ID: "${config.spreadsheetId || ''}",
  DRIVE_FOLDER_ID: "${config.driveFolderId || ''}",
  TAB_SISWA: "${config.tabSiswa || 'Siswa'}",
  TAB_REKAP: "${config.tabRekapNilai || 'Rekap Nilai'}"
};

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  var res = { success: false };

  try {
    if (action === 'test') {
      var token = e.parameter.token || '';
      if (token !== SCRIPT_CONFIG.TOKEN) {
        return jsonResponse({ success: false, error: 'Unauthorized' });
      }
      return jsonResponse({ success: true, message: 'Connected' });
    }

    if (action === 'verifyNisn') {
      var nisn = (e.parameter.nisn || '').trim();
      var student = findStudentByNisn(nisn);
      if (student) {
        return jsonResponse({ success: true, data: { nama: student.nama, kelas: student.kelas } });
      }
      return jsonResponse({ success: false, error: 'Not found' });
    }

    if (action === 'getStudentGrades') {
      var studentNisn = (e.parameter.nisn || '').trim();
      var grades = getGradesForStudent(studentNisn);
      return jsonResponse({ success: true, data: grades });
    }

    if (action === 'getDriveFile') {
      var fileId = e.parameter.fileId;
      var file = DriveApp.getFileById(fileId);
      var blob = file.getBlob();
      var base64 = Utilities.base64Encode(blob.getBytes());
      return jsonResponse({ success: true, mimeType: blob.getContentType(), base64: base64 });
    }

    // Admin-only endpoints require Token
    var adminToken = e.parameter.token || '';
    if (adminToken !== SCRIPT_CONFIG.TOKEN) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    if (action === 'getStudents') {
      return jsonResponse({ success: true, data: getAllStudents() });
    }

    if (action === 'getAllGrades') {
      return jsonResponse({ success: true, data: getAllGradesRecap() });
    }

    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  var res = { success: false };
  try {
    var rawData = e.postData ? e.postData.contents : '';
    var payload = rawData ? JSON.parse(rawData) : {};
    var action = payload.action || '';

    // Student save grade: verified by NISN
    if (action === 'saveGrade') {
      var gradeItem = payload.grade;
      if (!gradeItem || !gradeItem.nisn) {
        return jsonResponse({ success: false, error: 'Invalid payload' });
      }
      saveOrUpdateGrade(gradeItem);
      return jsonResponse({ success: true });
    }

    // Admin endpoints require token
    if (payload.token !== SCRIPT_CONFIG.TOKEN) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    if (action === 'addStudent') {
      addStudentRow(payload.student);
      return jsonResponse({ success: true });
    }

    if (action === 'updateStudent') {
      updateStudentRow(payload.student);
      return jsonResponse({ success: true });
    }

    if (action === 'deleteStudent') {
      deleteStudentRow(payload.nisn);
      return jsonResponse({ success: true });
    }

    if (action === 'importStudents') {
      importStudentsBatch(payload.students || []);
      return jsonResponse({ success: true });
    }

    if (action === 'uploadFile') {
      var fileData = uploadToDrive(payload.filename, payload.mimeType, payload.base64);
      return jsonResponse({ success: true, data: fileData });
    }

    if (action === 'deleteFile') {
      deleteFromDrive(payload.fileId);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  if (SCRIPT_CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SCRIPT_CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(sheetName, headers) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function findStudentByNisn(targetNisn) {
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_SISWA, ['Nama', 'NISN', 'Kelas']);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  
  var target = targetNisn.toString().toLowerCase().trim();
  for (var i = 1; i < data.length; i++) {
    var rowNisn = (data[i][1] || '').toString().toLowerCase().trim();
    if (rowNisn === target) {
      return { nama: data[i][0], nisn: data[i][1], kelas: data[i][2] };
    }
  }
  return null;
}

function getAllStudents() {
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_SISWA, ['Nama', 'NISN', 'Kelas']);
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][1]) {
      list.push({
        id: 'std-' + (i),
        nama: (data[i][0] || '').toString(),
        nisn: (data[i][1] || '').toString(),
        kelas: (data[i][2] || '').toString()
      });
    }
  }
  return list;
}

function addStudentRow(student) {
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_SISWA, ['Nama', 'NISN', 'Kelas']);
  sheet.appendRow([student.nama, student.nisn, student.kelas]);
}

function updateStudentRow(student) {
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_SISWA, ['Nama', 'NISN', 'Kelas']);
  var data = sheet.getDataRange().getValues();
  var target = student.nisn.toString().toLowerCase().trim();
  for (var i = 1; i < data.length; i++) {
    if ((data[i][1] || '').toString().toLowerCase().trim() === target) {
      sheet.getRange(i + 1, 1).setValue(student.nama);
      sheet.getRange(i + 1, 3).setValue(student.kelas);
      return;
    }
  }
}

function deleteStudentRow(nisn) {
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_SISWA, ['Nama', 'NISN', 'Kelas']);
  var data = sheet.getDataRange().getValues();
  var target = nisn.toString().toLowerCase().trim();
  for (var i = 1; i < data.length; i++) {
    if ((data[i][1] || '').toString().toLowerCase().trim() === target) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function importStudentsBatch(students) {
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_SISWA, ['Nama', 'NISN', 'Kelas']);
  for (var i = 0; i < students.length; i++) {
    var s = students[i];
    if (s.nisn) {
      sheet.appendRow([s.nama, s.nisn, s.kelas]);
    }
  }
}

function getGradesForStudent(studentNisn) {
  var headers = ['NISN', 'Nama', 'Kelas', 'Mata Pelajaran', 'ID Materi', 'Materi', 'Uji Pemahaman', 'Kuis Akhir', 'Nilai Akhir', 'Predikat', 'Halaman Selesai', 'Diperbarui'];
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_REKAP, headers);
  var data = sheet.getDataRange().getValues();
  var list = [];
  var target = studentNisn.toString().toLowerCase().trim();
  for (var i = 1; i < data.length; i++) {
    var rowNisn = (data[i][0] || '').toString().toLowerCase().trim();
    if (rowNisn === target) {
      list.push({
        id: 'grd-' + i,
        nisn: data[i][0],
        nama: data[i][1],
        kelas: data[i][2],
        subject: data[i][3],
        materialId: data[i][4],
        materialTitle: data[i][5],
        ujiPemahamanScore: data[i][6] === '' ? null : Number(data[i][6]),
        kuisAkhirScore: data[i][7] === '' ? null : Number(data[i][7]),
        finalScore: data[i][8] === '' ? null : Number(data[i][8]),
        predicate: data[i][9] || '',
        completedPages: data[i][10] === '' ? 1 : Number(data[i][10]),
        updatedAt: data[i][11] || ''
      });
    }
  }
  return list;
}

function getAllGradesRecap() {
  var headers = ['NISN', 'Nama', 'Kelas', 'Mata Pelajaran', 'ID Materi', 'Materi', 'Uji Pemahaman', 'Kuis Akhir', 'Nilai Akhir', 'Predikat', 'Halaman Selesai', 'Diperbarui'];
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_REKAP, headers);
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      list.push({
        id: 'grd-' + i,
        nisn: data[i][0],
        nama: data[i][1],
        kelas: data[i][2],
        subject: data[i][3],
        materialId: data[i][4],
        materialTitle: data[i][5],
        ujiPemahamanScore: data[i][6] === '' ? null : Number(data[i][6]),
        kuisAkhirScore: data[i][7] === '' ? null : Number(data[i][7]),
        finalScore: data[i][8] === '' ? null : Number(data[i][8]),
        predicate: data[i][9] || '',
        completedPages: data[i][10] === '' ? 1 : Number(data[i][10]),
        updatedAt: data[i][11] || ''
      });
    }
  }
  return list;
}

function saveOrUpdateGrade(grade) {
  var headers = ['NISN', 'Nama', 'Kelas', 'Mata Pelajaran', 'ID Materi', 'Materi', 'Uji Pemahaman', 'Kuis Akhir', 'Nilai Akhir', 'Predikat', 'Halaman Selesai', 'Diperbarui'];
  var sheet = getOrCreateSheet(SCRIPT_CONFIG.TAB_REKAP, headers);
  var data = sheet.getDataRange().getValues();
  
  var targetNisn = (grade.nisn || '').toString().toLowerCase().trim();
  var targetMatId = (grade.materialId || '').toString();

  for (var i = 1; i < data.length; i++) {
    var rowNisn = (data[i][0] || '').toString().toLowerCase().trim();
    var rowMatId = (data[i][4] || '').toString();
    if (rowNisn === targetNisn && rowMatId === targetMatId) {
      var prevFinal = Number(data[i][8]) || 0;
      var newFinal = Number(grade.finalScore) || 0;
      if (newFinal >= prevFinal) {
        sheet.getRange(i + 1, 7).setValue(grade.ujiPemahamanScore != null ? grade.ujiPemahamanScore : '');
        sheet.getRange(i + 1, 8).setValue(grade.kuisAkhirScore != null ? grade.kuisAkhirScore : '');
        sheet.getRange(i + 1, 9).setValue(grade.finalScore != null ? grade.finalScore : '');
        sheet.getRange(i + 1, 10).setValue(grade.predicate || '');
      }
      var prevPages = Number(data[i][10]) || 1;
      var newPages = Number(grade.completedPages) || 1;
      var maxPages = Math.max(prevPages, newPages);
      sheet.getRange(i + 1, 11).setValue(maxPages);
      sheet.getRange(i + 1, 12).setValue(grade.updatedAt || new Date().toISOString());
      return;
    }
  }

  // Append new row
  sheet.appendRow([
    grade.nisn,
    grade.nama,
    grade.kelas,
    grade.subject,
    grade.materialId,
    grade.materialTitle,
    grade.ujiPemahamanScore != null ? grade.ujiPemahamanScore : '',
    grade.kuisAkhirScore != null ? grade.kuisAkhirScore : '',
    grade.finalScore != null ? grade.finalScore : '',
    grade.predicate || '',
    grade.completedPages || 1,
    grade.updatedAt || new Date().toISOString()
  ]);
}

function uploadToDrive(filename, mimeType, base64) {
  var folder;
  if (SCRIPT_CONFIG.DRIVE_FOLDER_ID) {
    folder = DriveApp.getFolderById(SCRIPT_CONFIG.DRIVE_FOLDER_ID);
  } else {
    folder = DriveApp.getRootFolder();
  }
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, filename);
  var file = folder.createFile(blob);
  return { fileId: file.getId(), url: file.getUrl() };
}

function deleteFromDrive(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
  } catch (e) {
    // ignore
  }
}
`;
}

// Client API Methods
export async function verifyStudentNisnApi(webAppUrl: string, nisn: string): Promise<{ nama: string; kelas: string } | null> {
  if (!webAppUrl) return null;
  try {
    const url = `${webAppUrl}?action=verifyNisn&nisn=${encodeURIComponent(nisn)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchStudentGradesApi(webAppUrl: string, nisn: string): Promise<GradeRecap[] | null> {
  if (!webAppUrl) return null;
  try {
    const url = `${webAppUrl}?action=getStudentGrades&nisn=${encodeURIComponent(nisn)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function sendGradeRecapApi(webAppUrl: string, grade: Partial<GradeRecap>): Promise<boolean> {
  if (!webAppUrl) return false;
  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'saveGrade', grade }),
    });
    const json = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}

export async function testConnectionApi(webAppUrl: string, token: string): Promise<boolean> {
  if (!webAppUrl) return false;
  try {
    const url = `${webAppUrl}?action=test&token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const json = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}

export async function fetchStudentsFromSheetApi(webAppUrl: string, token: string): Promise<Student[] | null> {
  if (!webAppUrl) return null;
  try {
    const url = `${webAppUrl}?action=getStudents&token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchAllGradesFromSheetApi(webAppUrl: string, token: string): Promise<GradeRecap[] | null> {
  if (!webAppUrl) return null;
  try {
    const url = `${webAppUrl}?action=getAllGrades&token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}
