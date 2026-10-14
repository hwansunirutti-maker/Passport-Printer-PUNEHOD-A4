import { PrinterFile, AuditLog, NotificationItem, SiteConfig, AdminUser, AdminPermission } from '../types';

const STORAGE_KEYS = {
  FILES: 'punehod_files_v2',
  LOGS: 'punehod_audit_logs_v2',
  NOTIFICATIONS: 'punehod_notifications_v2',
  CONFIG: 'punehod_config_v2',
  ADMIN_SESSION: 'punehod_admin_session_v2',
  ADMIN_USERS: 'punehod_admin_users_v2',
  CURRENT_ADMIN: 'punehod_current_admin_v2',
  PAGE_VIEWS: 'punehod_page_views_v2',
};

// Initial realistic default files for Punehod A4 Passport Printer
const INITIAL_FILES: PrinterFile[] = [
  {
    id: 'pnhd-001',
    title: 'คู่มือการใช้งานเครื่องพิมพ์ Passport Printer PUNEHOD A4 (ฉบับภาษาไทยทางการ)',
    category: 'manual',
    fileType: 'pdf',
    fileName: 'Punehod_A4_Passport_User_Manual_TH.pdf',
    fileSize: '8.4 MB',
    fileSizeBytes: 8808038,
    description: 'คู่มือฉบับสมบูรณ์ภาษาไทย อธิบายขั้นตอนการติดตั้ง ตั้งค่าถาดป้อนเล่มพาสปอร์ต การปรับระยะหัวพิมพ์ การเติมหมึก Pigment/Sublimation/Textile และข้อควรระวังในการพิมพ์หนังสือเดินทาง',
    uploaderName: 'ทีมวิศวกรเทคนิค PUNEHOD TH',
    uploaderPhone: '-',
    uploadDate: new Date(Date.now() - 3600000 * 48).toISOString(),
    downloadCount: 342,
    status: 'approved',
    isPinned: true,
    isOfficial: true,
    checksum: 'a8f93e120bc7492c',
  },
  {
    id: 'pnhd-002',
    title: 'Driver Punehod A4 Flatbed Passport Printer (Official WHQL)',
    category: 'driver',
    fileType: 'zip',
    fileName: 'Punehod_A4_WHQL_Driver.zip',
    fileSize: '42.6 MB',
    fileSizeBytes: 44669337,
    description: 'ไดร์เวอร์ทางการรองรับการสื่อสาร USB High-Speed พร้อมโมดูล Auto-Status Monitor เช็คระดับหมึกและอุณหภูมิหัวพิมพ์',
    uploaderName: 'ADMIN',
    uploaderPhone: '-',
    uploadDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    downloadCount: 890,
    status: 'approved',
    isPinned: true,
    isOfficial: true,
    checksum: 'b490f23cd110992a',
  },
  {
    id: 'pnhd-003',
    title: 'AcroRIP Punehod Special Edition สำหรับพิมพ์เล่ม Passport & ID Card',
    category: 'software',
    fileType: 'zip',
    fileName: 'AcroRIP_Punehod_Passport_Edition.zip',
    fileSize: '95.2 MB',
    fileSizeBytes: 99824435,
    description: 'โปรแกรม RIP ควบคุมการพ่นหมึกขาว (White Ink Layer) และการเรียงหน้าสำหรับสมุดเล่มหนังสือเดินทาง มีเทมเพลตขนาดมาตรฐาน ICAO 9303 ขนาดหน้าเล่มพาสปอร์ตสำเร็จรูป',
    uploaderName: 'คุณธวัชชัย รัตนวงศ์',
    uploaderPhone: '-',
    uploadDate: new Date(Date.now() - 3600000 * 18).toISOString(),
    downloadCount: 615,
    status: 'approved',
    isPinned: false,
    isOfficial: true,
    checksum: 'c771ba09e3288411',
  },
  {
    id: 'pnhd-004',
    title: 'ICC Color Profile & Color Calibration สำเร็จรูปสำหรับกระดาษหนังสือเดินทางสังเคราะห์',
    category: 'icc_profile',
    fileType: 'icc',
    fileName: 'Punehod_Passport_SyntheticPaper_D65.icc',
    fileSize: '1.8 MB',
    fileSizeBytes: 1887436,
    description: 'โปรไฟล์สีเทียบเคียงมาตรฐานสีผิวตามจริง ไม่ติดแดง ไม่เพี้ยน สำหรับใช้ร่วมกับหมึกแท้ Punehod และกระดาษสังเคราะห์ Synthetic Security Paper',
    uploaderName: 'คุณศิริพร ช่างสี',
    uploaderPhone: '-',
    uploadDate: new Date(Date.now() - 3600000 * 12).toISOString(),
    downloadCount: 284,
    status: 'approved',
    isPinned: false,
    isOfficial: false,
    checksum: 'd198302fa9bc4123',
  },
  {
    id: 'pnhd-005',
    title: 'คู่มือการปรับตั้งระยะ Margin และ Feeder สำหรับเล่มพาสปอร์ตหนา 32 และ 64 หน้า',
    category: 'manual',
    fileType: 'pdf',
    fileName: 'Guide_Punehod_Feeder_Margin_Setup_32_64p.pdf',
    fileSize: '3.4 MB',
    fileSizeBytes: 3565158,
    description: 'เอกสารประกอบการปรับระดับเซ็นเซอร์ความหนาเล่ม (Thickness Gauge Sensor) เพื่อป้องกันหัวพิมพ์ครูดกับขอบเล่มพาสปอร์ตขณะพิมพ์หน้าข้อมูลบุคคล',
    uploaderName: 'ฝ่ายบริการเทคนิค กองช่างพิมพ์',
    uploaderPhone: '-',
    uploadDate: new Date(Date.now() - 3600000 * 8).toISOString(),
    downloadCount: 195,
    status: 'approved',
    isPinned: false,
    isOfficial: true,
    checksum: 'e992143bc0912111',
  },
  {
    id: 'pnhd-006',
    title: 'คู่มือและโปรแกรมทำความสะอาดหัวพิมพ์ Flush & Head Alignment Tool',
    category: 'troubleshooting',
    fileType: 'zip',
    fileName: 'Punehod_Head_Flush_Align_Tool.zip',
    fileSize: '14.8 MB',
    fileSizeBytes: 15518924,
    description: 'โปรแกรมยูทิลิตี้สำหรับสั่ง Purge หมึกเฉพาะช่องหัวพิมพ์สี และการสั่ง Nozzle Check แบบความละเอียดสูง พร้อมวิดีโอแนะนำขั้นตอนการล้างหัวพิมพ์',
    uploaderName: 'ช่างสมหมาย อุปกรณ์การพิมพ์',
    uploaderPhone: '-',
    uploadDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    downloadCount: 421,
    status: 'approved',
    isPinned: false,
    isOfficial: false,
    checksum: 'f0029384acb33100',
  }
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    action: 'upload',
    actorName: 'ทีมวิศวกรเทคนิค PUNEHOD TH',
    actorRole: 'admin',
    targetTitle: 'คู่มือการใช้งานเครื่องพิมพ์ Passport Printer PUNEHOD A4 (ฉบับภาษาไทยทางการ)',
    details: 'เผยแพร่เอกสารคู่มือทางการของระบบ',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    action: 'upload',
    actorName: 'วิศวกรฝ่ายซอฟต์แวร์ศูนย์กรุงเทพฯ',
    actorRole: 'admin',
    targetTitle: 'Driver Punehod A4 Flatbed Passport Printer',
    details: 'อัปโหลดไดร์เวอร์ WHQL ปรับปรุงความเสถียรของพอร์ต USB',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    action: 'upload',
    actorName: 'คุณธวัชชัย รัตนวงศ์',
    actorRole: 'user',
    targetTitle: 'AcroRIP Punehod Special Edition',
    details: 'ผู้ใช้ทั่วไปส่งไฟล์ซอฟต์แวร์ AcroRIP พร้อมเทมเพลต ICAO',
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 3600000 * 17).toISOString(),
    action: 'approve',
    actorName: 'ผู้ดูแลระบบ (Admin)',
    actorRole: 'admin',
    targetTitle: 'AcroRIP Punehod Special Edition',
    details: 'ตรวจสอบความปลอดภัยและอนุมัติไฟล์ขึ้นคลังหลัก',
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    title: 'มีไฟล์ใหม่ในระบบ: คู่มือการใช้งานทางการ',
    message: 'ทีมวิศวกรเทคนิค PUNEHOD TH อัพโหลดคู่มือฉบับสมบูรณ์',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    isRead: true,
    fileId: 'pnhd-001',
    uploaderName: 'ทีมวิศวกรเทคนิค PUNEHOD TH',
    uploaderPhone: '-',
    type: 'new_upload',
  }
];

const INITIAL_CONFIG: SiteConfig = {
  siteTitle: 'Passport Printer PUNEHOD A4',
  siteSubtitle: 'ศูนย์จัดเก็บข้อมูลคู่มือและไดร์เวอร์',
  logoLetter: 'P',
  heroTitle: 'ศูนย์จัดเก็บคู่มือ ไดร์เวอร์ & ซอฟต์แวร์ Passport Printer PUNEHOD A4',
  heroSubtitle: 'คลังเอกสารและไฟล์โปรแกรมพิมพ์เล่มหนังสือเดินทาง Passport Printer PUNEHOD A4',
  heroImageUrl: '/src/assets/images/punehod_passport_printer_1790838446659.jpg',
  heroModelCode: '',
  heroAlign: 'left',
  heroSpecs: [],
  bannerText: 'คลังดาวน์โหลดเอกสารคู่มือ ไดร์เวอร์ และโปรแกรมพิมพ์เล่มพาสปอร์ต PUNEHOD A4 อย่างเป็น',
  announcement: 'ประกาศ: อัปเดตไดร์เวอร์ WHQL สำหรับ Punehod A4 แล้ว กรุณาดาวน์โหลดไฟล์ล่าสุดเพื่อการทำงานที่ราบรื่น',
  announcementTheme: 'amber',
  supportPhone: '063-9052513',
  supportLine: '@nairut.fnw',
  workingHours: 'จันทร์-ศุกร์ 08:00-17:00',
  footerText: 'จัดเก็บคู่มือ ไดร์เวอร์ ซอฟต์แวร์ AcroRIP และโปรไฟล์สีสำหรับเครื่องพิมพ์เล่มหนังสือเดินทาง Punehod A4',
  allowPublicUploads: true,
  adminUsername: 'admin',
  defaultTab: 'dashboard',
  dashboardLayout: 'split',
  sections: [
    { id: 'announcement', label: 'แถบประกาศสำคัญด้านบน (Announcement)', visible: true, order: 1 },
    { id: 'hero', label: 'แบนเนอร์เครื่องพิมพ์ (Hero Banner)', visible: true, order: 2 },
    { id: 'metrics', label: 'กล่องสถิติและตัวเลขนับรวม (Stats & Metrics)', visible: true, order: 3 },
    { id: 'official_files', label: 'ไฟล์คู่มือและไดร์เวอร์แนะนำ (Recommended Files)', visible: true, order: 4 },
    { id: 'audit_log', label: 'ประวัติการแก้ไขและกิจกรรมล่าสุด (Recent Activity)', visible: true, order: 5 },
  ],
  menuItems: [
    { id: 'dashboard', label: 'แดชบอร์ดหลัก', visible: true, order: 1, type: 'builtin', isDeletable: false },
    { id: 'repository', label: 'คลังไฟล์ & ค้นหา', visible: true, order: 2, type: 'builtin', isDeletable: false },
    { id: 'audit', label: 'ประวัติการแก้ไข', visible: true, order: 3, type: 'builtin', isDeletable: true },
  ],
  categories: [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'manual', label: 'คู่มือการใช้งาน' },
    { id: 'driver/software', label: 'ไดร์เวอร์/ซอฟต์แวร์' },
    { id: 'troubleshooting', label: 'การแก้ไขปัญหา' },
    { id: 'Maintenance', label: 'การบำรุงรักษา' },
    { id: 'video', label: 'วิดีโอสาธิต&การใช้งาน' },
  ],
  pageBanners: {
    dashboard: {
      title: 'ศูนย์จัดเก็บคู่มือ ไดร์เวอร์ & ซอฟต์แวร์ Passport Printer PUNEHOD A4',
      subtitle: 'คลังเอกสารและไฟล์โปรแกรมพิมพ์เล่มหนังสือเดินทาง Passport Printer PUNEHOD A4',
      imageUrl: '/src/assets/images/punehod_passport_printer_1790838446659.jpg',
      visible: true,
    },
    repository: {
      title: 'คลังดาวน์โหลดเอกสารคู่มือ & ไดร์เวอร์',
      subtitle: 'ค้นหาและดาวน์โหลดไฟล์ติดตั้ง คู่มือใช้งาน ไดร์เวอร์ และวิดีโอสาธิตสำหรับเครื่องพิมพ์ Punehod A4',
      imageUrl: '/src/assets/images/punehod_passport_printer_1790838446659.jpg',
      visible: true,
    },
    audit: {
      title: 'บันทึกประวัติกิจกรรมและการแก้ไขระบบ',
      subtitle: 'ตรวจสอบประวัติการอัพโหลด ลบ และแก้ไขไฟล์ย้อนหลังแบบเรียลไทม์',
      imageUrl: '/src/assets/images/punehod_passport_printer_1790838446659.jpg',
      visible: true,
    },
  },
};

// Storage helper functions
export const getFiles = (): PrinterFile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FILES);
    if (!raw) {
      saveFiles(INITIAL_FILES);
      return INITIAL_FILES;
    }
    const parsed: PrinterFile[] = JSON.parse(raw);
    return parsed.map(f => ({
      ...f,
      uploaderPhone: '-',
      uploaderContactExtra: undefined,
    }));
  } catch (e) {
    console.error('Error loading files:', e);
    return INITIAL_FILES;
  }
};

export const saveFiles = (files: PrinterFile[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  } catch (e) {
    console.error('Error saving files:', e);
  }
};

const SEED_FLAG_KEY = 'punehod_logs_seeded_v3';

export const getAuditLogs = (): AuditLog[] => {
  try {
    const hasSeeded = localStorage.getItem(SEED_FLAG_KEY);
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    
    // First time initialization only
    if (!hasSeeded && raw === null) {
      localStorage.setItem(SEED_FLAG_KEY, 'true');
      saveAuditLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) 
      ? parsed.map(log => ({
          ...log,
          actorName: (log.actorName || '').replace(/\s*\([\d\-+]+\)/g, ''),
        }))
      : [];
  } catch (e) {
    console.error('Error loading audit logs:', e);
    return [];
  }
};

export const saveAuditLogs = (logs: AuditLog[]): void => {
  try {
    localStorage.setItem(SEED_FLAG_KEY, 'true');
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving audit logs:', e);
  }
};

export const addAuditLog = (
  action: AuditLog['action'],
  actorName: string,
  actorRole: AuditLog['actorRole'],
  targetTitle: string,
  details: string
): AuditLog => {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    action,
    actorName,
    actorRole,
    targetTitle,
    details,
  };
  const logs = getAuditLogs();
  const updatedLogs = [newLog, ...logs].slice(0, 200);
  saveAuditLogs(updatedLogs);
  return newLog;
};

export const getNotifications = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    const parsed: NotificationItem[] = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(n => ({
          ...n,
          message: (n.message || '').replace(/\s*\(.*?[\d\-+]{6,}.*?\)/g, ''),
          uploaderPhone: '-',
        }))
      : INITIAL_NOTIFICATIONS;
  } catch (e) {
    console.error('Error loading notifications:', e);
    return INITIAL_NOTIFICATIONS;
  }
};

export const saveNotifications = (notifs: NotificationItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
};

export const addNotification = (
  title: string,
  message: string,
  uploaderName: string,
  uploaderPhone: string,
  type: NotificationItem['type'] = 'new_upload',
  fileId?: string
): NotificationItem => {
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title,
    message,
    timestamp: new Date().toISOString(),
    isRead: false,
    uploaderName,
    uploaderPhone,
    type,
    fileId,
  };
  const notifs = getNotifications();
  const updated = [newNotif, ...notifs].slice(0, 50);
  saveNotifications(updated);
  
  // Play subtle pleasant chime sound
  playNotificationSound();
  
  return newNotif;
};

export const markNotificationsAsRead = (): void => {
  const notifs = getNotifications().map(n => ({ ...n, isRead: true }));
  saveNotifications(notifs);
};

export const clearNotifications = (): void => {
  saveNotifications([]);
};

export const getSiteConfig = (): SiteConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      saveSiteConfig(INITIAL_CONFIG);
      return INITIAL_CONFIG;
    }
    const parsed = JSON.parse(raw);
    const cleanedSections = (parsed.sections && parsed.sections.length > 0 ? parsed.sections : INITIAL_CONFIG.sections)
      .filter((s: { id: string }) => s.id !== 'support_hotline')
      .map((s: { id: string; label: string; visible: boolean; order: number }) => 
        s.id === 'hero' ? { ...s, label: 'แบนเนอร์เครื่องพิมพ์ (Hero Banner)' } : s
      );

    return {
      ...INITIAL_CONFIG,
      ...parsed,
      heroImageUrl: parsed.heroImageUrl || INITIAL_CONFIG.heroImageUrl,
      sections: cleanedSections,
      menuItems: parsed.menuItems && parsed.menuItems.length > 0 ? parsed.menuItems : INITIAL_CONFIG.menuItems,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : INITIAL_CONFIG.categories,
      heroSpecs: parsed.heroSpecs || [],
    };
  } catch (e) {
    console.error('Error loading config:', e);
    return INITIAL_CONFIG;
  }
};

export const clearAllAuditLogs = (): void => {
  saveAuditLogs([]);
};

export const resetDownloadCounters = (): void => {
  const currentFiles = getFiles();
  const updated = currentFiles.map(f => ({ ...f, downloadCount: 0 }));
  saveFiles(updated);
};

export const saveSiteConfig = (cfg: SiteConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
  } catch (e) {
    console.error('Error saving config:', e);
  }
};

// Web Audio API notification synthesizer
export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.1);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.5);
  } catch (err) {
    // Ignore audio errors
  }
};

// Trigger download of actual file or generated content
export const downloadPrinterFile = (file: PrinterFile) => {
  const allFiles = getFiles();
  const idx = allFiles.findIndex(f => f.id === file.id);
  if (idx !== -1) {
    allFiles[idx].downloadCount += 1;
    saveFiles(allFiles);
  }

  if (file.fileUrl && file.fileUrl.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = file.fileUrl;
    a.download = file.fileName || `${file.title}.${file.fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  const simulatedFileContent = `=====================================================
  PUNEHOD A4 PASSPORT PRINTER ARCHIVE - OFFICIAL FILE DOWNLOAD
=====================================================

File Title:   ${file.title}
File Name:    ${file.fileName}
Category:     ${file.category.toUpperCase()}
File Size:    ${file.fileSize}
Uploaded By:  ${file.uploaderName}
Contact Phone:${file.uploaderPhone}
Contact Extra:${file.uploaderContactExtra || '-'}
Upload Date:  ${file.uploadDate}

-----------------------------------------------------
DESCRIPTION & INSTRUCTIONS:
-----------------------------------------------------
${file.description}

-----------------------------------------------------
PUNEHOD TECHNICAL SUPPORT:
Hotline: 02-890-1234
Official Line: @punehod_support
Website: Punehod A4 Passport Archive System

(This package was downloaded directly from the official Punehod A4 Passport Printer Repository archive.)
=====================================================`;

  const blob = new Blob([simulatedFileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.fileName.endsWith('.txt') ? file.fileName : `${file.fileName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Initial Admin Users with default roles & granular permissions
const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-root',
    username: 'admin',
    password: '9999',
    displayName: 'ผู้ดูแลระบบหลัก (Super Admin)',
    role: 'super_admin',
    roleTitle: 'ผู้ดูแลระบบระดับสูงสุด',
    permissions: [
      'manage_files',
      'manage_menus',
      'manage_customizer',
      'manage_audit',
      'manage_admins',
      'manage_system',
    ],
    isProtected: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'admin-editor',
    username: 'editor',
    password: 'editor2026',
    displayName: 'คุณธวัชชัย (ฝ่ายจัดการไฟล์)',
    role: 'editor',
    roleTitle: 'ผู้จัดการเนื้อหาและไฟล์',
    permissions: ['manage_files', 'manage_menus'],
    isProtected: false,
    createdAt: '2026-02-15T00:00:00.000Z',
    lastLogin: new Date(Date.now() - 3600000 * 24).toISOString(),
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'admin-mod',
    username: 'moderator',
    password: 'mod2026',
    displayName: 'ช่างสมหมาย (ตรวจสอบไฟล์)',
    role: 'moderator',
    roleTitle: 'เจ้าหน้าที่ตรวจรับไฟล์',
    permissions: ['manage_files'],
    isProtected: false,
    createdAt: '2026-03-01T00:00:00.000Z',
    lastLogin: new Date(Date.now() - 3600000 * 48).toISOString(),
    avatarColor: 'bg-indigo-600',
  },
];

// Initial realistic page views
const INITIAL_PAGE_VIEWS: Record<string, number> = {
  dashboard: 1428,
  repository: 894,
  audit: 312,
};

// Reset to initial demo data
export const resetToDefaultData = () => {
  saveFiles(INITIAL_FILES);
  saveAuditLogs(INITIAL_LOGS);
  saveNotifications(INITIAL_NOTIFICATIONS);
  saveSiteConfig(INITIAL_CONFIG);
  saveAdminUsers(INITIAL_ADMIN_USERS);
  savePageViews(INITIAL_PAGE_VIEWS);
};

// Admin auth check
export const checkIsAdmin = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
};

export const setAdminSession = (loggedIn: boolean): void => {
  if (loggedIn) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
  }
};

// Admin Users Management (เพิ่ม ลบ แก้ไขสิทธิ์ผู้ดูแลระบบ)
export const getAdminUsers = (): AdminUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (!raw) {
      saveAdminUsers(INITIAL_ADMIN_USERS);
      return INITIAL_ADMIN_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveAdminUsers(INITIAL_ADMIN_USERS);
      return INITIAL_ADMIN_USERS;
    }
    // Ensure default admin root user has password '9999'
    let updated = false;
    const synced = parsed.map((u: AdminUser) => {
      if (u.username.toLowerCase() === 'admin' && u.password !== '9999') {
        updated = true;
        return { ...u, password: '9999' };
      }
      return u;
    });
    if (updated) {
      saveAdminUsers(synced);
      return synced;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading admin users:', e);
    return INITIAL_ADMIN_USERS;
  }
};

export const saveAdminUsers = (users: AdminUser[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving admin users:', e);
  }
};

export const getCurrentAdmin = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
    if (!raw) {
      // Fallback to root admin if session is true
      if (checkIsAdmin()) {
        const users = getAdminUsers();
        return users[0] || null;
      }
      return null;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading current admin:', e);
    return null;
  }
};

export const setCurrentAdmin = (user: AdminUser | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
    }
  } catch (e) {
    console.error('Error setting current admin:', e);
  }
};

export const authenticateAdmin = (username: string, password: string): AdminUser | null => {
  const users = getAdminUsers();
  const normalizedUser = username.trim().toLowerCase();
  const trimmedPassword = password.trim();
  
  const user = users.find(u => {
    if (u.username.toLowerCase() === normalizedUser) {
      if (u.password === trimmedPassword) return true;
      if (normalizedUser === 'admin' && trimmedPassword === '9999') return true;
    }
    return false;
  });

  if (user && isUserAdmin(user)) {
    // Update lastLogin
    const updated = users.map(u => u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u);
    saveAdminUsers(updated);
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    setCurrentAdmin(updatedUser);
    setAdminSession(true);
    return updatedUser;
  }
  return null;
};

export const isUserAdmin = (user: AdminUser | null): boolean => {
  if (!user) return false;
  if (user.role === 'super_admin' || user.role === 'editor' || user.role === 'moderator') return true;
  return (user.permissions && user.permissions.length > 0) || false;
};

export const registerUser = (
  username: string, 
  password: string, 
  displayName: string
): { success: boolean; user?: AdminUser; message?: string } => {
  const users = getAdminUsers();
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cleanDisplayName = displayName.trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, message: 'ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร' };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
  }
  if (!cleanDisplayName) {
    return { success: false, message: 'กรุณาระบุชื่อ-นามสกุล หรือชื่อที่ใช้แสดง' };
  }

  const existing = users.find(u => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return { success: false, message: 'ชื่อผู้ใช้งานนี้มีในระบบแล้ว กรุณาเลือกชื่ออื่น หรือเข้าสู่ระบบ' };
  }

  const newUser: AdminUser = {
    id: `user-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    username: cleanUsername,
    password: cleanPassword,
    displayName: cleanDisplayName,
    role: 'user',
    roleTitle: 'สมาชิกผู้ใช้งาน (สิทธิ์อัพโหลดไฟล์คู่มือ)',
    permissions: [],
    isProtected: false,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    avatarColor: 'bg-emerald-600',
  };

  const updatedUsers = [...users, newUser];
  saveAdminUsers(updatedUsers);
  setCurrentAdmin(newUser);
  setAdminSession(true);
  return { success: true, user: newUser };
};

export const addAdminUser = (user: AdminUser): void => {
  const users = getAdminUsers();
  const updated = [...users, user];
  saveAdminUsers(updated);
};

export const updateAdminUser = (id: string, updates: Partial<AdminUser>): AdminUser[] => {
  const users = getAdminUsers();
  const updated = users.map(u => (u.id === id ? { ...u, ...updates } : u));
  saveAdminUsers(updated);

  // If current logged-in user was updated, sync current admin
  const current = getCurrentAdmin();
  if (current && current.id === id) {
    setCurrentAdmin({ ...current, ...updates });
  }
  return updated;
};

export const deleteAdminUser = (id: string): { success: boolean; message?: string } => {
  const users = getAdminUsers();
  const target = users.find(u => u.id === id);
  if (!target) {
    return { success: false, message: 'ไม่พบบัญชีผู้ดูแลระบบนี้' };
  }
  if (target.isProtected) {
    return { success: false, message: 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (Root Super Admin) ได้' };
  }
  const current = getCurrentAdmin();
  if (current && current.id === id) {
    return { success: false, message: 'ไม่สามารถลบบัญชีที่กำลังเข้าสู่ระบบอยู่ในขณะนี้ได้' };
  }

  const updated = users.filter(u => u.id !== id);
  saveAdminUsers(updated);
  return { success: true };
};

export const hasAdminPermission = (admin: AdminUser | null, permission: AdminPermission): boolean => {
  if (!admin) return false;
  if (admin.role === 'super_admin') return true;
  return admin.permissions?.includes(permission) || false;
};

// Page Views Tracking (แสดงปุ่มการเข้าชมเล็กๆ ของแต่ละหน้า)
export const getPageViews = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS);
    if (!raw) {
      savePageViews(INITIAL_PAGE_VIEWS);
      return INITIAL_PAGE_VIEWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading page views:', e);
    return INITIAL_PAGE_VIEWS;
  }
};

export const savePageViews = (views: Record<string, number>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, JSON.stringify(views));
  } catch (e) {
    console.error('Error saving page views:', e);
  }
};

export const incrementPageView = (pageId: string): number => {
  try {
    const views = getPageViews();
    const current = views[pageId] || 0;
    const updatedCount = current + 1;
    views[pageId] = updatedCount;
    savePageViews(views);
    return updatedCount;
  } catch (e) {
    console.error('Error incrementing page view:', e);
    return 1;
  }
};

export const getPageCount = (pageId: string): number => {
  const views = getPageViews();
  return views[pageId] || 0;
};

export const resetPageView = (pageId?: string): void => {
  const views = getPageViews();
  if (pageId) {
    views[pageId] = 0;
  } else {
    const allKeys = new Set([
      ...Object.keys(views),
      ...Object.keys(INITIAL_PAGE_VIEWS),
      'dashboard',
      'repository',
      'audit'
    ]);
    allKeys.forEach(k => { views[k] = 0; });
  }
  savePageViews(views);
  try {
    window.dispatchEvent(new CustomEvent('punehod_views_updated'));
  } catch (_) {}
};

// Today's Visitors Tracking (ผู้เข้าใช้งานวันนี้)
const TODAY_VISITORS_KEY = 'punehod_today_visitors_v1';

export const getTodayVisitors = (): number => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(TODAY_VISITORS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === todayStr) {
        return typeof data.count === 'number' ? data.count : 28;
      }
    }
    const initial = { date: todayStr, count: 28 };
    localStorage.setItem(TODAY_VISITORS_KEY, JSON.stringify(initial));
    return initial.count;
  } catch (e) {
    return 28;
  }
};

export const incrementTodayVisitors = (): number => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(TODAY_VISITORS_KEY);
    let count = 28;
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === todayStr) {
        const currentCount = typeof data.count === 'number' ? data.count : 28;
        count = currentCount + 1;
      } else {
        count = 1;
      }
    } else {
      count = 29;
    }
    localStorage.setItem(TODAY_VISITORS_KEY, JSON.stringify({ date: todayStr, count }));
    try {
      window.dispatchEvent(new CustomEvent('punehod_views_updated'));
    } catch (_) {}
    return count;
  } catch (e) {
    return 29;
  }
};

export const resetTodayVisitors = (): void => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem(TODAY_VISITORS_KEY, JSON.stringify({ date: todayStr, count: 0 }));
    try {
      window.dispatchEvent(new CustomEvent('punehod_views_updated'));
    } catch (_) {}
  } catch (e) {
    console.error('Error resetting today visitors:', e);
  }
};

export const resetAllVisitorCounts = (): void => {
  resetPageView();
  resetTodayVisitors();
  try {
    window.dispatchEvent(new CustomEvent('punehod_views_updated'));
  } catch (_) {}
};

// User's Own Uploaded Files Tracking (ผู้ใช้ทั่วไปจัดการไฟล์ของตัวเองได้)
const MY_FILE_IDS_KEY = 'punehod_my_file_ids_v1';
export const LAST_UPLOADER_KEY = 'punehod_last_uploader_name';

export const getMyFileIds = (): string[] => {
  try {
    const raw = localStorage.getItem(MY_FILE_IDS_KEY);
    if (!raw) {
      // Seed with initial non-official user file so user can test edit/delete immediately
      const initialSeed = ['pnhd-004'];
      localStorage.setItem(MY_FILE_IDS_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(raw);
  } catch {
    return ['pnhd-004'];
  }
};

export const addMyFileId = (fileId: string): void => {
  try {
    const ids = getMyFileIds();
    if (!ids.includes(fileId)) {
      ids.push(fileId);
      localStorage.setItem(MY_FILE_IDS_KEY, JSON.stringify(ids));
    }
  } catch (e) {
    console.error('Error saving my file id:', e);
  }
};

export const removeMyFileId = (fileId: string): void => {
  try {
    const ids = getMyFileIds().filter(id => id !== fileId);
    localStorage.setItem(MY_FILE_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Error removing my file id:', e);
  }
};

export const isMyFile = (fileOrId: { id?: string; uploaderName?: string } | string | null | undefined): boolean => {
  if (!fileOrId) return false;
  const fileId = typeof fileOrId === 'string' ? fileOrId : fileOrId.id;
  if (fileId && getMyFileIds().includes(fileId)) return true;

  if (typeof fileOrId === 'object' && fileOrId !== null) {
    try {
      const savedName = localStorage.getItem(LAST_UPLOADER_KEY);
      if (
        savedName &&
        savedName.trim() &&
        !['admin', 'ผู้ดูแลระบบ', 'ผู้ดูแลระบบ (admin)', 'admin (super admin)'].includes(savedName.trim().toLowerCase()) &&
        fileOrId.uploaderName &&
        fileOrId.uploaderName.trim().toLowerCase() === savedName.trim().toLowerCase()
      ) {
        return true;
      }
    } catch {
      // ignore
    }

    try {
      const current = getCurrentAdmin();
      if (
        current &&
        fileOrId.uploaderName &&
        (
          fileOrId.uploaderName.trim().toLowerCase() === current.displayName.trim().toLowerCase() ||
          fileOrId.uploaderName.trim().toLowerCase() === current.username.trim().toLowerCase()
        )
      ) {
        return true;
      }
    } catch {
      // ignore
    }
  }

  return false;
};

// Robust, bidirectional category matcher
export const matchesCategory = (
  fileCategory: string | undefined,
  targetCategory: string,
  categoriesList?: { id: string; label: string }[]
): boolean => {
  if (!fileCategory || !targetCategory || targetCategory === 'all') return true;

  const fCat = fileCategory.toLowerCase().trim();
  const tCat = targetCategory.toLowerCase().trim();

  if (fCat === tCat) return true;

  if (categoriesList && categoriesList.length > 0) {
    const targetObj = categoriesList.find(
      c => c.id.toLowerCase().trim() === tCat || c.label.toLowerCase().trim() === tCat
    );
    const fileObj = categoriesList.find(
      c => c.id.toLowerCase().trim() === fCat || c.label.toLowerCase().trim() === fCat
    );

    if (targetObj && fileObj && targetObj.id.toLowerCase().trim() === fileObj.id.toLowerCase().trim()) {
      return true;
    }

    if (targetObj && (fCat === targetObj.id.toLowerCase().trim() || fCat === targetObj.label.toLowerCase().trim())) {
      return true;
    }

    if (fileObj && (tCat === fileObj.id.toLowerCase().trim() || tCat === fileObj.label.toLowerCase().trim())) {
      return true;
    }
  }

  // Alias compatibility
  const driverSoftwareAliases = ['driver/software', 'driver', 'software', 'ไดร์เวอร์/ซอฟต์แวร์', 'ไดร์เวอร์', 'ซอฟต์แวร์', 'icc_profile', 'โปรไฟล์สี'];
  if (driverSoftwareAliases.includes(tCat) && driverSoftwareAliases.includes(fCat)) {
    return true;
  }

  const troubleshootingAliases = ['troubleshooting', 'การแก้ไขปัญหา'];
  if (troubleshootingAliases.includes(tCat) && troubleshootingAliases.includes(fCat)) {
    return true;
  }

  const maintenanceAliases = ['maintenance', 'การบำรุงรักษา'];
  if (maintenanceAliases.includes(tCat) && maintenanceAliases.includes(fCat)) {
    return true;
  }

  const manualAliases = ['manual', 'คู่มือ', 'คู่มือการใช้งาน'];
  if (manualAliases.includes(tCat) && manualAliases.includes(fCat)) {
    return true;
  }

  const videoAliases = ['video', 'วิดีโอ', 'วิดีโอสาธิต&การใช้งาน', 'วิดีโอสาธิต'];
  if (videoAliases.includes(tCat) && videoAliases.includes(fCat)) {
    return true;
  }

  return false;
};
