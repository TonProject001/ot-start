import React from 'react';
import { Calendar, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { THAI_MONTHS, getDaysInMonth, toBuddhistYear } from '../utils/shiftLogic';

interface Props {
  year: number;
  month: number;
  onChangeYearMonth: (year: number, month: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step2SelectMonth: React.FC<Props> = ({
  year,
  month,
  onChangeYearMonth,
  onPrev,
  onNext,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const buddhistYear = toBuddhistYear(year);

  // Calculate weekends in this month
  let weekendDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    }
  }
  const weekdaysCount = daysInMonth - weekendDays;

  // Year options around current selection (e.g. 2567 - 2572)
  const availableYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-2">
            <span>ขั้นตอนที่ 2 จาก 5</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            เลือกเดือนและปีที่ต้องการจองเวร
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            ระบุรอบประจำเดือนสำหรับจัดทำตารางหลักฐานการขออนุมัติขึ้นปฏิบัติงานนอกเวลาราชการ
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                เลือกเดือน
              </label>
              <select
                value={month}
                onChange={(e) => onChangeYearMonth(year, Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {THAI_MONTHS.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                เลือกปี พ.ศ. (ค.ศ.)
              </label>
              <select
                value={year}
                onChange={(e) => onChangeYearMonth(Number(e.target.value), month)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    พ.ศ. {toBuddhistYear(y)} (ค.ศ. {y})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 grid grid-cols-3 gap-3 text-center">
            <div className="p-2">
              <span className="text-xs text-slate-500 block mb-1">จำนวนวันทั้งหมด</span>
              <span className="text-2xl font-bold text-slate-800">{daysInMonth}</span>
              <span className="text-xs text-slate-400 block mt-0.5">วัน</span>
            </div>
            <div className="p-2 border-x border-slate-100">
              <span className="text-xs text-slate-500 block mb-1">วันธรรมดา (จ.-ศ.)</span>
              <span className="text-2xl font-bold text-blue-600">{weekdaysCount}</span>
              <span className="text-xs text-slate-400 block mt-0.5">วัน (50 บ./ชม.)</span>
            </div>
            <div className="p-2">
              <span className="text-xs text-slate-500 block mb-1">วันหยุดเสาร์-อาทิตย์</span>
              <span className="text-2xl font-bold text-amber-600">{weekendDays}</span>
              <span className="text-xs text-slate-400 block mt-0.5">วัน (60 บ./ชม.)</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              รอบที่เลือก: <strong className="text-slate-700">{THAI_MONTHS[month - 1]} พ.ศ. {buddhistYear}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ: เลือกชื่อผู้จอง</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>ขั้นตอนที่ 3: เพิ่มวันหยุดพิเศษ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
