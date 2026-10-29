import React, { useState, useMemo } from 'react';
import { Officer, SpecialHoliday, ShiftBooking } from '../types';
import {
  CalendarDays,
  CheckSquare,
  Square,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Sparkles,
  Coins,
  AlertCircle
} from 'lucide-react';
import {
  getDaysInMonth,
  isHolidayOrWeekend,
  calculateShiftCost,
  THAI_MONTHS,
  toBuddhistYear,
  RATE_WEEKDAY,
  RATE_HOLIDAY,
  MAX_HOURS_WEEKDAY,
  MAX_HOURS_HOLIDAY
} from '../utils/shiftLogic';

interface Props {
  year: number;
  month: number;
  officer: Officer;
  bookings: ShiftBooking[];
  specialHolidays: SpecialHoliday[];
  onSaveBookings: (newBookings: ShiftBooking[]) => void;
  onRemoveBookingsForDates: (officerId: string, dates: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step4CalendarBooking: React.FC<Props> = ({
  year,
  month,
  officer,
  bookings,
  specialHolidays,
  onSaveBookings,
  onRemoveBookingsForDates,
  onPrev,
  onNext,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = String(month).padStart(2, '0');

  // Currently selected dates in multi-select (e.g. ['2026-10-01', '2026-10-02'])
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  // Custom hours mode: 'auto' (4 on weekdays, 8 on holidays) or specific number
  const [hourMode, setHourMode] = useState<'auto' | 'custom'>('auto');
  const [customWeekdayHours, setCustomWeekdayHours] = useState<number>(4);
  const [customHolidayHours, setCustomHolidayHours] = useState<number>(8);

  // First day of month day-of-week (0=Sun, 1=Mon, ..., 6=Sat)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  // Map of existing bookings for this officer in this month
  const officerBookingsMap = useMemo(() => {
    const map = new Map<string, number>();
    bookings
      .filter((b) => b.officerId === officer.id && b.date.startsWith(`${year}-${monthStr}`))
      .forEach((b) => map.set(b.date, b.hours));
    return map;
  }, [bookings, officer.id, year, monthStr]);

  const toggleDateSelection = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const selectAll = () => {
    const all: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      all.push(`${year}-${monthStr}-${String(d).padStart(2, '0')}`);
    }
    setSelectedDates(all);
  };

  const selectWeekdaysOnly = () => {
    const dates: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
      if (!isHolidayOrWeekend(dStr, specialHolidays)) {
        dates.push(dStr);
      }
    }
    setSelectedDates(dates);
  };

  const selectHolidaysOnly = () => {
    const dates: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
      if (isHolidayOrWeekend(dStr, specialHolidays)) {
        dates.push(dStr);
      }
    }
    setSelectedDates(dates);
  };

  const clearSelection = () => {
    setSelectedDates([]);
  };

  // Apply booking to selected dates
  const handleApplyBooking = () => {
    if (selectedDates.length === 0) return;

    const newEntries: ShiftBooking[] = selectedDates.map((dateStr) => {
      const isHol = isHolidayOrWeekend(dateStr, specialHolidays);
      let hours: number;
      if (hourMode === 'auto') {
        hours = isHol ? MAX_HOURS_HOLIDAY : MAX_HOURS_WEEKDAY;
      } else {
        hours = isHol ? customHolidayHours : customWeekdayHours;
      }
      return {
        officerId: officer.id,
        date: dateStr,
        hours,
      };
    });

    onSaveBookings(newEntries);
    setSelectedDates([]);
  };

  // Remove shifts on selected dates
  const handleRemoveSelected = () => {
    if (selectedDates.length === 0) return;
    onRemoveBookingsForDates(officer.id, selectedDates);
    setSelectedDates([]);
  };

  // Quick single-day toggle/book directly
  const handleQuickDayClick = (dateStr: string) => {
    const currentHours = officerBookingsMap.get(dateStr);
    const isHol = isHolidayOrWeekend(dateStr, specialHolidays);

    if (currentHours && currentHours > 0) {
      // Already booked -> clicking toggles off
      onRemoveBookingsForDates(officer.id, [dateStr]);
    } else {
      // Not booked -> book with standard hours
      const hours = isHol ? MAX_HOURS_HOLIDAY : MAX_HOURS_WEEKDAY;
      onSaveBookings([{ officerId: officer.id, date: dateStr, hours }]);
    }
  };

  // Calculate projected earnings for selected dates
  const selectionPreview = useMemo(() => {
    let weekdayCount = 0;
    let holidayCount = 0;
    let totalEst = 0;

    selectedDates.forEach((dStr) => {
      const isHol = isHolidayOrWeekend(dStr, specialHolidays);
      let hrs =
        hourMode === 'auto'
          ? isHol
            ? MAX_HOURS_HOLIDAY
            : MAX_HOURS_WEEKDAY
          : isHol
          ? customHolidayHours
          : customWeekdayHours;

      const calc = calculateShiftCost(hrs, isHol);
      totalEst += calc.cost;
      if (isHol) holidayCount++;
      else weekdayCount++;
    });

    return { weekdayCount, holidayCount, totalEst };
  }, [selectedDates, specialHolidays, hourMode, customWeekdayHours, customHolidayHours]);

  // Total booked so far by this officer in this month
  const currentMonthStats = useMemo(() => {
    let totalHours = 0;
    let totalMoney = 0;
    let daysCount = 0;

    officerBookingsMap.forEach((hrs, dStr) => {
      const isHol = isHolidayOrWeekend(dStr, specialHolidays);
      const calc = calculateShiftCost(hrs, isHol);
      totalHours += hrs;
      totalMoney += calc.cost;
      daysCount++;
    });

    return { totalHours, totalMoney, daysCount };
  }, [officerBookingsMap, specialHolidays]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-2">
            <span>ขั้นตอนที่ 4 จาก 5</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            ปฏิทินเลือกวันที่ต้องการจองเวร (สามารถเลือกหลายวันได้)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            ผู้ปฏิบัติงาน:{' '}
            <strong className="text-slate-800">{officer.name}</strong> ({officer.position}) — ประจำเดือน{' '}
            <strong className="text-blue-700">
              {THAI_MONTHS[month - 1]} พ.ศ. {toBuddhistYear(year)}
            </strong>
          </p>
        </div>

        {/* Current status chip */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block">เวรที่จองแล้วในเดือนนี้</span>
            <span className="font-bold text-slate-800 text-sm">{currentMonthStats.daysCount} วัน</span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 block">จำนวนชั่วโมงรวม</span>
            <span className="font-bold text-blue-600 text-sm">{currentMonthStats.totalHours} ชม.</span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 block">ค่าตอบแทนสะสม</span>
            <span className="font-bold text-emerald-600 text-sm">
              {currentMonthStats.totalMoney.toLocaleString()} บาท
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Select Action Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">เลือกด่วน:</span>
            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
            >
              เลือกทั้งหมด ({daysInMonth} วัน)
            </button>
            <button
              type="button"
              onClick={selectWeekdaysOnly}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-medium transition-colors cursor-pointer"
            >
              เลือกเฉพาะวันธรรมดา (50 บ./ชม.)
            </button>
            <button
              type="button"
              onClick={selectHolidaysOnly}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-medium transition-colors cursor-pointer"
            >
              เลือกเฉพาะวันหยุด/วันหยุดพิเศษ (60 บ./ชม.)
            </button>
            {selectedDates.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
              >
                ล้างการเลือก ({selectedDates.length})
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-slate-400 rounded-xs"></span>
            <span>แถบสีเทาเข้ม = วันหยุดและวันหยุดพิเศษ (ตามภาพตัวอย่าง)</span>
          </div>
        </div>

        {/* Hour settings & Apply button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700">จำนวนชั่วโมงที่ขึ้นเวร:</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="hourMode"
                checked={hourMode === 'auto'}
                onChange={() => setHourMode('auto')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">
                ตามระเบียบราชการ (วันธรรมดา 4 ชม. / วันหยุด 8 ชม.)
              </span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="hourMode"
                checked={hourMode === 'custom'}
                onChange={() => setHourMode('custom')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">กำหนดชั่วโมงเอง</span>
            </label>

            {hourMode === 'custom' && (
              <div className="inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-300">
                <span>วันธรรมดา:</span>
                <select
                  value={customWeekdayHours}
                  onChange={(e) => setCustomWeekdayHours(Number(e.target.value))}
                  className="bg-transparent font-bold text-blue-600 focus:outline-none"
                >
                  <option value={1}>1 ชม.</option>
                  <option value={2}>2 ชม.</option>
                  <option value={3}>3 ชม.</option>
                  <option value={4}>4 ชม. (สูงสุด)</option>
                </select>
                <span className="text-slate-300">|</span>
                <span>วันหยุด:</span>
                <select
                  value={customHolidayHours}
                  onChange={(e) => setCustomHolidayHours(Number(e.target.value))}
                  className="bg-transparent font-bold text-amber-600 focus:outline-none"
                >
                  <option value={4}>4 ชม.</option>
                  <option value={6}>6 ชม.</option>
                  <option value={8}>8 ชม. (สูงสุด - หักพัก 1 ชม.)</option>
                </select>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedDates.length > 0 && (
              <button
                type="button"
                onClick={handleRemoveSelected}
                className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ยกเลิกเวร {selectedDates.length} วัน
              </button>
            )}

            <button
              type="button"
              disabled={selectedDates.length === 0}
              onClick={handleApplyBooking}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                บันทึกการจองเวร {selectedDates.length > 0 ? `(${selectedDates.length} วันที่เลือก)` : ''}
              </span>
            </button>
          </div>
        </div>

        {/* Selection estimation banner */}
        {selectedDates.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>
                วันที่เลือก: วันธรรมดา <strong>{selectionPreview.weekdayCount}</strong> วัน, วันหยุด{' '}
                <strong>{selectionPreview.holidayCount}</strong> วัน
              </span>
            </div>
            <div className="font-semibold text-emerald-700">
              ประมาณการค่าตอบแทนวันที่เลือก:{' '}
              <span className="text-sm font-bold text-emerald-800">
                {selectionPreview.totalEst.toLocaleString()}
              </span>{' '}
              บาท
            </div>
          </div>
        )}
      </div>

      {/* Interactive Calendar Grid */}
      <div className="border border-slate-300 rounded-xl overflow-hidden mb-6 shadow-xs">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-300 text-center font-bold text-xs py-2.5 text-slate-700">
          <div className="text-red-600">อา. (อาทิตย์)</div>
          <div>จ. (จันทร์)</div>
          <div>อ. (อังคาร)</div>
          <div>พ. (พุธ)</div>
          <div>พฤ. (พฤหัสฯ)</div>
          <div>ศ. (ศุกร์)</div>
          <div className="text-red-600">ส. (เสาร์)</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 bg-slate-200 gap-[1px]">
          {/* Empty padding cells for first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-slate-50 min-h-[95px] p-2 opacity-30 select-none"></div>
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }, (_, idx) => {
            const day = idx + 1;
            const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
            const isHol = isHolidayOrWeekend(dateStr, specialHolidays);
            const isSelected = selectedDates.includes(dateStr);
            const currentHours = officerBookingsMap.get(dateStr);
            const isBooked = !!currentHours && currentHours > 0;
            const holidayObj = specialHolidays.find((h) => h.date === dateStr);

            // Shading style according to the reference image: dark gray for holidays and weekends!
            const bgClass = isHol
              ? isSelected
                ? 'bg-slate-500 text-white'
                : 'bg-slate-400 text-slate-900'
              : isSelected
              ? 'bg-blue-100 text-blue-900'
              : 'bg-white text-slate-800';

            return (
              <div
                key={dateStr}
                onClick={() => toggleDateSelection(dateStr)}
                className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors relative cursor-pointer select-none border-b border-r border-slate-200/50 ${bgClass} ${
                  isSelected ? 'ring-2 ring-blue-600 ring-inset' : 'hover:opacity-95'
                }`}
              >
                {/* Top: Day number & select checkbox */}
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isHol
                        ? 'bg-slate-800 text-white'
                        : isBooked
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-800'
                    }`}
                  >
                    {day}
                  </span>

                  <div className="flex items-center gap-1">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 bg-white rounded-xs" />
                    ) : (
                      <Square className={`w-4 h-4 ${isHol ? 'text-slate-700' : 'text-slate-300'}`} />
                    )}
                  </div>
                </div>

                {/* Middle: Clean spacing without rate text labels */}
                <div className="my-1 min-h-[16px]">
                  {/* No rate text (วันหยุด60บ. วันธรรมดา50บ.) as requested */}
                </div>

                {/* Bottom: Booking status badge */}
                <div>
                  {isBooked ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickDayClick(dateStr);
                      }}
                      title="คลิกเพื่อยกเลิกเวรวันนี้"
                      className="w-full bg-emerald-600 hover:bg-red-600 text-white text-[11px] font-bold py-1 px-1.5 rounded text-center transition-colors shadow-2xs group flex items-center justify-center gap-1"
                    >
                      <span className="group-hover:hidden">
                        ✓ เวร {currentHours} ชม.{' '}
                        {isHol
                          ? `(${calculateShiftCost(currentHours, true).cost} บ.)`
                          : `(${calculateShiftCost(currentHours, false).cost} บ.)`}
                      </span>
                      <span className="hidden group-hover:inline">✕ ยกเลิกเวร</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickDayClick(dateStr);
                      }}
                      className={`w-full py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                        isHol
                          ? 'border-slate-600 text-slate-800 hover:bg-slate-500/20'
                          : 'border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      + จองวันนี้
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs text-slate-600 space-y-1.5">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm mb-1">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          ระเบียบและเงื่อนไขการคำนวณค่าตอบแทนนอกเวลาราชการ
        </div>
        <div>
          1. <strong>วันธรรมดา:</strong> อัตราโอทีชั่วโมงละ <strong>50 บาท</strong> (ปฏิบัติงานได้สูงสุด{' '}
          <strong>4 ชั่วโมง</strong> = 200 บาท/วัน)
        </div>
        <div>
          2. <strong>วันหยุดและวันหยุดพิเศษ:</strong> อัตราโอทีชั่วโมงละ <strong>60 บาท</strong>{' '}
          (ปฏิบัติงานได้สูงสุด <strong>8 ชั่วโมง</strong> แต่คำนวณเงินให้{' '}
          <strong className="text-amber-800">หักเวลาพักเที่ยงออก 1 ชั่วโมงเสมอ</strong> เหลือเบิก 7 ชม.{' '}
          <strong>= ได้รับเงินสูงสุดไม่เกิน 420 บาท/วัน</strong>)
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ: วันหยุดพิเศษ</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>ขั้นตอนที่ 5: ดูตารางหลักฐานการขออนุมัติฯ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
