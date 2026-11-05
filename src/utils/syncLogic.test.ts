import test from 'node:test';
import assert from 'node:assert/strict';
import {
  smartMergeBookings,
  mergeOfficers,
  mergeSpecialHolidays,
  mergeDepartmentConfig
} from './syncLogic';
import { Officer, ShiftBooking, SpecialHoliday, DepartmentConfig } from '../types';

test('smartMergeBookings preserves other officers bookings when Officer B syncs', () => {
  // Scenario described by user:
  // Officer A ('p1') booked Oct 1, 2, 3 and already synced to Google Sheets.
  const remoteBookings: ShiftBooking[] = [
    { officerId: 'p1', date: '2026-10-01', hours: 4 },
    { officerId: 'p1', date: '2026-10-02', hours: 4 },
    { officerId: 'p1', date: '2026-10-03', hours: 8 },
  ];

  // Officer B ('p2') opens their app without pulling manually.
  // Officer B books Oct 5 and Oct 6.
  const localBookings: ShiftBooking[] = [
    { officerId: 'p2', date: '2026-10-05', hours: 4 },
    { officerId: 'p2', date: '2026-10-06', hours: 4 },
  ];

  // When smartMergeBookings is called with activeOfficerId = 'p2':
  const result = smartMergeBookings({
    localBookings,
    remoteBookings,
    activeOfficerId: 'p2',
    targetMonthPrefix: '2026-10',
  });

  // Verify that ALL of Officer A's bookings are completely preserved!
  const officerABookings = result.mergedBookings.filter((b) => b.officerId === 'p1');
  assert.equal(officerABookings.length, 3, "Officer A's bookings must not be deleted");
  assert.equal(officerABookings[0].date, '2026-10-01');
  assert.equal(officerABookings[1].date, '2026-10-02');
  assert.equal(officerABookings[2].date, '2026-10-03');

  // Verify Officer B's bookings are also included
  const officerBBookings = result.mergedBookings.filter((b) => b.officerId === 'p2');
  assert.equal(officerBBookings.length, 2, "Officer B's bookings must be present");
  assert.equal(officerBBookings[0].date, '2026-10-05');
  assert.equal(officerBBookings[1].date, '2026-10-06');

  // Total count must be 5
  assert.equal(result.mergedBookings.length, 5);
  assert.equal(result.otherOfficersPreservedCount, 3);
  assert.equal(result.activeOfficerBookingsCount, 2);
});

test('smartMergeBookings allows active officer to update/modify their own shifts while keeping others intact', () => {
  // Remote has both Officer A and an old shift for Officer B
  const remoteBookings: ShiftBooking[] = [
    { officerId: 'p1', date: '2026-10-01', hours: 4 },
    { officerId: 'p2', date: '2026-10-05', hours: 4 }, // old shift of p2
  ];

  // Officer B changes their shift from Oct 5 to Oct 10
  const localBookings: ShiftBooking[] = [
    { officerId: 'p2', date: '2026-10-10', hours: 8 },
  ];

  const result = smartMergeBookings({
    localBookings,
    remoteBookings,
    activeOfficerId: 'p2',
    targetMonthPrefix: '2026-10',
  });

  // Officer A still has Oct 1
  assert.equal(result.mergedBookings.find((b) => b.officerId === 'p1' && b.date === '2026-10-01')?.hours, 4);
  // Officer B has Oct 10, not old Oct 5
  assert.equal(result.mergedBookings.find((b) => b.officerId === 'p2' && b.date === '2026-10-10')?.hours, 8);
  assert.equal(result.mergedBookings.find((b) => b.officerId === 'p2' && b.date === '2026-10-05'), undefined);
});

test('mergeOfficers retains both locally created and remote officers', () => {
  const local: Officer[] = [
    { id: 'p1', name: 'Officer A', position: 'Pos A' },
    { id: 'p3', name: 'Officer C', position: 'Pos C' },
  ];
  const remote: Officer[] = [
    { id: 'p1', name: 'Officer A', position: 'Pos A' },
    { id: 'p2', name: 'Officer B', position: 'Pos B' },
  ];

  const merged = mergeOfficers(local, remote);
  assert.equal(merged.length, 3);
  const ids = merged.map((o) => o.id);
  assert.ok(ids.includes('p1'));
  assert.ok(ids.includes('p2'));
  assert.ok(ids.includes('p3'));
});

test('mergeSpecialHolidays merges holidays by date without duplication', () => {
  const local: SpecialHoliday[] = [{ date: '2026-10-13', name: 'วันนวมินทรมหาราช' }];
  const remote: SpecialHoliday[] = [
    { date: '2026-10-13', name: 'วันนวมินทรมหาราช' },
    { date: '2026-10-23', name: 'วันปิยมหาราช' },
  ];

  const merged = mergeSpecialHolidays(local, remote);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].date, '2026-10-13');
  assert.equal(merged[1].date, '2026-10-23');
});
