import React, { useState } from 'react';
import { DepartmentConfig } from '../types';
import { X, Building2, Save, CheckCircle2 } from 'lucide-react';

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

  // General config
  const [agencyName, setAgencyName] = useState(config.agencyName);
  const [divisionName, setDivisionName] = useState(config.divisionName);

  // Approval Form (4 Signers Standard)
  const [approvalDocumentTitle, setApprovalDocumentTitle] = useState(
    config.approvalDocumentTitle || 'หลักฐานการขออนุมัติขึ้นปฏิบัติงานนอกเวลาราชการ'
  );
  const [apprSigner1Header, setApprSigner1Header] = useState(
    config.apprSigner1Header || 'ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ'
  );
  const [apprSigner1Name, setApprSigner1Name] = useState(
    config.apprSigner1Name || 'นางสาวปพิชญา เอี้ยงหมี'
  );
  const [apprSigner1Position, setApprSigner1Position] = useState(
    config.apprSigner1Position || 'หัวหน้างานโสตทัศนศึกษา'
  );

  const [apprSigner2Header, setApprSigner2Header] = useState(
    config.apprSigner2Header || 'ตรวจสอบแล้วถูกต้องเห็นควรอนุมัติ'
  );
  const [apprSigner2Name, setApprSigner2Name] = useState(
    config.apprSigner2Name || 'นางสาวกาญจนา โลหพันธุ์'
  );
  const [apprSigner2Position, setApprSigner2Position] = useState(
    config.apprSigner2Position || 'หัวหน้ากลุ่มงานพัฒนาทรัพยากรบุคคล'
  );

  const [apprSigner3Header, setApprSigner3Header] = useState(
    config.apprSigner3Header || 'ได้ตรวจสอบแล้วถูกต้องเห็นควรพิจารณาอนุมัติ'
  );
  const [apprSigner3Name, setApprSigner3Name] = useState(
    config.apprSigner3Name || 'นายธนันท์ชัย กองแก้ว'
  );
  const [apprSigner3Position, setApprSigner3Position] = useState(
    config.apprSigner3Position || 'หัวหน้ากลุ่มภารกิจด้านพัฒนาระบบบริการ และสนับสนุนบริการสุขภาพ'
  );

  const [apprSigner4Header, setApprSigner4Header] = useState(
    config.apprSigner4Header || 'คำสั่งผู้อำนวยการอนุมัติ'
  );
  const [apprSigner4Name, setApprSigner4Name] = useState(
    config.apprSigner4Name || 'นายธนันท์ชัย กองแก้ว'
  );
  const [apprSigner4Position, setApprSigner4Position] = useState(
    config.apprSigner4Position || 'รองผู้อำนวยการฝ่ายพัฒนาระบบบริการ และสนับสนุนบริการสุขภาพ'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      approvalDocumentTitle,
      agencyName,
      divisionName,
      apprSigner1Header,
      apprSigner1Name,
      apprSigner1Position,
      apprSigner2Header,
      apprSigner2Name,
      apprSigner2Position,
      apprSigner3Header,
      apprSigner3Name,
      apprSigner3Position,
      apprSigner4Header,
      apprSigner4Name,
      apprSigner4Position,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ตั้งค่าหัวเอกสารและผู้ลงนามในตารางขออนุมัติฯ (4 ท่าน)
              </h3>
              <p className="text-[11px] text-slate-500">
                กำหนดชื่อหน่วยงาน หัวข้อเอกสาร และรายชื่อผู้ลงนาม 4 ตำแหน่งตามแบบฟอร์มมาตรฐาน
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่อหัวข้อเอกสาร (ตารางขออนุมัติ)
            </label>
            <input
              type="text"
              required
              value={approvalDocumentTitle}
              onChange={(e) => setApprovalDocumentTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>ข้อมูลผู้มีอำนาจลงนาม 4 ท่าน (ตามแบบฟอร์มมาตรฐาน):</span>
            </h4>

            {/* Appr Signer 1 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700">ลำดับที่ 1: หัวหน้างานโสตทัศนศึกษา</span>
                <input
                  type="text"
                  placeholder="ข้อความกำกับบนลายเซ็น"
                  value={apprSigner1Header}
                  onChange={(e) => setApprSigner1Header(e.target.value)}
                  className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded text-slate-600 w-1/2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={apprSigner1Name}
                  onChange={(e) => setApprSigner1Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={apprSigner1Position}
                  onChange={(e) => setApprSigner1Position(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Appr Signer 2 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700">ลำดับที่ 2: หัวหน้ากลุ่มงานพัฒนาทรัพยากรบุคคล</span>
                <input
                  type="text"
                  placeholder="ข้อความกำกับบนลายเซ็น"
                  value={apprSigner2Header}
                  onChange={(e) => setApprSigner2Header(e.target.value)}
                  className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded text-slate-600 w-1/2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={apprSigner2Name}
                  onChange={(e) => setApprSigner2Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={apprSigner2Position}
                  onChange={(e) => setApprSigner2Position(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Appr Signer 3 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700">ลำดับที่ 3: หัวหน้ากลุ่มภารกิจด้านพัฒนาระบบบริการ</span>
                <input
                  type="text"
                  placeholder="ข้อความกำกับบนลายเซ็น"
                  value={apprSigner3Header}
                  onChange={(e) => setApprSigner3Header(e.target.value)}
                  className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded text-slate-600 w-1/2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={apprSigner3Name}
                  onChange={(e) => setApprSigner3Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={apprSigner3Position}
                  onChange={(e) => setApprSigner3Position(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Appr Signer 4 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700">ลำดับที่ 4: คำสั่งผู้อำนวยการอนุมัติ (รอง ผอ.)</span>
                <input
                  type="text"
                  placeholder="ข้อความกำกับบนลายเซ็น"
                  value={apprSigner4Header}
                  onChange={(e) => setApprSigner4Header(e.target.value)}
                  className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded text-slate-600 w-1/2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={apprSigner4Name}
                  onChange={(e) => setApprSigner4Name(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ตำแหน่ง"
                  value={apprSigner4Position}
                  onChange={(e) => setApprSigner4Position(e.target.value)}
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
