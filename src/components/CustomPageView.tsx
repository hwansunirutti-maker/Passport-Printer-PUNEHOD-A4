import React, { useState } from 'react';
import { FileText, ArrowLeft, Edit3, Trash2, Save, X, ExternalLink, Sparkles } from 'lucide-react';
import { MenuItemConfig } from '../types';
import { PageViewBadge } from './PageViewBadge';

interface CustomPageViewProps {
  menuItem: MenuItemConfig;
  isAdmin: boolean;
  onBackToDashboard: () => void;
  onOpenCustomizer?: () => void;
  onUpdateMenuContent?: (newTitle: string, newContent: string) => void;
  onDeleteMenu?: () => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  menuItem,
  isAdmin,
  onBackToDashboard,
  onOpenCustomizer,
  onUpdateMenuContent,
  onDeleteMenu,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(menuItem.pageTitle || menuItem.label);
  const [editContent, setEditContent] = useState(menuItem.pageContent || '');

  const handleSave = () => {
    if (onUpdateMenuContent) {
      onUpdateMenuContent(editTitle.trim() || menuItem.label, editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <button
              onClick={onBackToDashboard}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าหลักแดชบอร์ด</span>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {menuItem.pageTitle || menuItem.label}
                  </h1>
                  <PageViewBadge pageId={menuItem.id} pageName={menuItem.label} isAdmin={isAdmin} />
                </div>
                <p className="text-xs text-slate-500">
                  หมวดหมู่หน้าเนื้อหาพิเศษ (Custom Menu Page)
                </p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setEditTitle(menuItem.pageTitle || menuItem.label);
                      setEditContent(menuItem.pageContent || '');
                      setIsEditing(true);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขเนื้อหา</span>
                  </button>

                  {onDeleteMenu && menuItem.isDeletable !== false && (
                    <button
                      onClick={onDeleteMenu}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      title="ลบเมนูและหน้านี้ออกจากระบบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบเมนูนี้</span>
                    </button>
                  )}

                  {onOpenCustomizer && (
                    <button
                      onClick={onOpenCustomizer}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>จัดการเมนูทั้งหมด</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>ยกเลิก</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกเนื้อหา</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Body or In-place Editor */}
        {isEditing ? (
          <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>โหมดแก้ไขเนื้อหาหน้าเว็บ (Admin Page Editor)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หัวข้อของหน้านี้
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-900"
                placeholder="ระบุหัวข้อหน้าเนื้อหา..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดและเนื้อหา (รองรับข้อความยาวและการเว้นบรรทัด)
              </label>
              <textarea
                rows={10}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed text-slate-800 font-sans"
                placeholder="พิมพ์เนื้อหา คำแนะนำ ระเบียบการใช้งาน หรือประกาศที่ต้องการแสดงในหน้านี้..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึกการเปลี่ยนแปลง</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line min-h-[160px]">
            {menuItem.pageContent ? (
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 text-slate-800 text-sm leading-relaxed">
                {menuItem.pageContent}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs">
                  ยังไม่มีข้อความเนื้อหาในหน้านี้
                </p>
                {isAdmin && (
                  <p className="text-xs text-blue-600 font-semibold">
                    คลิกปุ่ม &ldquo;แก้ไขเนื้อหา&rdquo; ด้านบนเพื่อเริ่มเขียนบทความหรือคู่มือ
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
