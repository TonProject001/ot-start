import React from 'react';
import { Officer, DepartmentConfig } from '../types';
import {
  FileSpreadsheet,
  Printer,
  FileText,
  RotateCcw,
  Calendar,
  User,
  Database,
  CloudCheck,
  Cloud
} from 'lucide-react';
import { THAI_MONTHS, toBuddhistYear } from '../utils/shiftLogic';

interface Props {
  currentStep: number;
  onSetStep: (step: number) => void;
  officers: Officer[];
  activeOfficerId: string;
  year: number;
  month: number;
  department: DepartmentConfig;
  onOpenSavedRecords: () => void;
  onOpenSettings: () => void;
  onOpenGoogleSheets: () => void;
  isGoogleSheetsConnected: boolean;
  onResetToDemoData: () => void;
  onPrint: () => void;
}

export const Header: React.FC<Props> = ({
  currentStep,
  onSetStep,
  officers,
  activeOfficerId,
  year,
  month,
  department,
  onOpenSavedRecords,
  onOpenSettings,
  onOpenGoogleSheets,
  isGoogleSheetsConnected,
  onResetToDemoData,
  onPrint,
}) => {
  const activeOfficer = officers.find((o) => o.id === activeOfficerId);
  const buddhistYear = toBuddhistYear(year);

  const steps = [
    { number: 1, label: '1. เลือกชื่อผู้จอง' },
    { number: 2, label: '2. เลือกเดือน' },
    { number: 3, label: '3. วันหยุดพิเศษ' },
    { number: 4, label: '4. ปฏิทินจองเวร' },
    { number: 5, label: '5. ตารางขออนุมัติฯ (4 ท่าน)' },
    { number: 6, label: '6. ตารางเบิกจ่ายฯ (5 ท่าน)' },
  ];

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-3.5 gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  ระบบจองเวรนอกเวลาราชการ
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full">
                  แบบฟอร์ม A4 แนวนอน
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {department.agencyName} • {department.divisionName}
              </p>
            </div>
          </div>

          {/* Quick Info & Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeOfficer ? activeOfficer.name : 'ยังไม่เลือก'}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {THAI_MONTHS[month - 1]} {buddhistYear}
                </span>
              </div>
            </div>

            {/* Google Sheets Cloud DB button */}
            <button
              onClick={onOpenGoogleSheets}
              title="เชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Apps Script"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isGoogleSheetsConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>Google Sheets</span>
              {isGoogleSheetsConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={onResetToDemoData}
              title="ดึงข้อมูลตัวอย่างตามภาพจริง 6 คน รวม 16,400 บาท"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>โหลดข้อมูลตามภาพ</span>
            </button>

            <button
              onClick={onOpenSavedRecords}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>ข้อมูลที่บันทึกไว้</span>
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ A4</span>
            </button>
          </div>
        </div>

        {/* Step Navigation Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
          {steps.map((s) => {
            const isActive = currentStep === s.number;
            const isCompleted = currentStep > s.number;

            return (
              <button
                key={s.number}
                onClick={() => onSetStep(s.number)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
