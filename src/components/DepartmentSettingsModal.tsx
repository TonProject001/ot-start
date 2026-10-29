import React, { useState } from 'react';
import { DepartmentConfig } from '../types';
import { X, Building2, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: DepartmentConfig;
  onSave: (config: DepartmentConfig) => void;
}

export const DepartmentSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  if (!isOpen) return null;

  const [documentTitle, setDocumentTitle] = useState(config.documentTitle || 'หลักฐานการเบิกจ่ายค่าตอบแทนการปฏิบัติงานนอกเวลาราชการ');
  const [agencyName, setAgencyName] = useState(config.agencyName);
  const [divisionName, setDivisionName] = useState(config.divisionName);

  const [signer1Name, setSigner1Name] = useState(config.signer1Name || 'นางสาวปพิชญา เอี้ยงหมี');
  const [signer1Position, setSigner1Position] = useState(config.signer1Position || 'หัวหน้างานโสตทัศนศึกษา');

  const [signer2Name, setSigner2Name] = useState(config.signer2Name || 'นางสาวกาญจนา โลหพันธุ์');
  const [signer2Position, setSigner2Position] = useState(config.signer2Position || 'หัวหน้ากลุ่มงานพัฒนาทรัพยากรบุคคล');

  const [signer3Header, setSigner3Header] = useState(config.signer3Header || 'ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ');
  const [signer3Name, setSigner3Name] = useState(config.signer3Name || 'นายธนันท์ชัย กองแก้ว');
  const [signer3Position, setSigner3Position] = useState(config.signer3Position || 'หัวหน้ากลุ่มภารกิจด้านพัฒนาระบบบริการ และสนับสนุนบริการสุขภาพ');

  const [signer4Header, setSigner4Header] = useState(config.signer4Header || 'ได้ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ');
  const [signer4Name, setSigner4Name] = useState(config.signer4Name || 'นางสาวทิวารินทร์ ทองจรูญ');
  const [signer4Position, setSigner4Position] = useState(config.signer4Position || 'นักวิชาการเงินและบัญชี');

  const [signer5Header, setSigner5Header] = useState(config.signer5Header || 'คำสั่งผู้อำนวยการอนุมัติ');
  const [signer5Name, setSigner5Name] = useState(config.signer5Name || 'นายแพทย์มงคล ลือชูวงศ์');
  const [signer5Position, setSigner5Position] = useState(config.signer5Position || 'ผู้อำนวยการโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      documentTitle,
      agencyName,
      divisionName,
      signer1Name,
      signer1Position,
      signer2Name,
      signer2Position,
      signer3Header,
      signer3Name,
      signer3Position,
      signer4Header,
      signer4Name,
      signer4Position,
      signer5Header,
      signer5Name,
      signer5Position,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">
              ตั้งค่าหัวเอกสารและผู้ลงนามในแบบฟอร์มราชการ (5 ท่าน)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่อหัวข้อเอกสาร
            </label>
            <input
              type="text"
              required
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อส่วนราชการ / โรงพยาบาล
              </label>
              <input
                type="text"
                required
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่องาน / กลุ่มงาน / ฝ่าย
              </label>
              <input
                type="text"
                required
                value={divisionName}
                onChange={(e) => setDivisionName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">ข้อมูลผู้ลงนาม 5 ตำแหน่ง (ตามเอกสารทางการ):</h4>

            {/* Signer 1 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-blue-700">ลำดับที่ 1: หัวหน้างาน</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={signer1Name}
                  onChange={(e) => setSigner1Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={signer1Position}
                  onChange={(e) => setSigner1Position(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Signer 2 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-blue-700">ลำดับที่ 2: หัวหน้ากลุ่มงาน</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={signer2Name}
                  onChange={(e) => setSigner2Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={signer2Position}
                  onChange={(e) => setSigner2Position(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Signer 3 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700">ลำดับที่ 3: หัวหน้ากลุ่มภารกิจ / หัวหน้าฝ่าย</span>
                <input
                  type="text"
                  placeholder="ข้อความกำกับบนลายเซ็น"
                  value={signer3Header}
                  onChange={(e) => setSigner3Header(e.target.value)}
                  className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded text-slate-600 w-1/2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={signer3Name}
                  onChange={(e) => setSigner3Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={signer3Position}
                  onChange={(e) => setSigner3Position(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Signer 4 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700">ลำดับที่ 4: นักวิชาการเงินและบัญชี</span>
                <input
                  type="text"
                  placeholder="ข้อความกำกับบนลายเซ็น"
                  value={signer4Header}
                  onChange={(e) => setSigner4Header(e.target.value)}
                  className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded text-slate-600 w-1/2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={signer4Name}
                  onChange={(e) => setSigner4Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={signer4Position}
                  onChange={(e) => setSigner4Position(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Signer 5 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700">ลำดับที่ 5: ผู้อำนวยการโรงพยาบาล</span>
                <input
                  type="text"
                  placeholder="ข้อความกำกับบนลายเซ็น"
                  value={signer5Header}
                  onChange={(e) => setSigner5Header(e.target.value)}
                  className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded text-slate-600 w-1/2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={signer5Name}
                  onChange={(e) => setSigner5Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={signer5Position}
                  onChange={(e) => setSigner5Position(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
