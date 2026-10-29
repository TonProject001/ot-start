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

export interface DepartmentConfig {
  documentTitle: string; // "หลักฐานการเบิกจ่ายค่าตอบแทนการปฏิบัติงานนอกเวลาราชการ"
  agencyName: string; // e.g. "โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช"
  divisionName: string; // e.g. "งานโสตทัศนศึกษา กลุ่มงานพัฒนาทรัพยากรบุคคล"
  
  // 5 Official Signatures matching the official document
  signer1Name: string; // "นางสาวปพิชญา เอี้ยงหมี"
  signer1Position: string; // "หัวหน้างานโสตทัศนศึกษา"

  signer2Name: string; // "นางสาวกาญจนา โลหพันธุ์"
  signer2Position: string; // "หัวหน้ากลุ่มงานพัฒนาทรัพยากรบุคคล"

  signer3Header: string; // "ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ"
  signer3Name: string; // "นายธนันท์ชัย กองแก้ว"
  signer3Position: string; // "หัวหน้ากลุ่มภารกิจด้านพัฒนาระบบบริการและสนับสนุนบริการสุขภาพ"

  signer4Header: string; // "ได้ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ"
  signer4Name: string; // "นางสาวทิวารินทร์ ทองจรูญ"
  signer4Position: string; // "นักวิชาการเงินและบัญชี"

  signer5Header: string; // "คำสั่งผู้อำนวยการอนุมัติ"
  signer5Name: string; // "นายแพทย์มงคล ลือชูวงศ์"
  signer5Position: string; // "ผู้อำนวยการโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช"
}
