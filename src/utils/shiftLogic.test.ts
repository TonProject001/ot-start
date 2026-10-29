import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateShiftCost,
  thaiBahtText,
  isWeekend,
  isHolidayOrWeekend,
  calculateOfficerSummary,
  Officer,
  ShiftBooking,
  SpecialHoliday
} from './shiftLogic';

test('shift cost calculation: weekday standard 4 hours at 50 THB/hr', () => {
  const result = calculateShiftCost(4, false);
  assert.equal(result.billableHours, 4);
  assert.equal(result.rate, 50);
  assert.equal(result.cost, 200);
});

test('shift cost calculation: weekend/holiday 8 hours with 1 hour lunch deducted at 60 THB/hr', () => {
  const result = calculateShiftCost(8, true);
  assert.equal(result.billableHours, 7); // 8 - 1 = 7 hours
  assert.equal(result.rate, 60);
  assert.equal(result.cost, 420); // 7 * 60 = 420 (matches maximum 420 specified by user)
});

test('shift cost calculation: weekend/holiday clamps to maximum 8 hours', () => {
  const result = calculateShiftCost(10, true);
  assert.equal(result.billableHours, 7); // Clamped to 8 - 1 = 7 hours
  assert.equal(result.cost, 420);
});

test('shift cost calculation: weekday clamps to maximum 4 hours', () => {
  const result = calculateShiftCost(6, false);
  assert.equal(result.billableHours, 4);
  assert.equal(result.cost, 200);
});

test('isWeekend identifies Saturdays and Sundays correctly', () => {
  // 2026-10-03 is Saturday, 2026-10-04 is Sunday, 2026-10-05 is Monday
  assert.equal(isWeekend('2026-10-03'), true);
  assert.equal(isWeekend('2026-10-04'), true);
  assert.equal(isWeekend('2026-10-05'), false);
});

test('isHolidayOrWeekend identifies special holidays on weekdays', () => {
  const specialHolidays: SpecialHoliday[] = [
    { date: '2026-10-13', name: 'วันนวมินทรมหาราช' },
    { date: '2026-10-23', name: 'วันปิยมหาราช' }
  ];
  // 2026-10-23 is Friday (special holiday)
  assert.equal(isHolidayOrWeekend('2026-10-23', specialHolidays), true);
  // 2026-10-22 is Thursday (normal weekday)
  assert.equal(isHolidayOrWeekend('2026-10-22', specialHolidays), false);
});

test('thaiBahtText formats amounts accurately', () => {
  assert.equal(thaiBahtText(16400), 'หนึ่งหมื่นหกพันสี่ร้อยบาทถ้วน');
  assert.equal(thaiBahtText(2640), 'สองพันหกร้อยสี่สิบบาทถ้วน');
  assert.equal(thaiBahtText(420), 'สี่ร้อยยี่สิบบาทถ้วน');
  assert.equal(thaiBahtText(0), 'ศูนย์บาทถ้วน');
  assert.equal(thaiBahtText(1800), 'หนึ่งพันแปดร้อยบาทถ้วน');
  assert.equal(thaiBahtText(840), 'แปดร้อยสี่สิบบาทถ้วน');
});

test('officer month summary matches reference image calculations', () => {
  const officer: Officer = {
    id: 'p1',
    name: 'นางสาว ปพิชญา เอี้ยงหมี',
    position: 'เจ้าพนักงานโสตทัศนศึกษา ชำนาญงาน'
  };

  const bookings: ShiftBooking[] = [
    { officerId: 'p1', date: '2026-10-07', hours: 4 },
    { officerId: 'p1', date: '2026-10-08', hours: 4 },
    { officerId: 'p1', date: '2026-10-09', hours: 4 },
    { officerId: 'p1', date: '2026-10-10', hours: 8 }, // Saturday
    { officerId: 'p1', date: '2026-10-11', hours: 8 }, // Sunday
    { officerId: 'p1', date: '2026-10-13', hours: 4 }, // Weekday
    { officerId: 'p1', date: '2026-10-16', hours: 4 }, // Weekday
    { officerId: 'p1', date: '2026-10-20', hours: 4 }, // Weekday
    { officerId: 'p1', date: '2026-10-26', hours: 4 }, // Weekday
    { officerId: 'p1', date: '2026-10-28', hours: 4 }, // Weekday
    { officerId: 'p1', date: '2026-10-30', hours: 4 }  // Weekday
  ];

  const summary = calculateOfficerSummary(officer, 2026, 10, bookings, []);
  assert.equal(summary.weekdayHours, 36);
  assert.equal(summary.weekdayAmount, 1800);
  assert.equal(summary.holidayHours, 16);
  assert.equal(summary.holidayAmount, 840);
  assert.equal(summary.totalAmount, 2640);
});

test('all 6 officers in initial data sum to 15,800 THB matching user PDF', async () => {
  const { INITIAL_OFFICERS, INITIAL_BOOKINGS, INITIAL_SPECIAL_HOLIDAYS } = await import('../data/initialData');
  let grandTotal = 0;
  const expectedAmounts: Record<string, number> = {
    p1: 2640,
    p2: 2660,
    p3: 1660,
    p4: 3520,
    p5: 3260,
    p6: 2060
  };

  for (const officer of INITIAL_OFFICERS) {
    const s = calculateOfficerSummary(officer, 2026, 10, INITIAL_BOOKINGS, INITIAL_SPECIAL_HOLIDAYS);
    assert.equal(s.totalAmount, expectedAmounts[officer.id], `Officer ${officer.name} mismatch`);
    grandTotal += s.totalAmount;
  }
  assert.equal(grandTotal, 15800);
  assert.equal(thaiBahtText(grandTotal), 'หนึ่งหมื่นห้าพันแปดร้อยบาทถ้วน');
});

