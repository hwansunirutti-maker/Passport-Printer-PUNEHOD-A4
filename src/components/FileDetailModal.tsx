import React, { useState } from 'react';
import { 
  X, 
  Download, 
  User, 
  Trash2, 
  Edit3, 
  Save,
  Pin,
  PinOff,
  Video,
  FolderInput
} from 'lucide-react';
import { PrinterFile, PrinterFileCategory, CategoryConfig } from '../types';
import { isMyFile } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';
import { MoveCategoryModal } from './MoveCategoryModal';

interface FileDetailModalProps {
  file: PrinterFile | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  availableCategories?: CategoryConfig[];
  onDownloadFile: (file: PrinterFile) => void;
  onUpdateFile?: (file: PrinterFile) => void;
  onDeleteFile?: (fileId: string) => void;
  onTogglePin?: (fileId: string) => void;
  onMoveCategory?: (fileId: string, newCategory: string) => void;
}

export const FileDetailModal: React.FC<FileDetailModalProps> = ({
  file,
  isOpen,
  onClose,
  isAdmin,
  availableCategories,
  onDownloadFile,
  onUpdateFile,
  onDeleteFile,
  onTogglePin,
  onMoveCategory,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isMoveCategoryOpen, setIsMoveCategoryOpen] = useState(false);

  // Dynamic Categories List
  const categoriesList = availableCategories && availableCategories.length > 0
    ? availableCategories.filter(c => c.id !== 'all')
    : [
        { id: 'manual', label: 'คู่มือการใช้งาน' },
        { id: 'driver/software', label: 'ไดร์เวอร์/ซอฟต์แวร์' },
        { id: 'troubleshooting', label: 'การแก้ไขปัญหา' },
        { id: 'Maintenance', label: 'การบำรุงรักษา' },
        { id: 'video', label: 'วิดีโอสาธิต&การใช้งาน' },
      ];

  // Expanded Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<PrinterFileCategory>('manual');
  const [editUploaderName, setEditUploaderName] = useState('');
  const [editFileSize, setEditFileSize] = useState('');
  const [editIsOfficial, setEditIsOfficial] = useState(false);
  const [editIsPinned, setEditIsPinned] = useState(false);

  if (!isOpen || !file) return null;

  const isOwner = isMyFile(file);
  const canManage = isAdmin || isOwner;

  const handleStartEdit = () => {
    setEditTitle(file.title);
    setEditDescription(file.description);

    // Resolve matching category ID in categoriesList if stored as label or legacy id
    const foundCat = categoriesList.find(
      c => c.id.toLowerCase() === file.category?.toLowerCase() || c.label.toLowerCase() === file.category?.toLowerCase()
    );
    setEditCategory(foundCat ? foundCat.id : file.category);

    setEditUploaderName(file.uploaderName);
    setEditFileSize(file.fileSize);
    setEditIsOfficial(!!file.isOfficial);
    setEditIsPinned(!!file.isPinned);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateFile) {
      onUpdateFile({
        ...file,
        title: editTitle.trim() || file.title,
        description: editDescription.trim() || file.description,
        category: editCategory,
        uploaderName: editUploaderName.trim() || file.uploaderName,
        fileSize: editFileSize.trim() || file.fileSize,
        isOfficial: isAdmin ? editIsOfficial : file.isOfficial,
        isPinned: isAdmin ? editIsPinned : file.isPinned,
      });
    }
    setIsEditing(false);
  };

  const isVideoFile = !!file.fileUrl && (
    file.fileType?.match(/(mp4|mov|webm|mkv|avi|video)/i) || 
    file.category === 'video' || 
    file.fileName?.match(/\.(mp4|mov|webm|mkv|avi)$/i)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-400 font-mono">
              <span className="uppercase font-bold">{file.category}</span>
              <span>·</span>
              <span>{file.fileSize}</span>
              {file.isOfficial && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">ทางการ (OFFICIAL)</span>
                </>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold leading-snug">
              {file.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Uploader Card (เอาเบอร์โทรและช่องทางการติดต่อออก) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">ข้อมูลผู้เผยแพร่</span>
                {isOwner && (
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    ไฟล์ของคุณ
                  </span>
                )}
              </div>
              <span className="tabular-nums">
                วันที่ส่ง: {new Date(file.uploadDate).toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-slate-500">ผู้เผยแพร่ข้อมูล</div>
                <div className="text-base sm:text-xl font-bold text-slate-900">
                  {file.uploaderName}
                </div>
              </div>
            </div>
          </div>

          {/* Video Player (หากเป็นไฟล์วิดีโอ) */}
          {isVideoFile && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-600">
                <Video className="w-4 h-4" />
                <span>วิดีโอสาธิตและขั้นตอนการทำงาน</span>
              </div>
              <div className="bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                <video
                  controls
                  src={file.fileUrl}
                  className="w-full max-h-80 object-contain mx-auto"
                >
                  เบราว์เซอร์ไม่รองรับการเล่นวิดีโอ
                </video>
              </div>
            </div>
          )}

          {/* Full Edit Mode (สำหรับ Admin หรือ เจ้าของไฟล์ที่อัพโหลด) */}
          {isEditing ? (
            <div className="space-y-4 bg-amber-50/70 border border-amber-200 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-sm font-bold text-amber-900 border-b border-amber-200 pb-2.5">
                <span>แก้ไขข้อมูลไฟล์ {isOwner && !isAdmin ? '(ไฟล์ของคุณ)' : '(สิทธิ์ผู้ดูแลระบบ)'}</span>
                <span className="text-xs text-amber-700 font-normal">แก้ไขและบันทึกได้ทันที</span>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  ชื่อเอกสาร / ไดร์เวอร์
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    หมวดหมู่
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as PrinterFileCategory)}
                    className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    ขนาดไฟล์แสดงผล
                  </label>
                  <input
                    type="text"
                    value={editFileSize}
                    onChange={(e) => setEditFileSize(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  ชื่อผู้ส่ง / เจ้าของไฟล์
                </label>
                <input
                  type="text"
                  value={editUploaderName}
                  onChange={(e) => setEditUploaderName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  คำอธิบายและข้อแนะนำในการติดตั้ง
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsOfficial}
                    onChange={(e) => setEditIsOfficial(e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span>กำหนดเป็นไฟล์ทางการ (Official)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsPinned}
                    onChange={(e) => setEditIsPinned(e.target.checked)}
                    className="rounded text-amber-600 w-4 h-4"
                  />
                  <span>ปักหมุดไฟล์ไว้บนสุด (Pinned)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                  คำอธิบายและข้อแนะนำในการติดตั้ง
                </h4>
                <div className="text-sm sm:text-base text-slate-800 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 leading-relaxed whitespace-pre-line">
                  {file.description}
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  ข้อมูลของไฟล์
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-xs">ชื่อไฟล์</span>
                    <span className="font-mono text-slate-800 font-bold truncate block mt-0.5" title={file.fileName}>
                      {file.fileName}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-xs">ขนาดไฟล์</span>
                    <span className="font-mono text-slate-800 font-bold block mt-0.5 tabular-nums">
                      {file.fileSize}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-xs">ดาวน์โหลดแล้ว</span>
                    <span className="font-mono text-blue-600 font-bold block mt-0.5 tabular-nums">
                      {file.downloadCount} ครั้ง
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canManage && !isEditing && (
              <>
                {isAdmin && onMoveCategory && (
                  <button
                    type="button"
                    onClick={() => setIsMoveCategoryOpen(true)}
                    className="px-3.5 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="ย้ายคู่มือไปยังหมวดอื่น"
                  >
                    <FolderInput className="w-4 h-4" />
                    <span>ย้ายหมวดหมู่</span>
                  </button>
                )}

                <button
                  onClick={handleStartEdit}
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={isOwner && !isAdmin ? 'แก้ไขไฟล์ที่คุณอัพโหลด' : 'แก้ไขข้อมูลไฟล์'}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>แก้ไขข้อมูลไฟล์{isOwner && !isAdmin ? ' (ของคุณ)' : ''}</span>
                </button>

                {isAdmin && onTogglePin && (
                  <button
                    onClick={() => onTogglePin(file.id)}
                    className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {file.isPinned ? <PinOff className="w-4 h-4 text-amber-600" /> : <Pin className="w-4 h-4" />}
                    <span>{file.isPinned ? 'ถอนหมุด' : 'ปักหมุด'}</span>
                  </button>
                )}

                {onDeleteFile && (
                  <button
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="px-3.5 py-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title={isOwner && !isAdmin ? 'ลบไฟล์ของคุณออกจากระบบ' : 'ลบไฟล์'}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ลบไฟล์{isOwner && !isAdmin ? 'ของคุณ' : ''}</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            <button
              onClick={() => onDownloadFile(file)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm sm:text-base font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ทันที</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="ยืนยันการลบไฟล์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ "${file.title}" ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ยืนยันลบไฟล์"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          onDeleteFile?.(file.id);
          setIsConfirmDeleteOpen(false);
          onClose();
        }}
        onClose={() => setIsConfirmDeleteOpen(false)}
      />

      {/* Move Category Modal for Admin */}
      <MoveCategoryModal
        isOpen={isMoveCategoryOpen}
        file={file}
        onClose={() => setIsMoveCategoryOpen(false)}
        onConfirmMove={(fileId, targetCat) => {
          onMoveCategory?.(fileId, targetCat);
          setIsMoveCategoryOpen(false);
        }}
        availableCategories={availableCategories}
      />
    </div>
  );
};
