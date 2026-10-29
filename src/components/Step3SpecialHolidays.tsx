import React from 'react';
import { SpecialHoliday } from '../types';
import {
  CalendarOff,
  ArrowLeft,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  THAI_MONTHS,
  getDaysInMonth,
  toBuddhistYear,
  isWeekend
} from '../utils/shiftLogic';

interface Props {
  year: number;
  month: number;
  specialHolidays: SpecialHoliday[];
  onAddHoliday: (date: string, name: string) => void;
  onRemoveHoliday: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step3SpecialHolidays: React.FC<Props> = ({
  year,
  month,
  specialHolidays,
  onAddHoliday,
  onRemoveHoliday,
  onPrev,
  onNext,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = String(month).padStart(2, '0');
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun..6=Sat

  // Check if a specific date is marked as special holiday
  const isDateSpecialHoliday = (day: number) => {
    const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
    return specialHolidays.some((h) => h.date === dateStr);
  };

  // Toggle holiday on/off by clicking the date
  const handleToggleDay = (day: number) => {
    const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
    if (isDateSpecialHoliday(day)) {
      onRemoveHoliday(dateStr);
    } else {
      // No name required as requested: simply save as holiday date!
      onAddHoliday(dateStr, `วันหยุดพิเศษ (วันที่ ${day})`);
    }
  };

  // Count active special holidays in this month
  const currentMonthSpecialHolidays = specialHolidays.filter((h) =>
    h.date.startsWith(`${year}-${monthStr}`)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full mb-2">
            <span>ขั้นตอนที่ 3 จาก 5 (เลือกได้ หรือกดข้าม)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarOff className="w-6 h-6 text-amber-600" />
            เลือกวันหยุดพิเศษประจำเดือน {THAI_MONTHS[month - 1]} พ.ศ. {toBuddhistYear(year)}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            เพียงคลิกเลือกวันที่ต้องการกำหนดเป็นวันหยุดพิเศษ (ไม่ต้องกรอกชื่อวันหยุด)
          </p>
        </div>

        {/* Skip button as requested */}
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-300 shadow-sm"
        >
          <SkipForward className="w-4 h-4 text-slate-500" />
          <span>ไม่มีวันหยุดพิเศษ (กดข้าม)</span>
        </button>
      </div>

      {/* Main Selection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Quick Date Selection Grid */}
        <div className="lg:col-span-8">
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                คลิกเลือกวันที่ต้องการให้เป็นวันหยุดพิเศษในปฏิทิน:
              </span>
              <span className="text-slate-500 text-[11px]">
                (วันเสาร์-อาทิตย์เป็นวันหยุดประจำสัปดาห์ให้อยู่แล้ว)
              </span>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center font-bold text-xs py-2 text-slate-600">
              <div className="text-red-500">อา.</div>
              <div>จ.</div>
              <div>อ.</div>
              <div>พ.</div>
              <div>พฤ.</div>
              <div>ศ.</div>
              <div className="text-red-500">ส.</div>
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 bg-slate-200 gap-[1px]">
              {/* Padding cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-50 min-h-[64px] opacity-40"></div>
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
                const isWknd = isWeekend(dateStr);
                const isSpecial = isDateSpecialHoliday(day);

                let cellBg = 'bg-white hover:bg-slate-50';
                if (isSpecial) {
                  cellBg = 'bg-amber-100 border-2 border-amber-500 text-amber-900';
                } else if (isWknd) {
                  cellBg = 'bg-slate-200/80 text-slate-700';
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`min-h-[70px] p-2 flex flex-col justify-between items-center transition-all cursor-pointer relative ${cellBg}`}
                  >
                    <span className="text-sm font-bold">{day}</span>

                    {isSpecial ? (
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>วันหยุดพิเศษ</span>
                      </span>
                    ) : isWknd ? (
                      <span className="text-[10px] text-slate-500">
                        วันหยุดสัปดาห์
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 group-hover:text-blue-600">
                        + ตั้งเป็นวันหยุด
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Special Holidays Summary */}
        <div className="lg:col-span-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center justify-between">
              <span>วันหยุดพิเศษที่เลือก ({currentMonthSpecialHolidays.length} วัน)</span>
            </h3>

            {currentMonthSpecialHolidays.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <CalendarOff className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
                <p className="text-xs">ยังไม่มีการเลือกวันหยุดพิเศษ</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  (หากไม่มี ให้กดปุ่ม <strong>"ไม่มีวันหยุดพิเศษ (กดข้าม)"</strong> ได้ทันที)
                </p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-72 pr-1">
                {currentMonthSpecialHolidays.map((h) => {
                  const dayNum = Number(h.date.split('-')[2]);
                  return (
                    <div
                      key={h.date}
                      className="flex items-center justify-between p-2.5 bg-white border border-amber-300 rounded-lg shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                          {dayNum}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">
                            วันที่ {dayNum} {THAI_MONTHS[month - 1]}
                          </div>
                          <span className="text-[10px] text-amber-700 font-medium">วันหยุดพิเศษ</span>
                        </div>
                      </div>
                      <button
                        title="ยกเลิกวันหยุดนี้"
                        onClick={() => onRemoveHoliday(h.date)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2 mb-6">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          วันที่เลือกเป็นวันหยุดพิเศษจะปรากฏเป็น <strong>แถบสีเทาเข้ม</strong> ในตารางหลักฐานขออนุมัติฯ และคำนวณในอัตราเวรวันหยุด (60 บาท/ชม. หักพัก 1 ชม.)
        </div>
      </div>

      {/* Nav */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ: เลือกเดือน</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>ขั้นตอนที่ 4: ไปที่ปฏิทินจองเวร</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
