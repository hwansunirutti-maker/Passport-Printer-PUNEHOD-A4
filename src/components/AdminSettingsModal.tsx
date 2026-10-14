import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { SiteConfig } from '../types';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  onSaveConfig: (cfg: SiteConfig) => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  onSaveConfig,
}) => {
  const [siteTitle, setSiteTitle] = useState(siteConfig.siteTitle);
  const [siteSubtitle, setSiteSubtitle] = useState(siteConfig.siteSubtitle || '');
  const [heroTitle, setHeroTitle] = useState(siteConfig.heroTitle || '');
  const [heroSubtitle, setHeroSubtitle] = useState(siteConfig.heroSubtitle || '');
  const [heroImageUrl, setHeroImageUrl] = useState(siteConfig.heroImageUrl || '');
  const [announcement, setAnnouncement] = useState(siteConfig.announcement);
  const [allowPublicUploads, setAllowPublicUploads] = useState(siteConfig.allowPublicUploads);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...siteConfig,
      siteTitle,
      siteSubtitle,
      heroTitle,
      heroSubtitle,
      heroImageUrl: heroImageUrl.trim() || undefined,
      announcement,
      allowPublicUploads,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-inner">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                ตั้งค่าระบบและหน้าเว็บไซต์ (Admin Settings)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                ปรับแต่งข้อความประกาศ รูปแบนเนอร์ และการอนุญาตอัพโหลด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4 max-h-[80vh] overflow-y-auto">
          {isSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              ชื่อระบบ / หัวข้อเว็บไซต์
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              คำโปรยย่อยของระบบ
            </label>
            <input
              type="text"
              value={siteSubtitle}
              onChange={(e) => setSiteSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              หัวข้อแบนเนอร์หลัก (Hero Title)
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              ลิงก์ URL รูปภาพบนแบนเนอร์ (Hero Image URL)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="/src/assets/images/punehod_passport_printer_1790838446659.jpg หรือ URL https://..."
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              ข้อความประกาศสำคัญแถบด้านบน (Announcement Banner)
            </label>
            <textarea
              rows={2}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="ข้อความแจ้งเตือนผู้ใช้งาน เช่น อัปเดตไดร์เวอร์ใหม่ หรือรอบการบำรุงรักษา..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* System Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  เปิดให้ผู้ใช้งานทั่วไปสามารถอัพโหลดไฟล์ได้
                </span>
                <span className="text-xs text-slate-500">
                  หากปิด จะอนุญาตให้เฉพาะผู้ดูแลระบบเป็นผู้อัพโหลดไฟล์เท่านั้น
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowPublicUploads}
                onChange={(e) => setAllowPublicUploads(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
