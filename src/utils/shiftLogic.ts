/**
 * Logic for calculating overtime shifts and Thai Baht text conversion
 */

export interface Officer {
  id: string;
  name: string;
  position: string;
}

export interface SpecialHoliday {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface ShiftBooking {
  officerId: string;
  date: string; // YYYY-MM-DD
  hours: number;
}

export interface OfficerMonthSummary {
  officer: Officer;
  weekdayHours: number;
  weekdayAmount: number;
  holidayHours: number;
  holidayBillableHours: number;
  holidayAmount: number;
  totalHours: number;
  totalAmount: number;
  dailyHours: Record<number, number>; // day of month (1-31) -> hours
}

export const RATE_WEEKDAY = 50;
export const RATE_HOLIDAY = 60;
export const MAX_HOURS_WEEKDAY = 4;
export const MAX_HOURS_HOLIDAY = 8;
export const LUNCH_BREAK_HOURS = 1;

/**
 * Check if a date string (YYYY-MM-DD) is a weekend (Sat=6, Sun=0)
 */
export function isWeekend(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Check if a date is a special holiday or weekend
 */
export function isHolidayOrWeekend(dateStr: string, specialHolidays: SpecialHoliday[] = []): boolean {
  if (isWeekend(dateStr)) return true;
  return specialHolidays.some(h => h.date === dateStr);
}

/**
 * Calculate cost for a single shift
 */
export function calculateShiftCost(hours: number, isHoliday: boolean): { billableHours: number; cost: number; rate: number } {
  if (hours <= 0) {
    return { billableHours: 0, cost: 0, rate: isHoliday ? RATE_HOLIDAY : RATE_WEEKDAY };
  }

  if (isHoliday) {
    const clampedHours = Math.min(hours, MAX_HOURS_HOLIDAY);
    // Deduct 1 hour for lunch break
    const billableHours = Math.max(0, clampedHours - LUNCH_BREAK_HOURS);
    const cost = billableHours * RATE_HOLIDAY;
    return { billableHours, cost, rate: RATE_HOLIDAY };
  } else {
    const clampedHours = Math.min(hours, MAX_HOURS_WEEKDAY);
    const cost = clampedHours * RATE_WEEKDAY;
    return { billableHours: clampedHours, cost, rate: RATE_WEEKDAY };
  }
}

/**
 * Get days count in a given year and month (1-12)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format Thai Buddhist Year (พ.ศ.)
 */
export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + 543;
}

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Convert number into Thai Baht text format (e.g. 16400 -> หนึ่งหมื่นหกพันสี่ร้อยบาทถ้วน)
 */
export function thaiBahtText(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Split baht and satang
  const fixed = absAmount.toFixed(2);
  const [bahtPart, satangPart] = fixed.split('.');

  function convertGroup(nStr: string): string {
    let result = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = Number(nStr[i]);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          result += 'สิบ';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่สิบ';
        } else if (pos === 0 && digit === 1 && len > 1 && Number(nStr[len - 2]) !== 0) {
          result += 'เอ็ด';
        } else {
          result += numbers[digit] + units[pos];
        }
      }
    }
    return result;
  }

  // Handle large numbers (> millions)
  let bahtText = '';
  let remainingBaht = bahtPart;
  if (remainingBaht.length > 6) {
    const millionPart = remainingBaht.slice(0, remainingBaht.length - 6);
    remainingBaht = remainingBaht.slice(-6);
    bahtText += convertGroup(millionPart) + 'ล้าน';
  }
  bahtText += convertGroup(remainingBaht);
  if (!bahtText) bahtText = 'ศูนย์';

  let result = (isNegative ? 'ลบ' : '') + bahtText + 'บาท';

  const satangNum = Number(satangPart);
  if (satangNum === 0) {
    result += 'ถ้วน';
  } else {
    result += convertGroup(satangPart) + 'สตางค์';
  }

  return result;
}

/**
 * Compute full summary for an officer for a given month
 */
export function calculateOfficerSummary(
  officer: Officer,
  year: number,
  month: number,
  bookings: ShiftBooking[],
  specialHolidays: SpecialHoliday[]
): OfficerMonthSummary {
  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = String(month).padStart(2, '0');

  let weekdayHours = 0;
  let weekdayAmount = 0;
  let holidayHours = 0;
  let holidayBillableHours = 0;
  let holidayAmount = 0;
  const dailyHours: Record<number, number> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const isHol = isHolidayOrWeekend(dateStr, specialHolidays);

    const booking = bookings.find(b => b.officerId === officer.id && b.date === dateStr);
    const hours = booking ? booking.hours : 0;
    dailyHours[day] = hours;

    if (hours > 0) {
      const calc = calculateShiftCost(hours, isHol);
      if (isHol) {
        holidayHours += hours;
        holidayBillableHours += calc.billableHours;
        holidayAmount += calc.cost;
      } else {
        weekdayHours += hours;
        weekdayAmount += calc.cost;
      }
    }
  }

  return {
    officer,
    weekdayHours,
    weekdayAmount,
    holidayHours,
    holidayBillableHours,
    holidayAmount,
    totalHours: weekdayHours + holidayHours,
    totalAmount: weekdayAmount + holidayAmount,
    dailyHours
  };
}
