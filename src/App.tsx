/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Officer, SpecialHoliday, ShiftBooking, DepartmentConfig } from './types';
import {
  INITIAL_OFFICERS,
  INITIAL_BOOKINGS,
  INITIAL_SPECIAL_HOLIDAYS,
  INITIAL_DEPARTMENT,
} from './data/initialData';
import { Header } from './components/Header';
import { Step1SelectOfficer } from './components/Step1SelectOfficer';
import { Step2SelectMonth } from './components/Step2SelectMonth';
import { Step3SpecialHolidays } from './components/Step3SpecialHolidays';
import { Step4CalendarBooking } from './components/Step4CalendarBooking';
import { OfficialRosterTable } from './components/OfficialRosterTable';
import { SavedRecordsModal } from './components/SavedRecordsModal';
import { DepartmentSettingsModal } from './components/DepartmentSettingsModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import {
  syncDataToGoogleSheets,
  loadDataFromGoogleSheets,
  DEFAULT_GOOGLE_SHEETS_URL,
  GoogleSheetsSyncData
} from './services/googleSheetsService';
import { CheckCircle, Eye } from 'lucide-react';

const STORAGE_KEY_OFFICERS = 'ot_roster_officers_v1';
const STORAGE_KEY_BOOKINGS = 'ot_roster_bookings_v1';
const STORAGE_KEY_HOLIDAYS = 'ot_roster_holidays_v1';
const STORAGE_KEY_DEPT = 'ot_roster_dept_v1';
const STORAGE_KEY_YEAR = 'ot_roster_year_v1';
const STORAGE_KEY_MONTH = 'ot_roster_month_v1';
const STORAGE_KEY_ACTIVE_OFFICER = 'ot_roster_active_officer_v1';
const STORAGE_KEY_GSHEETS_URL = 'ot_roster_gsheets_url_v1';
const STORAGE_KEY_LAST_SYNCED = 'ot_roster_last_synced_v1';

export default function App() {
  // Load state from localStorage or initial seed
  const [officers, setOfficers] = useState<Officer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OFFICERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse officers', e);
      }
    }
    return INITIAL_OFFICERS;
  });

  const [activeOfficerId, setActiveOfficerId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_OFFICER);
    if (saved) return saved;
    return INITIAL_OFFICERS[0]?.id || '';
  });

  const [year, setYear] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_YEAR);
    return saved ? Number(saved) : 2026;
  });

  const [month, setMonth] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MONTH);
    return saved ? Number(saved) : 10;
  });

  const [specialHolidays, setSpecialHolidays] = useState<SpecialHoliday[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HOLIDAYS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse holidays', e);
      }
    }
    return INITIAL_SPECIAL_HOLIDAYS;
  });

  const [bookings, setBookings] = useState<ShiftBooking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bookings', e);
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [department, setDepartment] = useState<DepartmentConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DEPT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_DEPARTMENT, ...parsed };
      } catch (e) {
        console.error('Failed to parse dept', e);
      }
    }
    return INITIAL_DEPARTMENT;
  });

  // Google Sheets Apps Script Integration State (Default to User URL or Vercel env)
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_GSHEETS_URL) || DEFAULT_GOOGLE_SHEETS_URL;
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_SYNCED);
  });
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false);

  // Navigation step (1..5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Modals
  const [showSavedRecords, setShowSavedRecords] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show quick toast notification
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OFFICERS, JSON.stringify(officers));
  }, [officers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_OFFICER, activeOfficerId);
  }, [activeOfficerId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_YEAR, String(year));
  }, [year]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MONTH, String(month));
  }, [month]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HOLIDAYS, JSON.stringify(specialHolidays));
  }, [specialHolidays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEPT, JSON.stringify(department));
  }, [department]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GSHEETS_URL, googleSheetsUrl);
  }, [googleSheetsUrl]);

  // Google Sheets Sync Functions
  const handleSyncToGoogleSheets = useCallback(async () => {
    if (!googleSheetsUrl.trim()) {
      setShowGoogleSheetsModal(true);
      return;
    }
    setIsSyncingSheets(true);
    const syncPayload: GoogleSheetsSyncData = {
      officers,
      bookings,
      specialHolidays,
      department,
    };
    const res = await syncDataToGoogleSheets(googleSheetsUrl, syncPayload);
    setIsSyncingSheets(false);
    if (res.success) {
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(nowStr);
      localStorage.setItem(STORAGE_KEY_LAST_SYNCED, nowStr);
      notify('ซิงค์ข้อมูลขึ้น Google Sheets สำเร็จเรียบร้อย');
    } else {
      notify(`เกิดข้อผิดพลาดในการซิงค์: ${res.message}`);
    }
  }, [googleSheetsUrl, officers, bookings, specialHolidays, department]);

  const handleLoadFromGoogleSheets = useCallback(async () => {
    if (!googleSheetsUrl.trim()) return;
    setIsSyncingSheets(true);
    const res = await loadDataFromGoogleSheets(googleSheetsUrl);
    setIsSyncingSheets(false);
    if (res.success && res.data) {
      if (res.data.officers && res.data.officers.length > 0) {
        setOfficers(res.data.officers);
      }
      if (res.data.bookings) {
        setBookings(res.data.bookings);
      }
      if (res.data.specialHolidays) {
        setSpecialHolidays(res.data.specialHolidays);
      }
      if (res.data.department) {
        setDepartment((prev) => ({ ...prev, ...res.data!.department }));
      }
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(nowStr);
      localStorage.setItem(STORAGE_KEY_LAST_SYNCED, nowStr);
      notify('โหลดข้อมูลจาก Google Sheets สำเร็จ');
    } else {
      notify(res.message);
    }
  }, [googleSheetsUrl]);

  // Officer Handlers
  const handleAddOfficer = (name: string, position: string) => {
    const newOfficer: Officer = {
      id: `officer_${Date.now()}`,
      name,
      position,
    };
    setOfficers((prev) => [...prev, newOfficer]);
    setActiveOfficerId(newOfficer.id);
    notify(`เพิ่มคุณ ${name} สำเร็จและเลือกเป็นผู้ใช้งานปัจจุบันแล้ว`);
  };

  const handleUpdateOfficer = (id: string, name: string, position: string) => {
    setOfficers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, name, position } : o))
    );
    notify('อัปเดตข้อมูลผู้ปฏิบัติงานเรียบร้อย');
  };

  const handleDeleteOfficer = (id: string) => {
    setOfficers((prev) => prev.filter((o) => o.id !== id));
    setBookings((prev) => prev.filter((b) => b.officerId !== id));
    if (activeOfficerId === id) {
      const remaining = officers.filter((o) => o.id !== id);
      if (remaining.length > 0) {
        setActiveOfficerId(remaining[0].id);
      }
    }
    notify('ลบข้อมูลผู้ปฏิบัติงานแล้ว');
  };

  // Month & Year Handlers
  const handleChangeYearMonth = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  // Special Holiday Handlers
  const handleAddHoliday = (date: string, name: string) => {
    setSpecialHolidays((prev) => {
      const existing = prev.filter((h) => h.date !== date);
      return [...existing, { date, name }];
    });
    notify(`บันทึกวันหยุดพิเศษ: ${date}`);
  };

  const handleRemoveHoliday = (date: string) => {
    setSpecialHolidays((prev) => prev.filter((h) => h.date !== date));
    notify('ลบวันหยุดพิเศษแล้ว');
  };

  // Booking Handlers
  const handleSaveBookings = (newBookings: ShiftBooking[]) => {
    setBookings((prev) => {
      const newDates = new Set(newBookings.map((nb) => `${nb.officerId}_${nb.date}`));
      const filtered = prev.filter((b) => !newDates.has(`${b.officerId}_${b.date}`));
      return [...filtered, ...newBookings];
    });
    notify(`บันทึกการจองเวร ${newBookings.length} วัน เรียบร้อยแล้ว`);
  };

  const handleRemoveBookingsForDates = (officerId: string, dates: string[]) => {
    const dateSet = new Set(dates);
    setBookings((prev) =>
      prev.filter((b) => !(b.officerId === officerId && dateSet.has(b.date)))
    );
    notify(`ยกเลิกเวร ${dates.length} วัน เรียบร้อยแล้ว`);
  };

  const handleDeleteSingleBooking = (officerId: string, date: string) => {
    setBookings((prev) =>
      prev.filter((b) => !(b.officerId === officerId && b.date === date))
    );
    notify('ลบรายการเวรเรียบร้อย');
  };

  const handleClearAllBookings = () => {
    if (window.confirm('คุณต้องการลบข้อมูลการจองเวรทั้งหมดในระบบใช่หรือไม่?')) {
      setBookings([]);
      notify('ล้างข้อมูลการจองเวรทั้งหมดแล้ว');
    }
  };

  // Reset to original Reference PDF Document Data (15,800 บาท)
  const handleResetToDemoData = () => {
    if (
      window.confirm(
        'ต้องการรีเซ็ตข้อมูลกลับเป็นตัวอย่างตามแบบฟอร์มทางการ (6 ท่าน, ตุลาคม 2569, รวม 15,800 บาท) ใช่หรือไม่?'
      )
    ) {
      setOfficers(INITIAL_OFFICERS);
      setBookings(INITIAL_BOOKINGS);
      setSpecialHolidays(INITIAL_SPECIAL_HOLIDAYS);
      setDepartment(INITIAL_DEPARTMENT);
      setYear(2026);
      setMonth(10);
      setActiveOfficerId(INITIAL_OFFICERS[0].id);
      setCurrentStep(5);
      notify('โหลดข้อมูลตัวอย่างตามแบบฟอร์มทางการเรียบร้อยแล้ว');
    }
  };

  const currentOfficer =
    officers.find((o) => o.id === activeOfficerId) || officers[0] || {
      id: 'default',
      name: 'ผู้ปฏิบัติงาน',
      position: 'เจ้าหน้าที่',
    };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Sarabun',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentStep={currentStep}
        onSetStep={setCurrentStep}
        officers={officers}
        activeOfficerId={activeOfficerId}
        year={year}
        month={month}
        department={department}
        onOpenSavedRecords={() => setShowSavedRecords(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
        isGoogleSheetsConnected={!!googleSheetsUrl}
        onResetToDemoData={handleResetToDemoData}
        onPrint={() => window.print()}
      />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step 1: Select Officer */}
        {currentStep === 1 && (
          <Step1SelectOfficer
            officers={officers}
            selectedOfficerId={activeOfficerId}
            onSelectOfficer={(id) => setActiveOfficerId(id)}
            onAddOfficer={handleAddOfficer}
            onUpdateOfficer={handleUpdateOfficer}
            onDeleteOfficer={handleDeleteOfficer}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* Step 2: Select Month & Year */}
        {currentStep === 2 && (
          <Step2SelectMonth
            year={year}
            month={month}
            onChangeYearMonth={handleChangeYearMonth}
            onPrev={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {/* Step 3: Special Holidays (Click to toggle date only) */}
        {currentStep === 3 && (
          <Step3SpecialHolidays
            year={year}
            month={month}
            specialHolidays={specialHolidays}
            onAddHoliday={handleAddHoliday}
            onRemoveHoliday={handleRemoveHoliday}
            onPrev={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {/* Step 4: Calendar Multi-Date Booking */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Step4CalendarBooking
              year={year}
              month={month}
              officer={currentOfficer}
              bookings={bookings}
              specialHolidays={specialHolidays}
              onSaveBookings={handleSaveBookings}
              onRemoveBookingsForDates={handleRemoveBookingsForDates}
              onPrev={() => setCurrentStep(3)}
              onNext={() => setCurrentStep(5)}
            />

            {/* Quick Preview of the Personal Roster Table beneath Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    ตัวอย่างตารางการจองของตนเอง ({currentOfficer.name})
                  </h3>
                </div>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  เปิดตารางฉบับเต็มทั้งหมด (A4) →
                </button>
              </div>

              <OfficialRosterTable
                year={year}
                month={month}
                officers={[currentOfficer]}
                activeOfficerId={activeOfficerId}
                bookings={bookings}
                specialHolidays={specialHolidays}
                department={department}
                onOpenSettings={() => setShowSettings(true)}
                onSelectOfficer={(id) => setActiveOfficerId(id)}
              />
            </div>
          </div>
        )}

        {/* Step 5: Official Master Roster Table (Full Government A4 View) */}
        {currentStep === 5 && (
          <OfficialRosterTable
            year={year}
            month={month}
            officers={officers}
            activeOfficerId={activeOfficerId}
            bookings={bookings}
            specialHolidays={specialHolidays}
            department={department}
            onOpenSettings={() => setShowSettings(true)}
            onSelectOfficer={(id) => setActiveOfficerId(id)}
          />
        )}
      </main>

      {/* Modals */}
      <SavedRecordsModal
        isOpen={showSavedRecords}
        onClose={() => setShowSavedRecords(false)}
        bookings={bookings}
        officers={officers}
        specialHolidays={specialHolidays}
        onDeleteBooking={handleDeleteSingleBooking}
        onClearAllBookings={handleClearAllBookings}
      />

      <DepartmentSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={department}
        onSave={(newDept) => {
          setDepartment(newDept);
          notify('บันทึกข้อมูลส่วนราชการและผู้มีอำนาจลงนามแล้ว');
        }}
      />

      <GoogleSheetsModal
        isOpen={showGoogleSheetsModal}
        onClose={() => setShowGoogleSheetsModal(false)}
        scriptUrl={googleSheetsUrl}
        onSaveScriptUrl={(url) => {
          setGoogleSheetsUrl(url);
          notify('บันทึก URL ของ Google Apps Script เรียบร้อยแล้ว');
        }}
        onSyncNow={handleSyncToGoogleSheets}
        onLoadFromCloud={handleLoadFromGoogleSheets}
        isSyncing={isSyncingSheets}
        lastSyncedAt={lastSyncedAt}
      />
    </div>
  );
}
