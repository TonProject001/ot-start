import { Officer, SpecialHoliday, ShiftBooking, DepartmentConfig } from '../types';

export const INITIAL_DEPARTMENT: DepartmentConfig = {
  documentTitle: 'หลักฐานการเบิกจ่ายค่าตอบแทนการปฏิบัติงานนอกเวลาราชการ',
  agencyName: 'โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช',
  divisionName: 'งานโสตทัศนศึกษา กลุ่มงานพัฒนาทรัพยากรบุคคล',

  signer1Name: 'นางสาวปพิชญา เอี้ยงหมี',
  signer1Position: 'หัวหน้างานโสตทัศนศึกษา',

  signer2Name: 'นางสาวกาญจนา โลหพันธุ์',
  signer2Position: 'หัวหน้ากลุ่มงานพัฒนาทรัพยากรบุคคล',

  signer3Header: 'ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ',
  signer3Name: 'นายธนันท์ชัย กองแก้ว',
  signer3Position: 'หัวหน้ากลุ่มภารกิจด้านพัฒนาระบบบริการ และสนับสนุนบริการสุขภาพ',

  signer4Header: 'ได้ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ',
  signer4Name: 'นางสาวทิวารินทร์ ทองจรูญ',
  signer4Position: 'นักวิชาการเงินและบัญชี',

  signer5Header: 'คำสั่งผู้อำนวยการอนุมัติ',
  signer5Name: 'นายแพทย์มงคล ลือชูวงศ์',
  signer5Position: 'ผู้อำนวยการโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช',

  // Approval Document Form (หลักฐานการขออนุมัติขึ้นปฏิบัติงานนอกเวลาราชการ - 4 Signers)
  approvalDocumentTitle: 'หลักฐานการขออนุมัติขึ้นปฏิบัติงานนอกเวลาราชการ',
  apprSigner1Header: 'ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ',
  apprSigner1Name: 'นางสาวปพิชญา เอี้ยงหมี',
  apprSigner1Position: 'หัวหน้างานโสตทัศนศึกษา',

  apprSigner2Header: 'ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ',
  apprSigner2Name: 'นางสาวกาญจนา โลหพันธุ์',
  apprSigner2Position: 'หัวหน้ากลุ่มงานพัฒนาทรัพยากรบุคคล',

  apprSigner3Header: 'ได้ตรวจสอบแล้วถูกต้องเห็นควรพิจารณาอนุมัติ',
  apprSigner3Name: 'นายธนันท์ชัย กองแก้ว',
  apprSigner3Position: 'หัวหน้ากลุ่มภารกิจด้านพัฒนาระบบบริการ และสนับสนุนบริการสุขภาพ',

  apprSigner4Header: 'คำสั่งผู้อำนวยการอนุมัติ',
  apprSigner4Name: 'นายธนันท์ชัย กองแก้ว',
  apprSigner4Position: 'รองผู้อำนวยการฝ่ายพัฒนาระบบบริการ และสนับสนุนบริการสุขภาพ',
};

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'p1',
    name: 'นางสาว ปพิชญา เอี้ยงหมี',
    position: 'เจ้าพนักงานโสตทัศนศึกษา ชำนาญงาน',
  },
  {
    id: 'p2',
    name: 'นางสาว กนกวรรณ วงษ์กล่ำ',
    position: 'นักวิชาการโสตทัศนศึกษา',
  },
  {
    id: 'p3',
    name: 'นาย ศุภฤกษ์ เนตรแก้ว',
    position: 'นักวิชาการโสตทัศนศึกษา',
  },
  {
    id: 'p4',
    name: 'นาย กฤชณัท เทพมงคล',
    position: 'นักวิชาการโสตทัศนศึกษา',
  },
  {
    id: 'p5',
    name: 'นาย วิทวัส แปงใจ',
    position: 'พนักงานบริการ',
  },
  {
    id: 'p6',
    name: 'นาย ปรพัฒน์ ขัตวงษ์',
    position: 'พนักงานบริการ',
  },
];

export const INITIAL_SPECIAL_HOLIDAYS: SpecialHoliday[] = [
  {
    date: '2026-10-12',
    name: 'วันหยุดพิเศษ (วันที่ 12)',
  },
  {
    date: '2026-10-23',
    name: 'วันหยุดพิเศษ (วันที่ 23)',
  },
];

// Seed bookings matching the user's PDF exact figures (Total: 15,800 บาท)
export const INITIAL_BOOKINGS: ShiftBooking[] = [
  // Person 1: ปพิชญา เอี้ยงหมี (Total: 2,640)
  { officerId: 'p1', date: '2026-10-07', hours: 4 },
  { officerId: 'p1', date: '2026-10-08', hours: 4 },
  { officerId: 'p1', date: '2026-10-09', hours: 4 },
  { officerId: 'p1', date: '2026-10-10', hours: 8 },
  { officerId: 'p1', date: '2026-10-11', hours: 8 },
  { officerId: 'p1', date: '2026-10-13', hours: 4 },
  { officerId: 'p1', date: '2026-10-16', hours: 4 },
  { officerId: 'p1', date: '2026-10-20', hours: 4 },
  { officerId: 'p1', date: '2026-10-26', hours: 4 },
  { officerId: 'p1', date: '2026-10-28', hours: 4 },
  { officerId: 'p1', date: '2026-10-30', hours: 4 },

  // Person 2: กนกวรรณ วงษ์กล่ำ (Total: 2,660)
  { officerId: 'p2', date: '2026-10-04', hours: 8 },
  { officerId: 'p2', date: '2026-10-06', hours: 4 },
  { officerId: 'p2', date: '2026-10-07', hours: 4 },
  { officerId: 'p2', date: '2026-10-09', hours: 4 },
  { officerId: 'p2', date: '2026-10-13', hours: 4 },
  { officerId: 'p2', date: '2026-10-18', hours: 8 },
  { officerId: 'p2', date: '2026-10-20', hours: 4 },
  { officerId: 'p2', date: '2026-10-25', hours: 8 },
  { officerId: 'p2', date: '2026-10-26', hours: 4 },
  { officerId: 'p2', date: '2026-10-28', hours: 4 },

  // Person 3: ศุภฤกษ์ เนตรแก้ว (Total: 1,660 matching PDF)
  { officerId: 'p3', date: '2026-10-06', hours: 4 },
  { officerId: 'p3', date: '2026-10-11', hours: 8 },
  { officerId: 'p3', date: '2026-10-18', hours: 8 },
  { officerId: 'p3', date: '2026-10-24', hours: 8 },
  { officerId: 'p3', date: '2026-10-30', hours: 4 },

  // Person 4: กฤชณัท เทพมงคล (Total: 3,520)
  { officerId: 'p4', date: '2026-10-01', hours: 4 },
  { officerId: 'p4', date: '2026-10-04', hours: 8 },
  { officerId: 'p4', date: '2026-10-07', hours: 4 },
  { officerId: 'p4', date: '2026-10-11', hours: 8 },
  { officerId: 'p4', date: '2026-10-12', hours: 8 },
  { officerId: 'p4', date: '2026-10-15', hours: 4 },
  { officerId: 'p4', date: '2026-10-18', hours: 8 },
  { officerId: 'p4', date: '2026-10-19', hours: 4 },
  { officerId: 'p4', date: '2026-10-25', hours: 8 },
  { officerId: 'p4', date: '2026-10-29', hours: 4 },
  { officerId: 'p4', date: '2026-10-31', hours: 8 },

  // Person 5: วิทวัส แปงใจ (Total: 3,260)
  { officerId: 'p5', date: '2026-10-02', hours: 4 },
  { officerId: 'p5', date: '2026-10-03', hours: 8 },
  { officerId: 'p5', date: '2026-10-06', hours: 4 },
  { officerId: 'p5', date: '2026-10-08', hours: 4 },
  { officerId: 'p5', date: '2026-10-10', hours: 8 },
  { officerId: 'p5', date: '2026-10-13', hours: 4 },
  { officerId: 'p5', date: '2026-10-14', hours: 4 },
  { officerId: 'p5', date: '2026-10-15', hours: 4 },
  { officerId: 'p5', date: '2026-10-17', hours: 8 },
  { officerId: 'p5', date: '2026-10-20', hours: 4 },
  { officerId: 'p5', date: '2026-10-21', hours: 4 },
  { officerId: 'p5', date: '2026-10-26', hours: 4 },
  { officerId: 'p5', date: '2026-10-28', hours: 4 },

  // Person 6: ปรพัฒน์ ขัตวงษ์ (Total: 2,060)
  { officerId: 'p6', date: '2026-10-03', hours: 8 },
  { officerId: 'p6', date: '2026-10-09', hours: 4 },
  { officerId: 'p6', date: '2026-10-11', hours: 8 },
  { officerId: 'p6', date: '2026-10-15', hours: 4 },
  { officerId: 'p6', date: '2026-10-17', hours: 8 },
  { officerId: 'p6', date: '2026-10-21', hours: 4 },
  { officerId: 'p6', date: '2026-10-27', hours: 4 },
];
