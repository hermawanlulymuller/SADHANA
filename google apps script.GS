/**
 * SADHANA - Jembatan Google Apps Script <-> Google Sheet
 * ------------------------------------------------------
 * CARA PAKAI:
 * 1. Buat Google Sheet baru. Tambahkan 3 sheet (tab) dengan nama PERSIS:
 *      - Jadwal
 *      - PolaMakan
 *      - Aktivitas
 * 2. Di Google Sheet: Extensions > Apps Script.
 * 3. Hapus isi default, tempel seluruh isi file ini, simpan (Ctrl+S).
 * 4. Klik Deploy > New deployment > pilih tipe "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Klik Deploy, salin URL yang muncul (diakhiri /exec).
 * 6. Tempel URL itu ke tab "Sinkron" di aplikasi Sadhana.
 */

const SHEET_HEADERS = {
  Jadwal: ["id", "day", "time", "jenis", "durasi", "notes"],
  PolaMakan: ["id", "day", "slot", "time", "menu", "notes"],
  Aktivitas: ["id", "date", "jenis", "durasi", "energi", "notes"],
};

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS[name]);
  }
  return sheet;
}

function appendRow(sheetName, data) {
  const sheet = getOrCreateSheet(sheetName);
  const headers = SHEET_HEADERS[sheetName];
  const row = headers.map((h) => (data[h] !== undefined ? data[h] : ""));
  sheet.appendRow(row);
}

function replaceAll(sheetName, dataArray) {
  const sheet = getOrCreateSheet(sheetName);
  const headers = SHEET_HEADERS[sheetName];
  sheet.clearContents();
  sheet.appendRow(headers);
  dataArray.forEach((item) => {
    const row = headers.map((h) => (item[h] !== undefined ? item[h] : ""));
    sheet.appendRow(row);
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { sheet, action, data } = body;

    if (!SHEET_HEADERS[sheet]) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "Sheet tidak dikenal: " + sheet })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "append") {
      appendRow(sheet, data);
    } else if (action === "replace_all") {
      replaceAll(sheet, data);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: "Sadhana webhook aktif." })
  ).setMimeType(ContentService.MimeType.JSON);
}