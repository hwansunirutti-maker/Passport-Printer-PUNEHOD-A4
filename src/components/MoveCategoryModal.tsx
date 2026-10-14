import React, { useState, useEffect } from 'react';
import { 
  FolderInput, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Cpu, 
  Wrench, 
  Layers, 
  Video, 
  Folder,
  FileText
} from 'lucide-react';
import { PrinterFile, CategoryConfig } from '../types';

interface MoveCategoryModalProps {
  isOpen: boolean;
  file: PrinterFile | null;
  onClose: () => void;
  onConfirmMove: (fileId: string, targetCategory: string) => void;
  availableCategories?: CategoryConfig[];
}

export const MoveCategoryModal: React.FC<MoveCategoryModalProps> = ({
  isOpen,
  file,
  onClose,
  onConfirmMove,
  availableCategories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const defaultCategories: CategoryConfig[] = [
    { id: 'manual', label: 'คู่มือการใช้งาน' },
    { id: 'driver/software', label: 'ไดร์เวอร์/ซอฟต์แวร์' },
    { id: 'troubleshooting', label: 'การแก้ไขปัญหา' },
    { id: 'Maintenance', label: 'การบำรุงรักษา' },
    { id: 'video', label: 'วิดีโอสาธิต&การใช้งาน' },
  ];

  const categories = availableCategories && availableCategories.length > 0
    ? availableCategories.filter(c => c.id !== 'all')
    : defaultCategories;

  // Find category label or id
  const findCategory = (catIdOrLabel: string) => {
    if (!catIdOrLabel) return null;
    const lower = catIdOrLabel.toLowerCase().trim();
    return categories.find(
      c => c.id.toLowerCase().trim() === lower || c.label.toLowerCase().trim() === lower
    );
  };

  const currentCatObj = file ? findCategory(file.category) : null;
  const currentCategoryLabel = currentCatObj ? currentCatObj.label : (file?.category || 'ไม่ระบุ');
  const currentCategoryId = currentCatObj ? currentCatObj.id : (file?.category || '');

  // Initialize selectedCategory to first other category when opened
  useEffect(() => {
    if (isOpen && file) {
      const otherCat = categories.find(c => c.id !== currentCategoryId && c.label !== currentCategoryLabel);
      setSelectedCategory(otherCat ? otherCat.id : '');
    }
  }, [isOpen, file, currentCategoryId, currentCategoryLabel]);

  if (!isOpen || !file) return null;

  const getCategoryIcon = (id: string) => {
    const lower = id.toLowerCase();
    if (lower.includes('manual') || lower.includes('คู่มือ')) {
      return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
    if (lower.includes('driver') || lower.includes('software') || lower.includes('ไดร์เวอร์')) {
      return <Cpu className="w-5 h-5 text-indigo-600" />;
    }
    if (lower.includes('troubleshoot') || lower.includes('ปัญหา')) {
      return <Wrench className="w-5 h-5 text-amber-600" />;
    }
    if (lower.includes('maintenance') || lower.includes('บำรุง')) {
      return <Layers className="w-5 h-5 text-emerald-600" />;
    }
    if (lower.includes('video') || lower.includes('วิดีโอ')) {
      return <Video className="w-5 h-5 text-rose-600" />;
    }
    return <Folder className="w-5 h-5 text-purple-600" />;
  };

  const handleConfirm = () => {
    if (!selectedCategory || selectedCategory === currentCategoryId) return;
    onConfirmMove(file.id, selectedCategory);
    onClose();
  };

  const selectedCatObj = categories.find(c => c.id === selectedCategory);
  const isSameCategory = selectedCategory === currentCategoryId || selectedCatObj?.label === currentCategoryLabel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                ย้ายหมวดหมู่คู่มือ / ไฟล์
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                เลือกหมวดหมู่ปลายทางที่ต้องการให้เอกสารนี้แสดงผล
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* File Overview Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>เอกสารที่จะย้าย</span>
            </div>
            <div className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
              {file.title}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
              <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                {file.fileName}
              </span>
              <span>·</span>
              <span>ขนาด: {file.fileSize}</span>
            </div>
          </div>

          {/* Current Category -> Destination Preview Banner */}
          <div className="flex items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs sm:text-sm">
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">หมวดปัจจุบัน</div>
              <div className="font-bold text-slate-800 truncate">{currentCategoryLabel}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mx-2">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="text-right min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">ย้ายไปยังหมวด</div>
              <div className="font-bold text-indigo-700 truncate">
                {selectedCatObj ? selectedCatObj.label : 'กรุณาเลือกหมวด'}
              </div>
            </div>
          </div>

          {/* Category Selection Grid */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-700">
              เลือกหมวดหมู่ปลายทางใหม่
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isCurrent = cat.id === currentCategoryId || cat.label === currentCategoryLabel;
                const isSelected = cat.id === selectedCategory;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100'
                      }`}>
                        {isSelected ? <CheckCircle2 className="w-5 h-5" /> : getCategoryIcon(cat.id)}
                      </div>
                      <div>
                        <div className={`text-sm font-bold leading-snug ${
                          isSelected ? 'text-indigo-950 font-extrabold' : isCurrent ? 'text-slate-500' : 'text-slate-800'
                        }`}>
                          {cat.label}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          ID: {cat.id}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isCurrent && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                          หมวดเดิม
                        </span>
                      )}
                      {isSelected && !isCurrent && (
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          เลือกหมวดนี้
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={!selectedCategory || isSameCategory}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
              !selectedCategory || isSameCategory
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <FolderInput className="w-4 h-4" />
            <span>ยืนยันการย้ายหมวดหมู่</span>
          </button>
        </div>
      </div>
    </div>
  );
};
