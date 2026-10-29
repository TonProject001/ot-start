import React, { useState } from 'react';
import {
  FileSpreadsheet,
  X,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Database
} from 'lucide-react';
import {
  APPS_SCRIPT_TEMPLATE,
  testGoogleSheetsConnection
} from '../services/googleSheetsService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
  onSyncNow: () => void;
  onLoadFromCloud: () => void;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

export const GoogleSheetsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  scriptUrl,
  onSaveScriptUrl,
  onSyncNow,
  onLoadFromCloud,
  isSyncing,
  lastSyncedAt,
}) => {
  if (!isOpen) return null;

  const [inputUrl, setInputUrl] = useState(scriptUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({ success: false, message: 'กรุณากรอก URL ของ Google Apps Script ก่อน' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testGoogleSheetsConnection(inputUrl);
    setTesting(false);
    setTestResult(res);
    if (res.success) {
      onSaveScriptUrl(inputUrl.trim());
    }
  };

  const handleSaveAndSync = () => {
    onSaveScriptUrl(inputUrl.trim());
    onSyncNow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>ฐานข้อมูลออนไลน์ Google Sheets (Apps Script)</span>
                {scriptUrl && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                    เชื่อมต่ออยู่
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">
                บันทึกและซิงค์ข้อมูลการจองเวรทั้งหมดเก็บไว้ใน Google Sheets ส่วนตัวของคุณแบบเรียลไทม์ ฟรี ไม่มีค่าใช้จ่าย
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Step Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              วิธีตั้งค่าเชื่อมต่อกับ Google Sheets ใน 3 นาที:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>
                สร้าง <strong>Google Sheets</strong> ใหม่ที่ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a>
              </li>
              <li>
                ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong>
              </li>
              <li>
                ลบโค้ดเดิมออกทั้งหมด แล้ววางโค้ดสคริปต์ที่คัดลอกจากปุ่มด้านล่างนี้
              </li>
              <li>
                กด <strong>การทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>รายการใหม่ (New deployment)</strong> &gt; เลือกประเภท <strong>เว็บแอป (Web app)</strong>
              </li>
              <li>
                ตรง <strong>ใครมีสิทธิ์เข้าถึง (Who has access)</strong> ให้เลือกเป็น <strong>ทุกคน (Anyone)</strong> แล้วกดเสร็จสิ้น
              </li>
              <li>
                คัดลอก <strong>URL ของเว็บแอป (Web App URL)</strong> มาวางในช่องด้านล่างนี้
              </li>
            </ol>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'คัดลอกโค้ดสคริปต์แล้ว!' : 'คัดลอกโค้ด Apps Script (Code.gs)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowScriptCode(!showScriptCode)}
                className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 font-medium rounded-lg transition-colors cursor-pointer text-xs"
              >
                {showScriptCode ? 'ซ่อนตัวอย่างโค้ด' : 'ดูตัวอย่างโค้ดสคริปต์'}
              </button>
            </div>

            {showScriptCode && (
              <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-lg text-[10px] max-h-48 overflow-y-auto font-mono">
                {APPS_SCRIPT_TEMPLATE}
              </pre>
            )}
          </div>

          {/* Web App URL Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              วาง Google Apps Script Web App URL:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
              <button
                type="button"
                disabled={testing || !inputUrl.trim()}
                onClick={handleTestConnection}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>ทดสอบ</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              ลิงก์ต้องลงท้ายด้วย <code className="text-slate-600 font-bold">/exec</code>
            </p>
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span className="font-medium text-xs">{testResult.message}</span>
            </div>
          )}

          {/* Cloud Sync Operations */}
          {scriptUrl && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">สถานะการเชื่อมต่อคลาวด์:</span>
                  <span className="text-slate-500 text-[11px]">
                    {lastSyncedAt ? `ซิงค์ล่าสุดเมื่อ: ${lastSyncedAt}` : 'พร้อมซิงค์ข้อมูล'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={onSyncNow}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลขึ้น Google Sheets เดี๋ยวนี้'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={onLoadFromCloud}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>ดึงข้อมูลจาก Google Sheets ลงมาที่เครื่อง</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
          >
            ปิด
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveAndSync}
              disabled={!inputUrl.trim() || isSyncing}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกและซิงค์ทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
