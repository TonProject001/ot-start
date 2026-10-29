import React, { useState } from 'react';
import { ShiftBooking, Officer, SpecialHoliday } from '../types';
import { X, Search, Trash2, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { calculateShiftCost, isHolidayOrWeekend, THAI_MONTHS, toBuddhistYear } from '../utils/shiftLogic';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookings: ShiftBooking[];
  officers: Officer[];
  specialHolidays: SpecialHoliday[];
  onDeleteBooking: (officerId: string, date: string) => void;
  onClearAllBookings: () => void;
}

export const SavedRecordsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  bookings,
  officers,
  specialHolidays,
  onDeleteBooking,
  onClearAllBookings,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOfficer, setFilterOfficer] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  const officerMap = new Map(officers.map((o) => [o.id, o]));

  // Get distinct months present in bookings
  const monthsInRecords = Array.from(
    new Set(bookings.map((b) => b.date.slice(0, 7)))
  ).sort().reverse();

  const filteredBookings = bookings.filter((b) => {
    const officer = officerMap.get(b.officerId);
    const officerName = officer ? officer.name : '';
    const officerPos = officer ? officer.position : '';

    if (filterOfficer !== 'all' && b.officerId !== filterOfficer) return false;
    if (filterMonth !== 'all' && !b.date.startsWith(filterMonth)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = officerName.toLowerCase().includes(q);
      const matchPos = officerPos.toLowerCase().includes(q);
      const matchDate = b.date.includes(q);
      if (!matchName && !matchPos && !matchDate) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                ตรวจสอบและจัดการข้อมูลการจองเวรที่บันทึกไว้
              </h3>
              <p className="text-xs text-slate-500">
                รายการข้อมูลการขออนุมัติขึ้นเวรทั้งหมดในระบบ ({bookings.length} รายการ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, ตำแหน่ง หรือวันที่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={filterOfficer}
              onChange={(e) => setFilterOfficer(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">กรองตามบุคคล: ทั้งหมด</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">กรองตามเดือน: ทุกเดือน</option>
              {monthsInRecords.map((m) => {
                const [y, mon] = m.split('-').map(Number);
                return (
                  <option key={m} value={m}>
                    {THAI_MONTHS[mon - 1]} พ.ศ. {toBuddhistYear(y)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 stroke-1 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">ไม่พบรายการบันทึกเวรตามเงื่อนไข</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">วันที่ปฏิบัติงาน</th>
                  <th className="py-2.5 px-3">ประเภทวัน</th>
                  <th className="py-2.5 px-3">ชื่อ-สกุล ผู้ขึ้นเวร</th>
                  <th className="py-2.5 px-3">ตำแหน่ง</th>
                  <th className="py-2.5 px-3 text-center">ชั่วโมงเวร</th>
                  <th className="py-2.5 px-3 text-right">ค่าตอบแทน</th>
                  <th className="py-2.5 px-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const officer = officerMap.get(b.officerId);
                  const isHol = isHolidayOrWeekend(b.date, specialHolidays);
                  const calc = calculateShiftCost(b.hours, isHol);
                  const [y, m, d] = b.date.split('-').map(Number);
                  const formattedDate = `${d} ${THAI_MONTHS[m - 1]} ${toBuddhistYear(y)}`;

                  return (
                    <tr key={`${b.officerId}-${b.date}`} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-medium text-slate-800">{formattedDate}</td>
                      <td className="py-2 px-3">
                        {isHol ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-800">
                            วันหยุด/พิเศษ (60 บ.)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                            วันธรรมดา (50 บ.)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {officer ? officer.name : 'ไม่ระบุ'}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{officer ? officer.position : '-'}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700">{b.hours} ชม.</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">
                        {calc.cost.toLocaleString()} บาท
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          title="ลบเวรนี้"
                          onClick={() => onDeleteBooking(b.officerId, b.date)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClearAllBookings}
            className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline cursor-pointer"
          >
            ล้างข้อมูลการจองเวรทั้งหมด
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
