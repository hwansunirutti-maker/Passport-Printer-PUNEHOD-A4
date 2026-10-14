import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  ArrowRight,
  Info,
  History,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Sliders,
  Camera,
  UploadCloud,
  Link2,
  RotateCcw,
  X,
  Users,
  FolderInput
} from 'lucide-react';
import { PrinterFile, AuditLog, SiteConfig, DashboardSectionId } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { MoveCategoryModal } from './MoveCategoryModal';

const DEFAULT_HERO_IMAGE = '/src/assets/images/punehod_passport_printer_1790838446659.jpg';

interface DashboardOverviewProps {
  files: PrinterFile[];
  auditLogs: AuditLog[];
  siteConfig: SiteConfig;
  isAdmin: boolean;
  todayVisitors?: number;
  onNavigateToRepository: (categoryFilter?: string) => void;
  onNavigateToAudit: () => void;
  onOpenFileDetail: (file: PrinterFile) => void;
  onOpenUpload: () => void;
  onDownloadFile: (file: PrinterFile) => void;
  onOpenCustomizer?: () => void;
  onReorderSection?: (sectionId: DashboardSectionId, direction: 'up' | 'down') => void;
  onToggleSectionVisibility?: (sectionId: DashboardSectionId) => void;
  onClearLogs?: () => void;
  onUpdateBannerImage?: (newImageUrl: string) => void;
  onResetTodayVisitors?: () => void;
  onResetVisitors?: () => void;
  onMoveCategory?: (fileId: string, newCategory: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  files,
  auditLogs,
  siteConfig,
  isAdmin,
  todayVisitors = 0,
  onNavigateToRepository,
  onNavigateToAudit,
  onOpenFileDetail,
  onOpenUpload,
  onDownloadFile,
  onOpenCustomizer,
  onReorderSection,
  onToggleSectionVisibility,
  onClearLogs,
  onUpdateBannerImage,
  onResetTodayVisitors,
  onResetVisitors,
  onMoveCategory,
}) => {
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [visitorResetDialog, setVisitorResetDialog] = useState<{
    isOpen: boolean;
    type: 'all' | 'today';
    title: string;
    message: string;
  } | null>(null);
  const [fileToMove, setFileToMove] = useState<PrinterFile | null>(null);
  
  // Banner Image Editing States (สำหรับแอดมินแก้ไขรูปภาพแบนเนอร์)
  const [isEditImageModalOpen, setIsEditImageModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const totalDownloads = files.reduce((acc, f) => acc + (f.downloadCount || 0), 0);
  const communityUploads = files.filter(f => !f.isOfficial).length;
  const officialFiles = files.filter(f => f.isOfficial || f.isPinned);
  const recentEdits = auditLogs.slice(0, 7);

  // Time formatter
  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'เมื่อสักครู่';
      if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      if (diffDays < 30) return `${diffDays} วันที่แล้ว`;
      return new Date(isoString).toLocaleDateString('th-TH');
    } catch {
      return 'เมื่อไม่นานมานี้';
    }
  };

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'upload':
        return <span className="text-blue-600 dark:text-blue-400 font-semibold">อัพโหลดใหม่</span>;
      case 'approve':
        return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">อนุมัติแล้ว</span>;
      case 'edit':
        return <span className="text-amber-600 dark:text-amber-400 font-semibold">แก้ไขข้อมูล</span>;
      case 'delete':
        return <span className="text-rose-600 dark:text-rose-400 font-semibold">ลบไฟล์</span>;
      default:
        return <span className="text-slate-600 dark:text-slate-400 font-semibold">กิจกรรม</span>;
    }
  };

  // Sorted list of sections (Excludes support_hotline completely, hide audit_log & metrics from general users)
  const activeSections = [...(siteConfig.sections || [
    { id: 'announcement', label: 'แถบประกาศสำคัญ', visible: true, order: 1 },
    { id: 'hero', label: 'แบนเนอร์เครื่องพิมพ์', visible: true, order: 2 },
    { id: 'metrics', label: 'กล่องสถิติและตัวเลขนับรวม', visible: true, order: 3 },
    { id: 'official_files', label: 'ไฟล์คู่มือและไดร์เวอร์แนะนำ', visible: true, order: 4 },
    { id: 'audit_log', label: 'ประวัติการแก้ไขและกิจกรรมล่าสุด', visible: true, order: 5 },
  ])]
    .filter(sec => sec.id !== 'support_hotline' && sec.id !== 'official_files')
    .filter(sec => isAdmin || (sec.id !== 'audit_log' && sec.id !== 'metrics'))
    .sort((a, b) => a.order - b.order);

  // Admin section reordering bar
  const renderAdminControls = (sectionId: DashboardSectionId, index: number) => {
    if (!isAdmin || !onReorderSection) return null;

    return (
      <div className="flex items-center justify-between bg-slate-800/90 text-slate-200 text-xs px-3.5 py-1.5 rounded-t-lg border-t border-x border-slate-700 -mb-1 z-10 font-sans">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>ส่วนที่ {index + 1}: {sectionId}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onReorderSection(sectionId, 'up')}
            disabled={index === 0}
            className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 hover:text-white"
            title="เลื่อนส่วนนี้ขึ้น"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReorderSection(sectionId, 'down')}
            disabled={index === activeSections.length - 1}
            className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 hover:text-white"
            title="เลื่อนส่วนนี้ลง"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          {onToggleSectionVisibility && (
            <button
              onClick={() => onToggleSectionVisibility(sectionId)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-rose-400 ml-1"
              title="ซ่อนส่วนนี้"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Section 1: Announcement Banner
  const renderAnnouncement = (index: number) => {
    if (!siteConfig.announcement) return null;
    return (
      <div key="announcement" className="space-y-1">
        {renderAdminControls('announcement', index)}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm sm:text-base leading-relaxed">
            <strong className="font-bold text-amber-900 mr-2">ประกาศสำคัญ:</strong>
            <span>{siteConfig.announcement}</span>
          </div>
        </div>
      </div>
    );
  };

  // Section 2: Hero Showcase Card (เอาข้อความ Model และสเปกฮาร์ดแวร์ออก, แอดมินแก้ไขรูปได้)
  const renderHero = (index: number) => {
    const isCentered = siteConfig.heroAlign === 'center';
    const currentHeroImage = siteConfig.heroImageUrl || DEFAULT_HERO_IMAGE;

    return (
      <div key="hero" className="space-y-1">
        {renderAdminControls('hero', index)}
        <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
            <div className={`lg:col-span-7 space-y-5 ${isCentered ? 'text-center lg:text-left' : ''}`}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {siteConfig.heroTitle || 'ศูนย์จัดเก็บคู่มือ ไดร์เวอร์ & ซอฟต์แวร์ Passport Printer PUNEHOD A4'}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                {siteConfig.heroSubtitle || 'คลังเอกสารและไฟล์โปรแกรมพิมพ์เล่มหนังสือเดินทาง Passport Printer PUNEHOD A4'}
              </p>

              {/* Quick action buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigateToRepository()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-md transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <span>ค้นหาและดาวน์โหลดไฟล์ทั้งหมด ({files.length})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Banner Image with Admin Change Photo overlay */}
            <div className="lg:col-span-5 relative group">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl aspect-video sm:aspect-16/9 bg-slate-950 flex items-center justify-center">
                <img
                  src={currentHeroImage}
                  alt="Passport Printer PUNEHOD A4"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                />

                {/* 2. ปุ่มแอดมินแก้ไขเปลี่ยนรูปภาพบนแบนเนอร์ */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempImageUrl(currentHeroImage);
                      setImageUploadError('');
                      setIsEditImageModalOpen(true);
                    }}
                    className="absolute top-3.5 right-3.5 bg-slate-900/90 hover:bg-blue-600 text-white border border-slate-600 hover:border-blue-400 backdrop-blur-sm px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xl transition-all cursor-pointer z-10"
                    title="คลิกเพื่อแก้ไขเปลี่ยนรูปภาพแบนเนอร์"
                  >
                    <Camera className="w-4 h-4 text-blue-300" />
                    <span>เปลี่ยนรูปแบนเนอร์</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section 3: Metrics Row (ย้ายไปอยู่หน้า admin ไม่ต้องโชว์ในหน้าผู้ใช้งานทั่วไป พร้อมเพิ่มหัวข้อผู้เข้าใช้งานวันนี้)
  const renderMetrics = (index: number) => {
    if (!isAdmin) return null;

    return (
      <div key="metrics" className="space-y-2.5">
        {renderAdminControls('metrics', index)}
        
        {/* Admin Stats Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
              แผงข้อมูลสถิติภาพรวมระบบ (โหมดผู้ดูแลระบบ Admin)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(onResetVisitors || onResetTodayVisitors) && (
              <button
                type="button"
                onClick={() => {
                  setVisitorResetDialog({
                    isOpen: true,
                    type: 'all',
                    title: 'ยืนยันการรีเซ็ตสถิติผู้เข้าชมระบบทั้งหมด',
                    message: 'คุณต้องการรีเซ็ตสถิติยอดผู้เข้าชมของทุกหน้า และสถิติผู้เข้าใช้งานวันนี้กลับเป็น 0 ทั้งหมดหรือไม่?'
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="รีเซ็ตสถิติผู้เข้าชมระบบทั้งหมดเป็น 0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>รีเซ็ตสถิติการเข้าชมระบบ</span>
              </button>
            )}
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium hidden sm:inline">
              ซ่อนจากหน้าผู้ใช้งานทั่วไป
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: ไฟล์ทั้งหมดในระบบ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-sm font-semibold text-slate-500">ไฟล์ทั้งหมดในระบบ</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums mt-1.5">
              {files.length}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 mt-1.5">
              <span>ไฟล์พร้อมให้บริการในคลัง</span>
            </div>
          </div>

          {/* Card 2: ยอดดาวน์โหลดสะสม */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-sm font-semibold text-slate-500">ยอดดาวน์โหลดสะสม</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-mono tabular-nums mt-1.5">
              {totalDownloads.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>ความเร็วสูง พร้อมใช้งาน</span>
            </div>
          </div>

          {/* Card 3: ไฟล์ผู้ใช้งานทั่วไป */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-sm font-semibold text-slate-500">ไฟล์ผู้ใช้งานทั่วไป</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums mt-1.5">
              {communityUploads}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 mt-1.5">
              <span>แบ่งปันโดยผู้ใช้ในระบบ</span>
            </div>
          </div>

          {/* Card 4: ผู้เข้าใช้งานวันนี้ (เพิ่มใหม่ตามคำสั่ง พร้อมปุ่มรีเซ็ตสำหรับแอดมิน) */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-300/80 shadow-xs ring-1 ring-emerald-100/80">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-emerald-800">ผู้เข้าใช้งานวันนี้</div>
              <div className="flex items-center gap-1.5">
                {isAdmin && (onResetTodayVisitors || onResetVisitors) && (
                  <button
                    type="button"
                    onClick={() => {
                      setVisitorResetDialog({
                        isOpen: true,
                        type: 'today',
                        title: 'ยืนยันการรีเซ็ตยอดผู้เข้าชมวันนี้',
                        message: 'คุณต้องการรีเซ็ตยอดผู้เข้าใช้งานวันนี้กลับเป็น 0 หรือไม่?'
                      });
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors cursor-pointer"
                    title="รีเซ็ตยอดผู้เข้าชมวันนี้เป็น 0"
                  >
                    <RotateCcw className="w-3 h-3 text-rose-500" />
                    <span>รีเซ็ต</span>
                  </button>
                )}
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">วันนี้</span>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono tabular-nums mt-1.5">
              {todayVisitors.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>ผู้เข้าชมทั้งหมดวันนี้</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section 4: Official & Pinned Files
  const renderOfficialFiles = (index: number) => {
    return (
      <div key="official_files" className="space-y-4">
        {renderAdminControls('official_files', index)}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              ไฟล์คู่มือและไดร์เวอร์แนะนำ (Official / Recommended)
            </h2>
          </div>
          <button
            onClick={() => onNavigateToRepository()}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {officialFiles.map(file => (
            <div
              key={file.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-500 mb-1.5">
                    <span className="uppercase font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                      {file.category}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-600 font-medium tabular-nums">{file.fileSize}</span>
                  </div>

                  <h3 
                    onClick={() => onOpenFileDetail(file)}
                    className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer truncate transition-colors"
                  >
                    {file.title}
                  </h3>

                  <p className="text-sm text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {file.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 mt-3">
                    <span>ผู้เผยแพร่: <strong className="text-slate-800">{file.uploaderName}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <div className="flex items-center gap-1.5">
                    {isAdmin && onMoveCategory && (
                      <button
                        type="button"
                        onClick={() => setFileToMove(file)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                        title="ย้ายคู่มือ/ไฟล์ไปยังหมวดอื่น"
                      >
                        <FolderInput className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDownloadFile(file)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                      title="ดาวน์โหลดไฟล์ทันที"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลด</span>
                    </button>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400 font-mono tabular-nums">
                    {file.downloadCount} ครั้ง
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section 5: Recent Edit History / Audit Log
  const renderAuditLog = (index: number) => {
    return (
      <div key="audit_log" className="space-y-4">
        {renderAdminControls('audit_log', index)}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">
              ประวัติการแก้ไขและกิจกรรมล่าสุด
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && onClearLogs && (
              <button
                onClick={() => setIsConfirmClearOpen(true)}
                disabled={auditLogs.length === 0}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-30 disabled:pointer-events-none px-2.5 py-1 rounded-lg font-semibold transition-colors border border-rose-200 cursor-pointer"
                title="ล้างบันทึกประวัติทั้งหมด"
              >
                ล้างบันทึก
              </button>
            )}
            <button
              onClick={onNavigateToAudit}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {recentEdits.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              ยังไม่มีบันทึกประวัติการแก้ไข หรือบันทึกถูกล้างแล้วโดยผู้ดูแลระบบ
            </div>
          ) : (
            recentEdits.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-start justify-between gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-700 font-semibold truncate max-w-[160px]">
                      {log.actorName}
                    </span>
                  </div>
                  <span className="text-slate-400 whitespace-nowrap font-mono tabular-nums text-xs">
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>

                <div className="text-sm sm:text-base font-bold text-slate-900 mt-1 line-clamp-1">
                  {log.targetTitle}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {log.details}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Dynamic Section Dispatcher (No support_hotline)
  const renderSection = (sec: { id: DashboardSectionId; visible: boolean }, index: number) => {
    if (!sec.visible) return null;

    switch (sec.id) {
      case 'announcement':
        return renderAnnouncement(index);
      case 'hero':
        return renderHero(index);
      case 'metrics':
        return renderMetrics(index);
      case 'official_files':
        return null;
      case 'audit_log':
        return renderAuditLog(index);
      default:
        return null;
    }
  };

  const isSplitLayout = siteConfig.dashboardLayout !== 'stacked';

  return (
    <div className="space-y-8">
      {/* Dynamic Ordered Sections */}
      {isSplitLayout ? (
        <>
          {activeSections
            .filter(s => s.id !== 'audit_log')
            .map((s, idx) => renderSection(s, idx))}

          {/* Audit log (if Admin and active) */}
          {isAdmin && activeSections.some(s => s.id === 'audit_log') && (
            <div className="space-y-4">
              {renderAuditLog(3)}
            </div>
          )}
        </>
      ) : (
        activeSections.map((s, idx) => renderSection(s, idx))
      )}

      {/* Confirmation Dialog for Clearing Logs */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="ยืนยันการล้างประวัติการแก้ไขทั้งหมด"
        message="คุณต้องการล้างประวัติการทำงาน บันทึกการอัพโหลด และกิจกรรมทั้งหมดออกจากระบบอย่างถาวรหรือไม่? รายการทั้งหมดจะถูกล้างออกทันที"
        confirmLabel="ยืนยันล้างบันทึกทั้งหมด"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          onClearLogs?.();
        }}
        onClose={() => setIsConfirmClearOpen(false)}
      />

      {/* Confirmation Dialog for Resetting Visitors */}
      <ConfirmModal
        isOpen={!!visitorResetDialog?.isOpen}
        title={visitorResetDialog?.title || ''}
        message={visitorResetDialog?.message || ''}
        confirmLabel="ยืนยันรีเซ็ตเป็น 0"
        cancelLabel="ยกเลิก"
        variant="warning"
        onConfirm={() => {
          if (visitorResetDialog?.type === 'today') {
            if (onResetTodayVisitors) onResetTodayVisitors();
            else if (onResetVisitors) onResetVisitors();
          } else {
            if (onResetVisitors) onResetVisitors();
            else if (onResetTodayVisitors) onResetTodayVisitors();
          }
          setVisitorResetDialog(null);
        }}
        onClose={() => setVisitorResetDialog(null)}
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
        availableCategories={siteConfig.categories}
      />

      {/* 2. Modal สำหรับแอดมินแก้ไขเปลี่ยนรูปภาพบนแบนเนอร์ */}
      {isEditImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">แก้ไขเปลี่ยนรูปภาพแบนเนอร์</h3>
                  <p className="text-xs text-slate-400">อัพโหลดรูปภาพใหม่จากเครื่อง หรือระบุ URL รูปภาพ</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditImageModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Preview Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ตัวอย่างรูปภาพที่จะแสดงผล
                </label>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                  <img
                    src={tempImageUrl || DEFAULT_HERO_IMAGE}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageUploadError('ไม่สามารถโหลดรูปภาพจาก URL นี้ได้ กรุณาตรวจสอบลิงก์')}
                  />
                </div>
                {imageUploadError && (
                  <p className="text-xs text-rose-600 mt-1">{imageUploadError}</p>
                )}
              </div>

              {/* Upload file from computer */}
              <div>
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        setImageUploadError('ขนาดไฟล์รูปภาพต้องไม่เกิน 10 MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setTempImageUrl(reader.result as string);
                        setImageUploadError('');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm rounded-xl border border-blue-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>เลือกรูปภาพจากเครื่องคอมพิวเตอร์ / มือถือ</span>
                </button>
              </div>

              {/* Or enter Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หรือระบุ URL รูปภาพ (https://...)
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={tempImageUrl}
                    onChange={(e) => {
                      setTempImageUrl(e.target.value);
                      setImageUploadError('');
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setTempImageUrl(DEFAULT_HERO_IMAGE);
                    setImageUploadError('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>คืนค่ารูปเริ่มต้น</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditImageModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateBannerImage) {
                        onUpdateBannerImage(tempImageUrl || DEFAULT_HERO_IMAGE);
                      }
                      setIsEditImageModalOpen(false);
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    บันทึกรูปภาพ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
