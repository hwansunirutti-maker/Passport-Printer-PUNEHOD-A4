import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Upload, 
  FileUp, 
  CheckCircle2, 
  User, 
  Info,
  ShieldCheck,
  Pin,
  Video
} from 'lucide-react';
import { PrinterFile, PrinterFileCategory, CategoryConfig, AdminUser } from '../types';
import { LAST_UPLOADER_KEY } from '../utils/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitUpload: (fileData: Omit<PrinterFile, 'id' | 'uploadDate' | 'downloadCount' | 'status'>) => void;
  isAdmin?: boolean;
  availableCategories?: CategoryConfig[];
  defaultCategory?: string;
  currentUser?: AdminUser | null;
  onRequireLogin?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitUpload,
  isAdmin = false,
  availableCategories,
  defaultCategory,
  currentUser = null,
  onRequireLogin,
}) => {
  const categoriesList = useMemo(() => {
    if (availableCategories && availableCategories.length > 0) {
      return availableCategories.filter(c => c.id !== 'all');
    }
    return [
      { id: 'manual', label: 'คู่มือการใช้งาน' },
      { id: 'driver/software', label: 'ไดร์เวอร์/ซอฟต์แวร์' },
      { id: 'troubleshooting', label: 'การแก้ไขปัญหา' },
      { id: 'Maintenance', label: 'การบำรุงรักษา' },
      { id: 'video', label: 'วิดีโอสาธิต&การใช้งาน' },
    ];
  }, [availableCategories]);

  // Only uploaderName - default to logged in user display name
  const [uploaderName, setUploaderName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PrinterFileCategory>(categoriesList[0]?.id || 'manual');
  const [description, setDescription] = useState('');
  const [isOfficial, setIsOfficial] = useState(isAdmin);
  const [isPinned, setIsPinned] = useState(false);

  // Sync category & uploader name when opened
  useEffect(() => {
    if (isOpen) {
      if (defaultCategory && defaultCategory !== 'all') {
        const found = categoriesList.find(
          c => c.id.toLowerCase() === defaultCategory.toLowerCase() || c.label.toLowerCase() === defaultCategory.toLowerCase()
        );
        if (found) {
          setCategory(found.id);
        } else if (categoriesList.length > 0) {
          setCategory(categoriesList[0].id);
        }
      } else if (!categoriesList.some(c => c.id === category)) {
        if (categoriesList.length > 0) {
          setCategory(categoriesList[0].id);
        }
      }

      if (currentUser) {
        setUploaderName(currentUser.displayName || currentUser.username);
        setIsOfficial(isAdmin);
      } else if (!isAdmin) {
        try {
          const last = localStorage.getItem(LAST_UPLOADER_KEY);
          if (last && !['admin', 'ผู้ดูแลระบบ', 'ผู้ดูแลระบบ (admin)'].includes(last.trim().toLowerCase())) {
            setUploaderName(last);
          }
        } catch {
          // ignore
        }
      } else {
        setUploaderName('ผู้ดูแลระบบ (Admin)');
        setIsOfficial(true);
      }
    }
  }, [isOpen, defaultCategory, categoriesList, isAdmin, currentUser]);
  
  // Real attached file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.size <= 25 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const autofillAdminDetails = () => {
    setUploaderName('ทีมผู้ดูแลระบบ PUNEHOD TH');
    setIsOfficial(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate uploader name
    if (!uploaderName.trim()) {
      newErrors.uploaderName = 'กรุณาระบุชื่อผู้เผยแพร่ข้อมูล หรือชื่อผู้ติดต่อ';
    }

    // Validate file info
    if (!title.trim()) {
      newErrors.title = 'กรุณาระบุชื่อคู่มือ หรือชื่อไดร์เวอร์';
    }
    if (!description.trim()) {
      newErrors.description = 'กรุณาระบุคำอธิบายหรือวิธีการติดตั้งสังเขป';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const ext = selectedFile ? selectedFile.name.split('.').pop() || 'bin' : 'pdf';
    const sizeBytes = selectedFile ? selectedFile.size : 4500000;
    const sizeStr = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
    const fileName = selectedFile ? selectedFile.name : `${title.replace(/\s+/g, '_')}.${ext}`;

    const filePayload = {
      title: title.trim(),
      category,
      fileType: ext.toLowerCase(),
      fileName,
      fileSize: sizeStr,
      fileSizeBytes: sizeBytes,
      description: description.trim(),
      uploaderName: uploaderName.trim(),
      uploaderPhone: '-',
      uploaderContactExtra: undefined,
      fileUrl: fileDataUrl || undefined,
      checksum: Math.random().toString(16).substring(2, 10),
      isOfficial,
      isPinned,
    };

    if (!isAdmin && uploaderName.trim()) {
      try {
        localStorage.setItem(LAST_UPLOADER_KEY, uploaderName.trim());
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      onSubmitUpload(filePayload);
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {isAdmin ? 'เพิ่มไฟล์เข้าสู่ระบบ (สิทธิ์ผู้ดูแลระบบ)' : 'อัพโหลดคู่มือ & ไดร์เวอร์เข้าสู่ระบบ'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                ร่วมแบ่งปันข้อมูลสำหรับเครื่องพิมพ์ Passport Printer PUNEHOD A4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Admin Autofill Quick Button */}
          {isAdmin && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>เพิ่มไฟล์ในฐานะผู้ดูแลระบบทางการ</span>
              </div>
              <button
                type="button"
                onClick={autofillAdminDetails}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                ใส่ข้อมูลแอดมินอัตโนมัติ
              </button>
            </div>
          )}

          {/* Section: Uploader Name */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-blue-900">
                <User className="w-5 h-5 text-blue-700" />
                <span>ข้อมูลผู้เผยแพร่ข้อมูล</span>
              </div>
              {isAdmin && currentUser && (
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>ผู้ดูแลระบบ: {currentUser.displayName}</span>
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                ชื่อ-นามสกุล / ชื่อผู้เผยแพร่ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => {
                  setUploaderName(e.target.value);
                  if (errors.uploaderName) setErrors({ ...errors, uploaderName: '' });
                }}
                placeholder="เช่น สมชาย ใจดี"
                className={`w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.uploaderName ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.uploaderName && (
                <p className="text-xs text-red-600 mt-1">{errors.uploaderName}</p>
              )}
            </div>
          </div>

          {/* Section: File Attachment Zone (รองรับทั้งเอกสาร ไดร์เวอร์ และวิดีโอ) */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              ไฟล์เอกสาร / โปรแกรมติดตั้ง / วิดีโอสาธิต (PDF, MP4, MOV, WEBM, ZIP, EXE)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.mp4,.mov,.webm,.mkv,.avi,.zip,.rar,.7z,.exe,.dmg,.icc,.icm,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedFile.type.startsWith('video/') || selectedFile.name.match(/\.(mp4|mov|webm|mkv|avi)$/i)
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {selectedFile.type.startsWith('video/') || selectedFile.name.match(/\.(mp4|mov|webm|mkv|avi)$/i) ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-bold text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 font-mono tabular-nums">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · คลิกเพื่อเปลี่ยนไฟล์
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <FileUp className="w-9 h-9 text-slate-400" />
                    <Video className="w-8 h-8 text-rose-400" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-800">
                    ลากไฟล์มาวางที่นี่ หรือ <span className="text-blue-600 underline">คลิกเพื่อเลือกไฟล์</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    รองรับไฟล์วิดีโอสาธิต (MP4, MOV, WEBM), คู่มือ PDF, ไดร์เวอร์ ZIP/EXE สูงสุด 100 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Category & Title */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              หมวดหมู่ไฟล์ <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PrinterFileCategory)}
              className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
            >
              {categoriesList.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              ชื่อไฟล์ / หัวข้อเอกสาร <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="เช่น Driver Punehod A4 Passport Printer ล่าสุด"
              className={`w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.title ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              คำอธิบาย & วิธีการติดตั้ง / รายละเอียดการทดสอบ <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="ระบุข้อควรระวัง วิธีลงไดร์เวอร์ หรือผลการทดสอบกับเครื่อง Passport Punehod A4..."
              className={`w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.description ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Admin Specific Toggles */}
          {isAdmin && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-6 text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isOfficial}
                  onChange={(e) => setIsOfficial(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>กำหนดเป็นไฟล์ทางการ (Official)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-amber-600 w-4 h-4"
                />
                <Pin className="w-5 h-5 text-amber-600" />
                <span>ปักหมุดไฟล์ไว้บนสุด (Pinned)</span>
              </label>
            </div>
          )}

          {/* Terms acknowledgment */}
          <div className="text-xs sm:text-sm text-slate-500 flex items-start gap-2 pt-1">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              ข้อมูลที่อัพโหลดจะได้รับการบันทึกลงในระบบคลังเอกสาร และพร้อมให้ผู้ใช้งานอื่นดาวน์โหลดได้ทันที
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการเพิ่มไฟล์'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
