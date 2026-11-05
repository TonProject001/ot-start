import { Officer, ShiftBooking, SpecialHoliday, DepartmentConfig } from '../types';

export interface SmartMergeBookingsOptions {
  localBookings: ShiftBooking[];
  remoteBookings: ShiftBooking[];
  activeOfficerId?: string;
  targetMonthPrefix?: string; // e.g. "2026-10"
}

export interface SmartMergeResult {
  mergedBookings: ShiftBooking[];
  otherOfficersPreservedCount: number;
  activeOfficerBookingsCount: number;
}

/**
 * รวมข้อมูลการจองเวร (Smart Merge) เพื่อป้องกันการเขียนทับข้อมูลของเจ้าหน้าที่คนอื่น
 * 
 * ปัญหาเดิม: เจ้าหน้าที่คนที่ 2 บันทึกข้อมูลขึ้น Google Sheets โดยไม่ได้กดดึงข้อมูลล่าสุด
 * ทำให้ข้อมูลของเจ้าหน้าที่คนแรกที่ขึ้นไว้ก่อนหน้าถูกเขียนทับจนหายไป
 * 
 * วิธีแก้ (Smart Merge):
 * 1. ข้อมูลเวรของเจ้าหน้าที่คนอื่น (officerId != activeOfficerId) จาก Google Sheets จะถูกเก็บรักษาไว้ทั้งหมด 100%
 * 2. ข้อมูลเวรของเจ้าหน้าที่ปัจจุบัน (activeOfficerId) จะอัปเดตตามที่เจ้าหน้าที่เลือก
 * 3. หากมีเวรของเดือนอื่นใน Google Sheets ของเจ้าหน้าที่ปัจจุบัน จะเก็บรักษาไว้เช่นกัน
 */
export function smartMergeBookings(options: SmartMergeBookingsOptions): SmartMergeResult {
  const { localBookings, remoteBookings, activeOfficerId, targetMonthPrefix } = options;

  // Map key: `${officerId}_${date}`
  const mergedMap = new Map<string, ShiftBooking>();
  let otherOfficersPreservedCount = 0;
  let activeOfficerBookingsCount = 0;

  // 1. นำข้อมูลจาก Google Sheets (remoteBookings) ทั้งหมดมาใส่ก่อน
  // โดยเฉพาะข้อมูลของเจ้าหน้าที่ท่านอื่น ถือเป็นข้อมูลจริงล่าสุดจากคลาวด์
  for (const rb of remoteBookings) {
    if (!rb || !rb.officerId || !rb.date) continue;
    const key = `${rb.officerId}_${rb.date}`;

    if (activeOfficerId && rb.officerId === activeOfficerId) {
      // ถ้าเป็นเจ้าหน้าที่คนปัจจุบัน และมีการระบุ targetMonthPrefix (เช่น 2026-10)
      // ให้เก็บข้อมูลของเดือนอื่นไว้ก่อน ส่วนเดือนปัจจุบันจะถูกแทนที่ด้วยข้อมูลใหม่จาก local
      if (targetMonthPrefix && !rb.date.startsWith(targetMonthPrefix)) {
        mergedMap.set(key, rb);
      }
      // หากไม่มี targetMonthPrefix เราจะให้ localBookings ของ activeOfficerId เป็นตัวกำหนด
    } else {
      // เจ้าหน้าที่คนอื่น เก็บรักษาไว้ทั้งหมด!
      mergedMap.set(key, rb);
      otherOfficersPreservedCount++;
    }
  }

  // 2. นำข้อมูลของ localBookings มาผนวกรวม
  for (const lb of localBookings) {
    if (!lb || !lb.officerId || !lb.date) continue;
    const key = `${lb.officerId}_${lb.date}`;

    if (activeOfficerId) {
      if (lb.officerId === activeOfficerId) {
        // อัปเดตเวรของเจ้าหน้าที่ปัจจุบัน
        mergedMap.set(key, lb);
        activeOfficerBookingsCount++;
      } else {
        // หากใน local มีข้อมูลของคนอื่นที่ใน remote ไม่มี (เช่น ทำงานออฟไลน์มาก่อนหน้า)
        if (!mergedMap.has(key)) {
          mergedMap.set(key, lb);
        }
      }
    } else {
      // กรณีไม่ได้ระบุ activeOfficerId ให้รวมข้อมูลเข้าด้วยกัน
      mergedMap.set(key, lb);
    }
  }

  // 3. แปลงกลับเป็น Array และเรียงลำดับตามวันที่และ officerId
  const mergedBookings = Array.from(mergedMap.values()).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.officerId.localeCompare(b.officerId);
  });

  return {
    mergedBookings,
    otherOfficersPreservedCount,
    activeOfficerBookingsCount,
  };
}

/**
 * ผสานรายชื่อเจ้าหน้าที่ทั้งจากเครื่องและ Google Sheets เข้าด้วยกันโดยไม่ให้ชื่อสูญหาย
 */
export function mergeOfficers(localOfficers: Officer[], remoteOfficers: Officer[]): Officer[] {
  const map = new Map<string, Officer>();

  // ใส่ remote ก่อน
  for (const ro of remoteOfficers) {
    if (ro && ro.id) {
      map.set(ro.id, ro);
    }
  }

  // ผนวก local ทับ ถ้ามีการแก้ไข หรือเพิ่มใหม่
  for (const lo of localOfficers) {
    if (lo && lo.id) {
      map.set(lo.id, lo);
    }
  }

  return Array.from(map.values());
}

/**
 * ผสานวันหยุดพิเศษทั้งจากเครื่องและ Google Sheets
 */
export function mergeSpecialHolidays(
  localHolidays: SpecialHoliday[],
  remoteHolidays: SpecialHoliday[]
): SpecialHoliday[] {
  const map = new Map<string, SpecialHoliday>();

  for (const rh of remoteHolidays) {
    if (rh && rh.date) {
      map.set(rh.date, rh);
    }
  }

  for (const lh of localHolidays) {
    if (lh && lh.date) {
      map.set(lh.date, lh);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * ผสานการตั้งค่าหน่วยงาน
 */
export function mergeDepartmentConfig(
  localDept: DepartmentConfig,
  remoteDept?: Partial<DepartmentConfig> | null
): DepartmentConfig {
  if (!remoteDept || Object.keys(remoteDept).length === 0) {
    return localDept;
  }
  return {
    ...localDept,
    ...remoteDept,
  };
}
