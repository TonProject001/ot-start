import React, { useState } from 'react';
import { Officer } from '../types';
import { UserCheck, Plus, Trash2, Edit2, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  officers: Officer[];
  selectedOfficerId: string;
  onSelectOfficer: (id: string) => void;
  onAddOfficer: (name: string, position: string) => void;
  onUpdateOfficer: (id: string, name: string, position: string) => void;
  onDeleteOfficer: (id: string) => void;
  onNext: () => void;
}

export const Step1SelectOfficer: React.FC<Props> = ({
  officers,
  selectedOfficerId,
  onSelectOfficer,
  onAddOfficer,
  onUpdateOfficer,
  onDeleteOfficer,
  onNext,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPosition.trim()) return;
    onAddOfficer(newName.trim(), newPosition.trim());
    setNewName('');
    setNewPosition('');
    setShowAddForm(false);
  };

  const startEdit = (o: Officer) => {
    setEditingId(o.id);
    setEditName(o.name);
    setEditPosition(o.position);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim() || !editPosition.trim()) return;
    onUpdateOfficer(id, editName.trim(), editPosition.trim());
    setEditingId(null);
  };

  const selectedOfficer = officers.find((o) => o.id === selectedOfficerId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-2">
            <span>ขั้นตอนที่ 1 จาก 5</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            เลือกชื่อของตนเองเพื่อใช้ในการจองเวร
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            กรุณาเลือกชื่อผู้ปฏิบัติงานที่ต้องการบันทึกการขออนุมัติขึ้นเวรนอกเวลาราชการ
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'ปิดแบบฟอร์ม' : 'เพิ่มรายชื่อใหม่'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-slate-50 border border-blue-200 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" /> เพิ่มบุคลากรผู้ปฏิบัติงาน
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">คำนำหน้า ชื่อ-สกุล</label>
              <input
                type="text"
                required
                placeholder="เช่น นาย สมชาย ใจดี หรือ นางสาว..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ตำแหน่ง</label>
              <input
                type="text"
                required
                placeholder="เช่น นักวิชาการโสตทัศนศึกษา / พนักงานบริการ"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              บันทึกรายชื่อ
            </button>
          </div>
        </form>
      )}

      {/* Grid of officers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {officers.map((officer) => {
          const isSelected = officer.id === selectedOfficerId;
          const isEditing = editingId === officer.id;

          if (isEditing) {
            return (
              <div key={officer.id} className="p-4 rounded-xl border border-blue-400 bg-blue-50/40">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-white border border-slate-300 rounded mb-2 font-medium"
                  placeholder="ชื่อ-สกุล"
                />
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded mb-3 text-slate-600"
                  placeholder="ตำแหน่ง"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => handleSaveEdit(officer.id)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={officer.id}
              onClick={() => onSelectOfficer(officer.id)}
              className={`p-4 rounded-xl border transition-all text-left relative cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    {isSelected && <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                    <h4 className="font-semibold text-slate-900 text-sm">{officer.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{officer.position}</p>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    title="แก้ไขรายชื่อ"
                    onClick={() => startEdit(officer)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-200/60"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {officers.length > 1 && (
                    <button
                      title="ลบรายชื่อ"
                      onClick={() => onDeleteOfficer(officer.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-200/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>เลือกบุคคลนี้แล้ว</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="text-sm text-slate-600">
          ผู้ใช้งานปัจจุบัน:{' '}
          <span className="font-semibold text-blue-700">
            {selectedOfficer ? `${selectedOfficer.name} (${selectedOfficer.position})` : 'ยังไม่ได้เลือก'}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={!selectedOfficerId}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>ขั้นตอนที่ 2: เลือกเดือน</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
