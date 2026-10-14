export type PrinterFileCategory = 
  | 'manual'          // คู่มือการใช้งาน
  | 'driver/software' // ไดร์เวอร์/ซอฟต์แวร์
  | 'troubleshooting' // การแก้ไขปัญหา
  | 'Maintenance'     // การบำรุงรักษา
  | 'video'           // วิดีโอสาธิต&การใช้งาน
  | string;           // Custom categories created by Admin

export interface PrinterFile {
  id: string;
  title: string;
  category: PrinterFileCategory;
  fileType: string;         // 'pdf', 'zip', 'exe', 'dmg', 'icc', 'docx', etc.
  fileName: string;
  fileSize: string;         // '15.4 MB'
  fileSizeBytes: number;
  description: string;
  uploaderName: string;     // ชื่อผู้ส่ง (Mandatory)
  uploaderPhone: string;    // เบอร์ติดต่อ (Mandatory)
  uploaderContactExtra?: string; // LINE ID, Email
  uploadDate: string;       // ISO string
  downloadCount: number;
  status: 'approved' | 'pending_review';
  isPinned?: boolean;
  isOfficial?: boolean;
  fileUrl?: string;         // Data URL or object URL or external download link
  checksum?: string;
  downloadUrl?: string;
}

export type AuditAction = 
  | 'upload'
  | 'approve'
  | 'edit'
  | 'delete'
  | 'pin'
  | 'clear_logs'
  | 'config_update'
  | 'admin_manage';

export type AdminPermission = 
  | 'manage_files'       // จัดการและแก้ไขไฟล์ (เพิ่ม/ลบ/ปักหมุด/อนุมัติ)
  | 'manage_menus'       // เพิ่ม ลบ แก้ไขเมนูและหน้าบทความ
  | 'manage_customizer'  // ปรับแต่งธีมและเลย์เอาต์หน้าเว็บ
  | 'manage_audit'       // ล้างประวัติการแก้ไขและบันทึก
  | 'manage_admins'      // เพิ่ม ลบ แก้ไขสิทธิ์ผู้ดูแลระบบ
  | 'manage_system';     // ตั้งค่าระบบและรีเซ็ตข้อมูล

export type AdminRole = 'super_admin' | 'editor' | 'moderator' | 'user' | 'custom';

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  role: AdminRole;
  roleTitle: string;
  permissions: AdminPermission[];
  isProtected?: boolean; // Root admin protection from accidental deletion
  createdAt: string;
  lastLogin?: string;
  avatarColor?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;
  actorName: string;
  actorRole: 'user' | 'admin' | 'system';
  targetTitle: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  fileId?: string;
  uploaderName: string;
  uploaderPhone: string;
  type: 'new_upload' | 'system_alert';
}

export type DashboardSectionId = 
  | 'announcement'
  | 'hero'
  | 'metrics'
  | 'official_files'
  | 'audit_log'
  | 'support_hotline'
  | string;

export interface DashboardSectionConfig {
  id: DashboardSectionId;
  label: string;
  visible: boolean;
  order: number;
}

export interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  type?: 'builtin' | 'custom_page' | 'external_link';
  pageTitle?: string;
  pageContent?: string;
  externalUrl?: string;
  isDeletable?: boolean;
}

export interface HardwareSpec {
  id: string;
  label: string;
  value: string;
}

export interface CategoryConfig {
  id: string;
  label: string;
}

export interface PageBannerConfig {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  visible: boolean;
}

export interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  logoLetter: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  heroModelCode: string;
  heroAlign: 'left' | 'center';
  heroSpecs: HardwareSpec[];
  bannerText?: string;
  announcement: string;
  announcementTheme: 'amber' | 'blue' | 'emerald' | 'rose';
  supportPhone: string;
  supportLine: string;
  workingHours: string;
  footerText: string;
  allowPublicUploads: boolean;
  adminUsername?: string;
  defaultTab: string;
  dashboardLayout: 'split' | 'stacked';
  sections: DashboardSectionConfig[];
  menuItems: MenuItemConfig[];
  categories: CategoryConfig[];
  pageBanners?: Record<string, PageBannerConfig>;
}
