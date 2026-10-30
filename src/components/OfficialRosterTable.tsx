import React, { useState } from 'react';
import { Officer, SpecialHoliday, ShiftBooking, DepartmentConfig } from '../types';
import {
  Printer,
  Users,
  User,
  Download,
  Settings,
  Info
} from 'lucide-react';
import {
  getDaysInMonth,
  isHolidayOrWeekend,
  calculateOfficerSummary,
  thaiBahtText,
  THAI_MONTHS,
  toBuddhistYear,
  OfficerMonthSummary
} from '../utils/shiftLogic';

interface Props {
  year: number;
  month: number;
  officers: Officer[];
  activeOfficerId: string;
  bookings: ShiftBooking[];
  specialHolidays: SpecialHoliday[];
  department: DepartmentConfig;
  onOpenSettings: () => void;
  onSelectOfficer: (id: string) => void;
}

// Generate official position headcount summary (e.g. "จพ.โสตทัศนศึกษา 1 คน นวก.โสตทัศนศึกษา 3 คน พนง.บริการ 2 คน")
function generatePositionSummary(officers: Officer[]): string {
  const counts: Record<string, number> = {};

  officers.forEach((o) => {
    let pos = o.position.trim();
    if (pos.includes('เจ้าพนักงานโสตทัศนศึกษา')) {
      pos = 'จพ.โสตทัศนศึกษา';
    } else if (pos.includes('นักวิชาการโสตทัศนศึกษา')) {
      pos = 'นวก.โสตทัศนศึกษา';
    } else if (pos.includes('พนักงานบริการ')) {
      pos = 'พนง.บริการ';
    }
    counts[pos] = (counts[pos] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([pos, count]) => `${pos} ${count} คน`)
    .join(' ');
}

export const OfficialRosterTable: React.FC<Props> = ({
  year,
  month,
  officers,
  activeOfficerId,
  bookings,
  specialHolidays,
  department,
  onOpenSettings,
  onSelectOfficer,
}) => {
  const [viewMode, setViewMode] = useState<'all' | 'personal'>('all');

  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = String(month).padStart(2, '0');
  const buddhistYear = toBuddhistYear(year);

  // Compute summary for every officer
  const allSummaries: OfficerMonthSummary[] = officers.map((officer) =>
    calculateOfficerSummary(officer, year, month, bookings, specialHolidays)
  );

  // Filter if in personal view
  const displayedSummaries =
    viewMode === 'personal'
      ? allSummaries.filter((s) => s.officer.id === activeOfficerId)
      : allSummaries;

  // Calculate grand totals of displayed rows
  const grandTotalWeekdayHours = displayedSummaries.reduce((acc, s) => acc + s.weekdayHours, 0);
  const grandTotalWeekdayAmount = displayedSummaries.reduce((acc, s) => acc + s.weekdayAmount, 0);
  const grandTotalHolidayHours = displayedSummaries.reduce((acc, s) => acc + s.holidayHours, 0);
  const grandTotalHolidayAmount = displayedSummaries.reduce((acc, s) => acc + s.holidayAmount, 0);
  const grandTotalHours = grandTotalWeekdayHours + grandTotalHolidayHours;
  const grandTotalAmount = grandTotalWeekdayAmount + grandTotalHolidayAmount;
  const grandTotalText = thaiBahtText(grandTotalAmount);

  const positionSummaryText = generatePositionSummary(displayedSummaries.map((s) => s.officer));

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csv = `\uFEFF${department.documentTitle || 'หลักฐานการเบิกจ่ายค่าตอบแทนการปฏิบัติงานนอกเวลาราชการ'}\n`;
    csv += `ส่วนราชการ ${department.agencyName} ประจำเดือน ${THAI_MONTHS[month - 1]} ${buddhistYear} ${department.divisionName}\n\n`;

    const dayCols = Array.from({ length: daysInMonth }, (_, i) => `วันที่ ${i + 1}`).join(',');
    csv += `ชื่อ-สกุล,ตำแหน่ง,อัตรา/ชม.,${dayCols},จำนวนเวร(ชม.),จำนวนเงินต่อเวร,รวมจำนวนเงิน,ลายมือชื่อ\n`;

    displayedSummaries.forEach((s) => {
      // Row 50
      const days50 = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const dStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
        const isHol = isHolidayOrWeekend(dStr, specialHolidays);
        return !isHol && s.dailyHours[d] ? s.dailyHours[d] : '';
      }).join(',');
      csv += `"${s.officer.name}","${s.officer.position}",50,${days50},${s.weekdayHours},${s.weekdayAmount},"${s.totalAmount}",""\n`;

      // Row 60
      const days60 = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const dStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
        const isHol = isHolidayOrWeekend(dStr, specialHolidays);
        return isHol && s.dailyHours[d] ? s.dailyHours[d] : '';
      }).join(',');
      csv += `,,,60,${days60},${s.holidayAmount},,\n`;
    });

    csv += `\nรวมรายจ่ายทั้งสิ้น(ตัวอักษร),${grandTotalText},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,รวม,${grandTotalAmount}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `หลักฐานเบิกจ่าย_${THAI_MONTHS[month - 1]}_${buddhistYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Mode Switch Bar (Hidden in Print) */}
      <div className="no-print bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 mr-1">มุมมองตาราง:</span>
            <button
              onClick={() => setViewMode('all')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ภาพรวมทุกคน ({officers.length} ท่าน - แบบราชการเต็มรูปแบบ)</span>
            </button>

            <button
              onClick={() => setViewMode('personal')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'personal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>เฉพาะของฉัน (ตามชื่อที่เลือก)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-300"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>แก้ไขหัวเอกสาร/ผู้มีอำนาจลงนาม (5 ตำแหน่ง)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>ส่งออก Excel/CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ลงกระดาษ A4 แนวนอน</span>
            </button>
          </div>
        </div>

        {/* Informational badge */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>
              รูปแบบการแสดงผลตรงตามเอกสารทางการ: มีลายมือชื่อ, ข้อความรับรอง, สรุปจำนวนคนตามตำแหน่ง และช่องลงนาม 5 ฝ่าย
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-white border border-slate-300 inline-block"></span> วันธรรมดา (50 บ.)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-slate-400 border border-slate-500 inline-block"></span> วันหยุด/พิเศษ (60 บ.)
            </span>
          </div>
        </div>
      </div>

      {/* Roster Document Sheet Container - Formatted strictly matching the official PDF */}
      <div className="print-table-container print-area bg-white rounded-xl shadow-md border border-slate-300 p-6 md:p-8 overflow-x-auto text-black font-['Sarabun',sans-serif]">
        {/* Document Official Header */}
        <div className="text-center mb-3 space-y-0.5 print-header">
          <h1 className="text-sm md:text-base font-bold tracking-tight text-black leading-tight print:text-[14px]">
            {department.documentTitle || 'หลักฐานการเบิกจ่ายค่าตอบแทนการปฏิบัติงานนอกเวลาราชการ'}
          </h1>
          <p className="text-[11px] md:text-xs text-black font-normal leading-relaxed print:text-[10px]">
            ส่วนราชการ <span className="font-normal">{department.agencyName}</span> ประจำเดือน{' '}
            <span className="font-normal">
              {THAI_MONTHS[month - 1]} {buddhistYear}
            </span>{' '}
            <span className="font-normal">{department.divisionName}</span>
          </p>
        </div>

        {/* Master Government Table matching exact PDF */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-black text-[10px] md:text-[11px] leading-tight select-text text-center font-normal official-roster-table print:text-[9.5px]">
            <thead>
              <tr className="bg-white">
                <th
                  rowSpan={2}
                  className="border border-black px-1.5 py-1 font-bold text-center align-middle whitespace-nowrap w-[1%]"
                >
                  ชื่อ-สกุล
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1 font-bold text-center align-middle whitespace-nowrap w-[1%]"
                >
                  ตำแหน่ง
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-0.5 py-1 font-bold text-center align-middle w-[32px] min-w-[30px]"
                >
                  อัตรา/
                  <br />
                  ชม.
                </th>
                <th
                  colSpan={daysInMonth}
                  className="border border-black px-1 py-0.5 font-bold text-center align-middle"
                >
                  วันที่ขึ้นปฏิบัติงาน
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1 font-bold text-center align-middle w-[50px] min-w-[48px]"
                >
                  จำนวน
                  <br />
                  เวร (ชม.)
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1 font-bold text-center align-middle w-[58px] min-w-[56px]"
                >
                  จำนวนเงิน
                  <br />
                  ต่อเวร
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1 font-bold text-center align-middle w-[62px] min-w-[60px]"
                >
                  รวม
                  <br />
                  จำนวนเงิน
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1 font-bold text-center align-middle w-[75px] min-w-[70px]"
                >
                  ลายมือชื่อ
                </th>
              </tr>

              {/* Day numbers 1 to N */}
              <tr className="bg-white font-medium">
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
                  const isHol = isHolidayOrWeekend(dateStr, specialHolidays);

                  return (
                    <th
                      key={day}
                      className={`border border-black px-0.5 py-0.5 text-center font-bold text-[9px] md:text-[10px] min-w-[18px] ${
                        isHol ? 'bg-slate-400 text-black' : 'bg-white text-black'
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {displayedSummaries.map((s) => {
                const isCurrentActive = s.officer.id === activeOfficerId;
                return (
                  <React.Fragment key={s.officer.id}>
                    {/* Row 1: Weekday Rate 50 */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      {/* Name (spans 2 rows) - Strictly compact on same line */}
                      <td
                        rowSpan={2}
                        onClick={() => onSelectOfficer(s.officer.id)}
                        className={`officer-name-cell border border-black px-1.5 py-0.5 text-left align-middle font-medium cursor-pointer whitespace-nowrap w-[1%] ${
                          isCurrentActive ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 whitespace-nowrap">
                          <span className="whitespace-nowrap">{s.officer.name}</span>
                          {isCurrentActive && (
                            <span className="no-print text-[9px] px-1 bg-blue-100 text-blue-700 rounded ml-1 font-normal flex-shrink-0">
                              ฉัน
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Position (spans 2 rows) - Strictly compact */}
                      <td
                        rowSpan={2}
                        className={`officer-pos-cell border border-black px-1.5 py-0.5 text-center align-middle font-normal text-[10px] whitespace-nowrap w-[1%] ${
                          isCurrentActive ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        {s.officer.position.includes('เจ้าพนักงานโสตทัศนศึกษา') &&
                        (s.officer.position.includes('ชำนาญงาน') || s.officer.name.includes('ปพิชญา')) ? (
                          <div className="leading-tight whitespace-nowrap">
                            <div>เจ้าพนักงานโสตทัศนศึกษา</div>
                            <div>ชำนาญงาน</div>
                          </div>
                        ) : s.officer.position.includes('\n') ? (
                          <div className="leading-tight whitespace-nowrap">
                            {s.officer.position.split('\n').map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="whitespace-nowrap">{s.officer.position}</span>
                        )}
                      </td>

                      {/* Rate 50 */}
                      <td className="border border-black px-0.5 py-0.5 text-center font-bold">50</td>

                      {/* Days 1..N for Rate 50 */}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
                        const isHol = isHolidayOrWeekend(dateStr, specialHolidays);
                        const hrs = s.dailyHours[day] || 0;

                        // Only show in Rate 50 row if it's a weekday
                        const cellContent = !isHol && hrs > 0 ? hrs : '';

                        return (
                          <td
                            key={day}
                            className={`border border-black px-0.5 py-0.5 text-center font-bold text-[10px] ${
                              isHol ? 'bg-slate-400' : 'bg-white'
                            }`}
                          >
                            {cellContent}
                          </td>
                        );
                      })}

                      {/* Weekday Total Hours */}
                      <td className="border border-black px-1 py-0.5 text-center font-bold">
                        {s.weekdayHours > 0 ? s.weekdayHours : ''}
                      </td>

                      {/* Weekday Amount */}
                      <td className="border border-black px-1 py-0.5 text-right font-medium pr-1">
                        {s.weekdayAmount > 0 ? s.weekdayAmount.toLocaleString() : ''}
                      </td>

                      {/* Total Amount for this Officer (spans 2 rows) */}
                      <td
                        rowSpan={2}
                        className="border border-black px-1.5 py-1 text-right align-middle font-bold text-xs"
                      >
                        {s.totalAmount.toLocaleString()}
                      </td>

                      {/* ลายมือชื่อ (spans 2 rows) - Empty signature cell matching PDF */}
                      <td rowSpan={2} className="border border-black px-1 py-1 text-center align-middle"></td>
                    </tr>

                    {/* Row 2: Holiday Rate 60 */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      {/* Rate 60 */}
                      <td className="border border-black px-0.5 py-0.5 text-center font-bold">60</td>

                      {/* Days 1..N for Rate 60 */}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
                        const isHol = isHolidayOrWeekend(dateStr, specialHolidays);
                        const hrs = s.dailyHours[day] || 0;

                        // Only show in Rate 60 row if it's a holiday/weekend
                        const cellContent = isHol && hrs > 0 ? hrs : '';

                        return (
                          <td
                            key={day}
                            className={`border border-black px-0.5 py-0.5 text-center font-bold text-[10px] ${
                              isHol ? 'bg-slate-400 text-black' : 'bg-white'
                            }`}
                          >
                            {cellContent}
                          </td>
                        );
                      })}

                      {/* Holiday Total Hours */}
                      <td className="border border-black px-1 py-0.5 text-center font-bold">
                        {s.holidayHours > 0 ? s.holidayHours : ''}
                      </td>

                      {/* Holiday Amount */}
                      <td className="border border-black px-1 py-0.5 text-right font-medium pr-1">
                        {s.holidayAmount > 0 ? s.holidayAmount.toLocaleString() : ''}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Bottom Grand Total Row */}
              <tr className="font-bold bg-white">
                <td
                  colSpan={3 + daysInMonth}
                  className="border border-black px-3 py-1 text-center text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-left">รวมรายจ่ายทั้งสิ้น(ตัวอักษร)</span>
                    <span className="text-center font-bold text-xs md:text-sm tracking-wide">
                      {grandTotalText}
                    </span>
                    <span></span>
                  </div>
                </td>

                <td className="border border-black px-1 py-1 text-center font-bold"></td>

                <td className="border border-black px-1 py-1 text-center font-bold text-xs">รวม</td>

                <td className="border border-black px-1.5 py-1 text-right font-bold text-xs">
                  {grandTotalAmount.toLocaleString()}
                </td>

                <td className="border border-black px-1 py-1 text-center"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Certification Notes beneath Table (Matching PDF exactly) */}
        <div className="mt-3 text-[11px] leading-relaxed text-black space-y-1 print:mt-2 print:text-[9.5px] print-certification">
          <p className="font-normal">ขอรับรองว่าผู้มีรายชื่อข้างต้นได้ขึ้นปฏิบัติงานนอกเวลาราชการจริง</p>
          <p className="font-normal">
            ตรวจสอบถูกต้องแล้วเห็นควรจ่ายปฏิบัติงานนอกเวลาราชการ&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="font-bold">{grandTotalAmount.toLocaleString()}</span>&nbsp;&nbsp;&nbsp;&nbsp;บาท
            ให้กับ&nbsp;&nbsp;
            <span className="font-medium">{positionSummaryText}</span>
          </p>
        </div>

        {/* 5 Official Signature Blocks Aligned Horizontally across Landscape A4 (Matching PDF) */}
        <div className="mt-6 pt-2 grid grid-cols-5 gap-2 text-[10px] md:text-[11px] text-center text-black print:mt-4 print:pt-1 print:text-[8.5px] print-signatures">
          {/* Signer 1: หัวหน้างาน */}
          <div className="flex flex-col justify-end items-center">
            <div className="w-full">
              <p className="whitespace-nowrap">ลงชื่อ..........................................................</p>
              <p className="font-normal mt-1">( {department.signer1Name || 'นางสาวปพิชญา เอี้ยงหมี'} )</p>
              <p className="text-[10px] mt-0.5">{department.signer1Position || 'หัวหน้างานโสตทัศนศึกษา'}</p>
            </div>
          </div>

          {/* Signer 2: หัวหน้ากลุ่มงาน */}
          <div className="flex flex-col justify-end items-center">
            <div className="w-full">
              <p className="whitespace-nowrap">ลงชื่อ..........................................................</p>
              <p className="font-normal mt-1">( {department.signer2Name || 'นางสาวกาญจนา โลหพันธุ์'} )</p>
              <p className="text-[10px] mt-0.5">{department.signer2Position || 'หัวหน้ากลุ่มงานพัฒนาทรัพยากรบุคคล'}</p>
            </div>
          </div>

          {/* Signer 3: หัวหน้ากลุ่มภารกิจ / หัวหน้าฝ่าย */}
          <div className="flex flex-col justify-end items-center">
            <div className="w-full">
              <p className="text-[10px] font-normal mb-1">{department.signer3Header || 'ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ'}</p>
              <p className="whitespace-nowrap">ลงชื่อ..........................................................หัวหน้าฝ่าย</p>
              <p className="font-normal mt-1">( {department.signer3Name || 'นายธนันท์ชัย กองแก้ว'} )</p>
              <p className="text-[10px] mt-0.5 leading-tight">
                {department.signer3Position || 'หัวหน้ากลุ่มภารกิจด้านพัฒนาระบบบริการและสนับสนุนบริการสุขภาพ'}
              </p>
            </div>
          </div>

          {/* Signer 4: นักวิชาการเงินและบัญชี */}
          <div className="flex flex-col justify-end items-center">
            <div className="w-full">
              <p className="text-[10px] font-normal mb-1">{department.signer4Header || 'ได้ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ'}</p>
              <p className="whitespace-nowrap">ลงชื่อ..........................................................</p>
              <p className="font-normal mt-1">( {department.signer4Name || 'นางสาวทิวารินทร์ ทองจรูญ'} )</p>
              <p className="text-[10px] mt-0.5">{department.signer4Position || 'นักวิชาการเงินและบัญชี'}</p>
            </div>
          </div>

          {/* Signer 5: ผู้อำนวยการโรงพยาบาล */}
          <div className="flex flex-col justify-end items-center">
            <div className="w-full">
              <p className="text-[10px] font-normal mb-1">{department.signer5Header || 'คำสั่งผู้อำนวยการอนุมัติ'}</p>
              <p className="whitespace-nowrap">ลงชื่อ..........................................................</p>
              <p className="font-normal mt-1">( {department.signer5Name || 'นายแพทย์มงคล ลือชูวงศ์'} )</p>
              <p className="text-[10px] mt-0.5 leading-tight">
                {department.signer5Position || 'ผู้อำนวยการโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
