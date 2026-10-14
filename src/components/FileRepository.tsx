import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  FileText, 
  Pin, 
  PinOff, 
  Trash2, 
  LayoutGrid, 
  List, 
  User, 
  X,
  FileCode,
  FileArchive,
  Cpu,
  Layers,
  Video,
  Edit3,
  Image,
  Camera,
  CheckCircle2,
  Lock,
  Upload,
  Plus,
  FolderInput
} from 'lucide-react';
import { PrinterFile, PrinterFileCategory, PageBannerConfig, CategoryConfig, AdminUser } from '../types';
import { isMyFile, matchesCategory } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';
import { MoveCategoryModal } from './MoveCategoryModal';

interface FileRepositoryProps {
  files: PrinterFile[];
  initialCategory?: string;
  isAdmin: boolean;
  currentUser?: AdminUser | null;
  isLoggedIn?: boolean;
  onOpenFileDetail: (file: PrinterFile) => void;
  onDownloadFile: (file: PrinterFile) => void;
  onTogglePin?: (fileId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onMoveCategory?: (fileId: string, newCategory: string) => void;
  onOpenUpload: (categoryFilter?: string) => void;
  availableCategories?: CategoryConfig[];
  pageBanner?: PageBannerConfig;
  onUpdateBanner?: (banner: PageBannerConfig) => void;
}

export const FileRepository: React.FC<FileRepositoryProps> = ({
  files,
  initialCategory,
  isAdmin,
  currentUser = null,
  isLoggedIn = false,
  onOpenFileDetail,
  onDownloadFile,
  onTogglePin,
  onDeleteFile,
  onMoveCategory,
  onOpenUpload,
  availableCategories,
  pageBanner,
  onUpdateBanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'name' | 'size'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [fileToDelete, setFileToDelete] = useState<PrinterFile | null>(null);
  const [fileToMove, setFileToMove] = useState<PrinterFile | null>(null);

  // Page Banner Edit Modal State
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const [editBannerTitle, setEditBannerTitle] = useState(pageBanner?.title || 'คลังดาวน์โหลดเอกสารคู่มือ & ไดร์เวอร์');
  const [editBannerSubtitle, setEditBannerSubtitle] = useState(pageBanner?.subtitle || 'ค้นหาและดาวน์โหลดไฟล์ติดตั้ง คู่มือใช้งาน ไดร์เวอร์ และวิดีโอสาธิตสำหรับเครื่องพิมพ์ Punehod A4');
  const [editBannerImageUrl, setEditBannerImageUrl] = useState(pageBanner?.imageUrl || '/src/assets/images/punehod_passport_printer_1790838446659.jpg');

  const categories = availableCategories && availableCategories.length > 0 
    ? availableCategories 
    : [
        { id: 'all', label: 'ทั้งหมด' },
        { id: 'manual', label: 'คู่มือการใช้งาน' },
        { id: 'driver/software', label: 'ไดร์เวอร์/ซอฟต์แวร์' },
        { id: 'troubleshooting', label: 'การแก้ไขปัญหา' },
        { id: 'Maintenance', label: 'การบำรุงรักษา' },
        { id: 'video', label: 'วิดีโอสาธิต&การใช้งาน' },
      ];

  // Filtering & Search Logic (instant, memory-fast, robust case-insensitive category matching)
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Filter by category using robust matcher
    if (selectedCategory !== 'all') {
      result = result.filter(f => matchesCategory(f.category, selectedCategory, categories));
    }

    // Filter by search query (only title, description, filename, uploaderName - no phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(f => 
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.fileName.toLowerCase().includes(q) ||
        f.uploaderName.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      // Pinned files always float to top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'newest') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortBy === 'downloads') {
        return b.downloadCount - a.downloadCount;
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title, 'th');
      }
      if (sortBy === 'size') {
        return b.fileSizeBytes - a.fileSizeBytes;
      }
      return 0;
    });

    return result;
  }, [files, selectedCategory, searchQuery, sortBy, categories]);

  const getFileCategoryLabel = (cat: PrinterFileCategory) => {
    if (!cat) return 'ทั่วไป';
    const trimmed = cat.toLowerCase().trim();
    const found = categories.find(
      c => c.id.toLowerCase().trim() === trimmed || c.label.toLowerCase().trim() === trimmed
    );
    if (found) return found.label;
    switch (trimmed) {
      case 'manual': return 'คู่มือการใช้งาน';
      case 'driver/software': return 'ไดร์เวอร์/ซอฟต์แวร์';
      case 'driver': return 'ไดร์เวอร์';
      case 'software': return 'ซอฟต์แวร์';
      case 'icc_profile': return 'โปรไฟล์สี';
      case 'troubleshooting': return 'การแก้ไขปัญหา';
      case 'maintenance': return 'การบำรุงรักษา';
      case 'video': return 'วิดีโอสาธิต&การใช้งาน';
      default: return cat;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'zip':
      case 'rar': return <FileArchive className="w-6 h-6 text-amber-500" />;
      case 'exe':
      case 'dmg': return <Cpu className="w-6 h-6 text-blue-500" />;
      case 'icc': return <Layers className="w-6 h-6 text-purple-500" />;
      case 'mp4':
      case 'mov':
      case 'webm':
      case 'mkv':
      case 'avi':
      case 'video': return <Video className="w-6 h-6 text-rose-500" />;
      default: return <FileCode className="w-6 h-6 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. Page Banner (แอดมินสามารถ เพิ่ม ลบ แก้ไข แบนเนอร์ของแต่ละหน้าได้) */}
      {pageBanner && pageBanner.visible ? (
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-md">
          <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>แบนเนอร์หน้าคลังเอกสาร & ไดร์เวอร์</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {pageBanner.title}
              </h2>
              {pageBanner.subtitle && (
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {pageBanner.subtitle}
                </p>
              )}
            </div>

            {isAdmin && onUpdateBanner && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditBannerTitle(pageBanner.title);
                    setEditBannerSubtitle(pageBanner.subtitle || '');
                    setEditBannerImageUrl(pageBanner.imageUrl || '');
                    setIsEditBannerOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="แก้ไขแบนเนอร์หน้านี้"
                >
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <span>แก้ไขแบนเนอร์</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateBanner({ ...pageBanner, visible: false });
                  }}
                  className="p-2 bg-slate-800/90 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                  title="ลบ/ซ่อนแบนเนอร์หน้านี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {pageBanner.imageUrl && (
            <div 
              className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url(${pageBanner.imageUrl})` }}
            />
          )}
        </div>
      ) : isAdmin && onUpdateBanner ? (
        <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-600">
          <span>แบนเนอร์ของหน้านี้ถูกซ่อน/ลบอยู่</span>
          <button
            type="button"
            onClick={() => onUpdateBanner({
              title: 'คลังดาวน์โหลดเอกสารคู่มือ & ไดร์เวอร์',
              subtitle: 'ค้นหาและดาวน์โหลดไฟล์ติดตั้ง คู่มือใช้งาน ไดร์เวอร์ และวิดีโอสาธิตสำหรับเครื่องพิมพ์ Punehod A4',
              imageUrl: '/src/assets/images/punehod_passport_printer_1790838446659.jpg',
              visible: true,
            })}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่มแบนเนอร์หน้านี้</span>
          </button>
        </div>
      ) : null}

      {/* Header and Search Bar (หน้าคลังไฟล์ขนาดตัวอักษรใหญ่ขึ้น ไม่มีปุ่มผู้เข้าชมตรงกลาง) */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              คลังไฟล์และระบบค้นหาความเร็วสูง
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mt-1.5 leading-relaxed">
              ดึงข้อมูลคู่มือ ไดร์เวอร์ และโปรแกรมพิมพ์เล่มพาสปอร์ต Punehod A4 ได้อย่างรวดเร็ว
            </p>
          </div>

          {/* ปุ่มอัพโหลดไฟล์เข้าคลัง */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenUpload(selectedCategory !== 'all' ? selectedCategory : undefined)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-base sm:text-lg font-bold rounded-xl shadow-md transition-colors flex items-center gap-2.5 whitespace-nowrap cursor-pointer"
              title="อัพโหลดคู่มือหรือไฟล์เข้าคลัง"
            >
              <Upload className="w-5 h-5 text-white" />
              <span>+ อัพโหลดไฟล์เข้าคลัง</span>
            </button>
          </div>
        </div>

        {/* Live Search Input with instant clear */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อไฟล์, ไดร์เวอร์ หรือผู้เผยแพร่ข้อมูล..."
            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          {/* Category Tabs (Clean Segmented Buttons with larger fonts) */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort and View Toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 text-sm sm:text-base bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="newest">เรียง: ล่าสุด</option>
              <option value="downloads">เรียง: ยอดดาวน์โหลดสูงสุด</option>
              <option value="name">เรียง: ชื่อ ก-ฮ (A-Z)</option>
              <option value="size">เรียง: ขนาดไฟล์</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="มุมมองตาราง"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Count and Active Filters */}
      <div className="flex items-center justify-between text-sm sm:text-base text-slate-600 px-1">
        <div>
          พบไฟล์ทั้งหมด <strong className="text-slate-900 font-mono text-base sm:text-lg tabular-nums">{filteredFiles.length}</strong> รายการ
          {searchQuery && <span> จากการค้นหา &ldquo;{searchQuery}&rdquo;</span>}
        </div>
        {searchQuery || selectedCategory !== 'all' ? (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-blue-600 hover:text-blue-800 underline font-semibold text-sm sm:text-base cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        ) : null}
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
            ไม่พบไฟล์ที่ตรงกับคำค้นหา
          </h3>
          <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น หรือเพิ่มไฟล์เข้าสู่ระบบ
          </p>
        </div>
      )}

      {/* Grid Mode View (Large font sizes) */}
      {viewMode === 'grid' && filteredFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all flex flex-col justify-between ${
                file.isPinned
                  ? 'border-blue-300 ring-2 ring-blue-100 shadow-sm'
                  : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Card Top Row: Category, Pinned */}
                <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.fileType)}
                    <span className="font-bold text-slate-700 text-sm">
                      {getFileCategoryLabel(file.category)}
                    </span>
                    {file.isOfficial && (
                      <span className="text-xs text-blue-700 bg-blue-50 font-bold px-1.5 py-0.5 rounded">
                        ทางการ
                      </span>
                    )}
                    {isMyFile(file.id) && (
                      <span className="text-[11px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                        ไฟล์ของคุณ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.isPinned && (
                      <span className="text-xs text-amber-600 font-bold flex items-center gap-1" title="ปักหมุดไฟล์สำคัญ">
                        <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                        <span>ปักหมุด</span>
                      </span>
                    )}
                    <span className="font-mono text-slate-700 font-bold text-xs sm:text-sm tabular-nums">
                      {file.fileSize}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onOpenFileDetail(file)}
                  className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug transition-colors"
                >
                  {file.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {file.description}
                </p>

                {/* Uploader Details (เอาเบอร์โทรและช่องทางติดต่อออก แสดงเฉพาะชื่อผู้เผยแพร่) */}
                <div className="mt-4 bg-slate-50 p-3.5 rounded-xl text-sm sm:text-base text-slate-700 flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">
                    ผู้เผยแพร่: <strong className="text-slate-900 font-bold">{file.uploaderName}</strong>
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => onOpenFileDetail(file)}
                  className="text-sm sm:text-base text-slate-700 hover:text-slate-900 font-bold px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  รายละเอียด
                </button>

                <div className="flex items-center gap-2">
                  {isAdmin && onTogglePin && (
                    <button
                      onClick={() => onTogglePin(file.id)}
                      className={`p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer ${
                        file.isPinned ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={file.isPinned ? 'ถอนหมุด' : 'ปักหมุดไฟล์'}
                    >
                      {file.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </button>
                  )}

                  {isAdmin && onMoveCategory && (
                    <button
                      type="button"
                      onClick={() => setFileToMove(file)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="ย้ายคู่มือ/ไฟล์ไปยังหมวดอื่น"
                    >
                      <FolderInput className="w-4 h-4" />
                    </button>
                  )}

                  {(isAdmin || isMyFile(file)) && (
                    <button
                      onClick={() => onOpenFileDetail(file)}
                      className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
                      title={isMyFile(file) && !isAdmin ? 'แก้ไขไฟล์ของคุณ' : 'แก้ไขข้อมูลไฟล์'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {(isAdmin || isMyFile(file)) && onDeleteFile && (
                    <button
                      onClick={() => setFileToDelete(file)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      title={isMyFile(file) && !isAdmin ? 'ลบไฟล์ของคุณ' : 'ลบไฟล์ออกจากระบบ'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onDownloadFile(file)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm sm:text-base font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลด</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Mode View */}
      {viewMode === 'table' && filteredFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm sm:text-base font-bold text-slate-700 tracking-wide">
                  <th className="py-4 px-5 text-left">ชื่อเอกสาร / ไดร์เวอร์</th>
                  <th className="py-4 px-5 text-left">หมวดหมู่</th>
                  <th className="py-4 px-5 text-left">ผู้เผยแพร่ข้อมูล</th>
                  <th className="py-4 px-5 text-right">ขนาด</th>
                  <th className="py-4 px-5 text-right">ดาวน์โหลด</th>
                  <th className="py-4 px-5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm sm:text-base">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.fileType)}
                        <div>
                          <button
                            onClick={() => onOpenFileDetail(file)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left line-clamp-1 text-base sm:text-lg cursor-pointer transition-colors"
                          >
                            {file.title}
                          </button>
                          <div className="text-xs sm:text-sm text-slate-400 font-mono truncate max-w-xs mt-0.5 flex items-center gap-1.5">
                            <span>{file.fileName}</span>
                            {isMyFile(file.id) && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded-full">
                                ไฟล์ของคุณ
                              </span>
                            )}
                          </div>
                        </div>
                        {file.isPinned && (
                          <Pin className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">
                        {getFileCategoryLabel(file.category)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-800 text-sm sm:text-base">{file.uploaderName}</div>
                    </td>
                    <td className="py-4 px-5 text-right font-mono text-slate-700 font-bold tabular-nums text-sm sm:text-base">
                      {file.fileSize}
                    </td>
                    <td className="py-4 px-5 text-right font-mono text-blue-600 font-bold tabular-nums text-sm sm:text-base">
                      {file.downloadCount} ครั้ง
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onDownloadFile(file)}
                          className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="ดาวน์โหลดไฟล์"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {isAdmin && onMoveCategory && (
                          <button
                            type="button"
                            onClick={() => setFileToMove(file)}
                            className="p-2 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded-lg transition-colors cursor-pointer"
                            title="ย้ายคู่มือ/ไฟล์ไปยังหมวดอื่น"
                          >
                            <FolderInput className="w-4 h-4" />
                          </button>
                        )}
                        {(isAdmin || isMyFile(file)) && (
                          <button
                            onClick={() => onOpenFileDetail(file)}
                            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title={isMyFile(file) && !isAdmin ? 'แก้ไขไฟล์ของคุณ' : 'แก้ไขข้อมูลไฟล์'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {(isAdmin || isMyFile(file)) && onDeleteFile && (
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title={isMyFile(file) && !isAdmin ? 'ลบไฟล์ของคุณ' : 'ลบไฟล์ออกจากระบบ'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Edit Page Banner Modal */}
      {isEditBannerOpen && onUpdateBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">แก้ไขแบนเนอร์หน้าคลังไฟล์</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditBannerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หัวข้อแบนเนอร์
                </label>
                <input
                  type="text"
                  value={editBannerTitle}
                  onChange={(e) => setEditBannerTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำบรรยายใต้แบนเนอร์
                </label>
                <textarea
                  rows={3}
                  value={editBannerSubtitle}
                  onChange={(e) => setEditBannerSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL รูปภาพพื้นหลังแบนเนอร์
                </label>
                <input
                  type="text"
                  value={editBannerImageUrl}
                  onChange={(e) => setEditBannerImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditBannerOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateBanner({
                    title: editBannerTitle.trim() || 'คลังดาวน์โหลดเอกสารคู่มือ & ไดร์เวอร์',
                    subtitle: editBannerSubtitle.trim(),
                    imageUrl: editBannerImageUrl.trim(),
                    visible: true,
                  });
                  setIsEditBannerOpen(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs"
              >
                บันทึกแบนเนอร์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for File Deletion */}
      <ConfirmModal
        isOpen={fileToDelete !== null}
        title="ยืนยันการลบไฟล์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ "${fileToDelete?.title}" ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ยืนยันลบไฟล์"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (fileToDelete && onDeleteFile) {
            onDeleteFile(fileToDelete.id);
            setFileToDelete(null);
          }
        }}
        onClose={() => setFileToDelete(null)}
      />

      {/* Move Category Modal for Admin */}
      <MoveCategoryModal
        isOpen={fileToMove !== null}
        file={fileToMove}
        onClose={() => setFileToMove(null)}
        onConfirmMove={(fileId, targetCat) => {
          onMoveCategory?.(fileId, targetCat);
          setFileToMove(null);
        }}
        availableCategories={availableCategories}
      />
    </div>
  );
};
