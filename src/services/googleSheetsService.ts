import { Officer, ShiftBooking, SpecialHoliday, DepartmentConfig } from '../types';

export interface GoogleSheetsSyncData {
  officers: Officer[];
  bookings: ShiftBooking[];
  specialHolidays: SpecialHoliday[];
  department: DepartmentConfig;
}

/**
 * Default Google Apps Script Web App URL
 * สามารถแก้ไข URL นี้ได้ที่นี่โดยตรง หรือตั้งค่าผ่าน Environment Variable: VITE_GOOGLE_SHEETS_URL ใน Vercel / .env
 */
export const DEFAULT_GOOGLE_SHEETS_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_SHEETS_URL) ||
  'https://script.google.com/macros/s/AKfycbxtQY4Ph76iISECODSm07wH8ODr5A3re04CjFkXgTE3XBuQOkiqQVtLcY6-rQVm_-cu/exec';

/**
 * ฟังก์ชันแปลง Date string จาก Google Sheets ให้เป็น YYYY-MM-DD เสมอ
 */
export function normalizeSheetDate(dateVal: any): string {
  if (!dateVal) return '';
  const str = String(dateVal).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return str;
}

export const APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script สำหรับระบบจองเวรนอกเวลาราชการ
 * วางโค้ดนี้ใน Google Sheets > ส่วนขยาย (Extensions) > Apps Script
 * จากนั้นกด "การทำให้ใช้งานได้ (Deploy)" > "รายการใหม่ (New deployment)" > เลือก "เว็บแอป (Web app)"
 * กำหนด "ใครมีสิทธิ์เข้าถึง (Who has access)" เป็น "ทุกคน (Anyone)"
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // ดึงข้อมูลการจองเวร
    var bookingsSheet = getOrCreateSheet(ss, 'Bookings', ['officerId', 'date', 'hours', 'updatedAt']);
    var bookingsData = getSheetRowsAsJson(bookingsSheet);
    var bookings = bookingsData.map(function(r) {
      return { officerId: String(r.officerId), date: String(r.date), hours: Number(r.hours) };
    });

    // ดึงข้อมูลเจ้าหน้าที่
    var officersSheet = getOrCreateSheet(ss, 'Officers', ['id', 'name', 'position']);
    var officersData = getSheetRowsAsJson(officersSheet);
    var officers = officersData.map(function(r) {
      return { id: String(r.id), name: String(r.name), position: String(r.position) };
    });

    // ดึงข้อมูลวันหยุดพิเศษ
    var holidaysSheet = getOrCreateSheet(ss, 'Holidays', ['date', 'name']);
    var holidaysData = getSheetRowsAsJson(holidaysSheet);
    var specialHolidays = holidaysData.map(function(r) {
      return { date: String(r.date), name: String(r.name || 'วันหยุดพิเศษ') };
    });

    // ดึงข้อมูลส่วนราชการ
    var settingsSheet = getOrCreateSheet(ss, 'Settings', ['key', 'value']);
    var settingsData = getSheetRowsAsJson(settingsSheet);
    var dept = {};
    settingsData.forEach(function(r) {
      dept[r.key] = r.value;
    });

    var result = {
      status: 'success',
      data: {
        bookings: bookings,
        officers: officers.length > 0 ? officers : null,
        specialHolidays: specialHolidays,
        department: Object.keys(dept).length > 0 ? dept : null
      }
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'syncAll';

    if (action === 'syncAll' && payload.data) {
      var d = payload.data;

      // 1. บันทึกข้อมูลการจองเวร
      if (d.bookings) {
        var bSheet = getOrCreateSheet(ss, 'Bookings', ['officerId', 'date', 'hours', 'updatedAt']);
        bSheet.clearContents();
        bSheet.appendRow(['officerId', 'date', 'hours', 'updatedAt']);
        var bRows = d.bookings.map(function(b) {
          return [b.officerId, b.date, b.hours, new Date().toISOString()];
        });
        if (bRows.length > 0) {
          bSheet.getRange(2, 1, bRows.length, 4).setValues(bRows);
        }
      }

      // 2. บันทึกรายชื่อเจ้าหน้าที่
      if (d.officers) {
        var oSheet = getOrCreateSheet(ss, 'Officers', ['id', 'name', 'position']);
        oSheet.clearContents();
        oSheet.appendRow(['id', 'name', 'position']);
        var oRows = d.officers.map(function(o) {
          return [o.id, o.name, o.position];
        });
        if (oRows.length > 0) {
          oSheet.getRange(2, 1, oRows.length, 3).setValues(oRows);
        }
      }

      // 3. บันทึกวันหยุดพิเศษ
      if (d.specialHolidays) {
        var hSheet = getOrCreateSheet(ss, 'Holidays', ['date', 'name']);
        hSheet.clearContents();
        hSheet.appendRow(['date', 'name']);
        var hRows = d.specialHolidays.map(function(h) {
          return [h.date, h.name || 'วันหยุดพิเศษ'];
        });
        if (hRows.length > 0) {
          hSheet.getRange(2, 1, hRows.length, 2).setValues(hRows);
        }
      }

      // 4. บันทึกข้อมูลส่วนราชการ
      if (d.department) {
        var sSheet = getOrCreateSheet(ss, 'Settings', ['key', 'value']);
        sSheet.clearContents();
        sSheet.appendRow(['key', 'value']);
        var sRows = Object.keys(d.department).map(function(k) {
          return [k, d.department[k]];
        });
        if (sRows.length > 0) {
          sSheet.getRange(2, 1, sRows.length, 2).setValues(sRows);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data synced successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function getSheetRowsAsJson(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}
`;

/**
 * Test connectivity with Google Apps Script Web App
 */
export async function testGoogleSheetsConnection(scriptUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = scriptUrl.trim();
    if (!url.startsWith('https://script.google.com/macros/s/')) {
      return {
        success: false,
        message: 'URL ต้องขึ้นต้นด้วย https://script.google.com/macros/s/... ของ Google Apps Script',
      };
    }

    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!res.ok) {
      return { success: false, message: `เกิดข้อผิดพลาดในการเชื่อมต่อ (HTTP ${res.status})` };
    }

    const json = await res.json();
    if (json.status === 'success') {
      return { success: true, message: 'เชื่อมต่อ Google Sheets สำเร็จเรียบร้อย!' };
    } else {
      return { success: false, message: json.message || 'ส่งข้อมูลกลับมาไม่ถูกต้อง' };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อได้ (${err.message || 'ตรวจดูสิทธิ์การเข้าถึงว่าเป็น "ทุกคน/Anyone" หรือยัง'})`,
    };
  }
}

/**
 * Fetch all data from Google Sheets with date normalization
 */
export async function loadDataFromGoogleSheets(scriptUrl: string): Promise<{ success: boolean; data?: Partial<GoogleSheetsSyncData>; message: string }> {
  try {
    const url = scriptUrl.trim();
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!res.ok) {
      return { success: false, message: `HTTP Error: ${res.status}` };
    }

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      const data: Partial<GoogleSheetsSyncData> = {};

      if (json.data.officers && Array.isArray(json.data.officers)) {
        data.officers = json.data.officers;
      }

      if (json.data.bookings && Array.isArray(json.data.bookings)) {
        data.bookings = json.data.bookings.map((b: any) => ({
          officerId: String(b.officerId),
          date: normalizeSheetDate(b.date),
          hours: Number(b.hours),
        }));
      }

      if (json.data.specialHolidays && Array.isArray(json.data.specialHolidays)) {
        data.specialHolidays = json.data.specialHolidays.map((h: any) => ({
          date: normalizeSheetDate(h.date),
          name: String(h.name || 'วันหยุดพิเศษ'),
        }));
      }

      if (json.data.department && typeof json.data.department === 'object') {
        data.department = json.data.department;
      }

      return { success: true, data, message: 'โหลดข้อมูลจาก Google Sheets สำเร็จ' };
    } else {
      return { success: false, message: json.message || 'ข้อมูลใน Google Sheets ยังว่างเปล่าหรืออ่านไม่ได้' };
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล' };
  }
}

/**
 * Sync / Save all data to Google Sheets
 */
export async function syncDataToGoogleSheets(scriptUrl: string, syncData: GoogleSheetsSyncData): Promise<{ success: boolean; message: string }> {
  try {
    const url = scriptUrl.trim();
    // Use text/plain to avoid CORS preflight issues with Google Apps Script
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'syncAll',
        data: syncData,
      }),
    });

    const json = await res.json();
    if (json.status === 'success') {
      return { success: true, message: 'บันทึกข้อมูลขึ้น Google Sheets สำเร็จแล้ว' };
    } else {
      return { success: false, message: json.message || 'ไม่สามารถบันทึกลง Google Sheets ได้' };
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง Google Sheets' };
  }
}
