/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PrinterFile, 
  AuditLog, 
  NotificationItem, 
  SiteConfig,
  DashboardSectionId,
  MenuItemConfig,
  AdminUser
} from './types';
import {
  getFiles,
  saveFiles,
  getAuditLogs,
  addAuditLog,
  getNotifications,
  addNotification,
  markNotificationsAsRead,
  clearNotifications,
  getSiteConfig,
  saveSiteConfig,
  downloadPrinterFile,
  checkIsAdmin,
  setAdminSession,
  saveAuditLogs,
  playNotificationSound,
  resetDownloadCounters,
  resetToDefaultData,
  getTodayVisitors,
  incrementTodayVisitors,
  resetTodayVisitors,
  resetAllVisitorCounts,
  addMyFileId,
  removeMyFileId,
  isMyFile,
  LAST_UPLOADER_KEY,
  getCurrentAdmin,
  setCurrentAdmin,
  isUserAdmin,
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { FileRepository } from './components/FileRepository';
import { AuditTrailView } from './components/AuditTrailView';
import { CustomPageView } from './components/CustomPageView';
import { UploadModal } from './components/UploadModal';
import { FileDetailModal } from './components/FileDetailModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { PageCustomizerModal } from './components/PageCustomizerModal';
import { ConfirmModal } from './components/ConfirmModal';

import { 
  CheckCircle2, 
  X, 
  Phone, 
  ShieldCheck, 
  Settings,
  Upload,
  Sliders,
  Trash2,
  RotateCcw
} from 'lucide-react';

export default function App() {
  // Navigation & View State - Supports dynamic custom menus added by admin
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [repositoryInitialCategory, setRepositoryInitialCategory] = useState<string | undefined>(undefined);

  // Core Data States
  const [files, setFiles] = useState<PrinterFile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());
  
  // Auth State (Current logged in admin)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const user = getCurrentAdmin();
    return isUserAdmin(user) ? user : null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const user = getCurrentAdmin();
    return isUserAdmin(user);
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [todayVisitors, setTodayVisitors] = useState<number>(28);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadInitialCategory, setUploadInitialCategory] = useState<string | undefined>(undefined);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [selectedFileForDetail, setSelectedFileForDetail] = useState<PrinterFile | null>(null);
  const [isClearLogsModalOpen, setIsClearLogsModalOpen] = useState(false);
  const [isResetVisitorsModalOpen, setIsResetVisitorsModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<{ id: string; label: string } | null>(null);

  // Transient Toast Notification Banner
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; id: string } | null>(null);

  // Initial load
  useEffect(() => {
    setFiles(getFiles());
    setAuditLogs(getAuditLogs());
    setNotifications(getNotifications());
    const cfg = getSiteConfig();
    setSiteConfig(cfg);

    const user = getCurrentAdmin();
    const validAdmin = isUserAdmin(user) ? user : null;
    setCurrentUser(validAdmin);
    setIsAdmin(!!validAdmin);
    setTodayVisitors(incrementTodayVisitors());

    // Honor default landing tab from configuration
    if (cfg.defaultTab) {
      setActiveTab(cfg.defaultTab);
    }

    const handleViewsUpdated = () => {
      setTodayVisitors(getTodayVisitors());
    };
    window.addEventListener('punehod_views_updated', handleViewsUpdated);
    return () => {
      window.removeEventListener('punehod_views_updated', handleViewsUpdated);
    };
  }, []);

  // Guard: General users must never view revision history (audit tab)
  useEffect(() => {
    if (!isAdmin && activeTab === 'audit') {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  // Global Keyboard Shortcut: '/' or Ctrl/Cmd + K for Quick Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setIsQuickSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for File Upload / Add (เปิดให้อัพโหลดได้โดยตรง ไม่ต้องบังคับล๊อคอิน)
  const handleTriggerUpload = (category?: string) => {
    setUploadInitialCategory(category);
    setIsUploadOpen(true);
  };

  // Handlers for File Upload / Add
  const handleUploadSubmit = (fileData: Omit<PrinterFile, 'id' | 'uploadDate' | 'downloadCount' | 'status'>) => {
    const newFile: PrinterFile = {
      ...fileData,
      id: `pnhd-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      uploadDate: new Date().toISOString(),
      downloadCount: 0,
      status: 'approved',
    };

    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    saveFiles(updatedFiles);

    // Save as user's own file for deletion/editing rights
    addMyFileId(newFile.id);
    if (!isAdmin && newFile.uploaderName.trim()) {
      try {
        localStorage.setItem(LAST_UPLOADER_KEY, newFile.uploaderName.trim());
      } catch {
        // ignore
      }
    }

    // 1. Audit Trail Record
    addAuditLog(
      'upload',
      newFile.uploaderName,
      isAdmin ? 'admin' : 'user',
      newFile.title,
      isAdmin 
        ? `ผู้ดูแลระบบเพิ่มไฟล์ใหม่ "${newFile.title}" (${newFile.category.toUpperCase()})` 
        : `ผู้ใช้งานทั่วไปอัพโหลดไฟล์หมวดหมู่ ${newFile.category.toUpperCase()} ขนาด ${newFile.fileSize}`
    );
    setAuditLogs(getAuditLogs());

    // 2. Real-Time Notification System
    addNotification(
      `มีไฟล์ใหม่ในระบบ: ${newFile.title}`,
      `อัพโหลดโดยคุณ ${newFile.uploaderName} หมวดหมู่ ${newFile.category}`,
      newFile.uploaderName,
      '-',
      'new_upload',
      newFile.id
    );
    setNotifications(getNotifications());

    if (soundEnabled) {
      playNotificationSound();
    }

    // 3. Trigger Screen Toast Alert
    setToastMessage({
      title: 'บันทึกไฟล์สำเร็จและแจ้งเตือนเข้าสู่ระบบแล้ว!',
      message: `"${newFile.title}" โดย ${newFile.uploaderName} (${newFile.uploaderPhone})`,
      id: newFile.id,
    });
    setTimeout(() => setToastMessage(null), 6000);
  };

  // Download file handler
  const handleDownloadFile = (file: PrinterFile) => {
    downloadPrinterFile(file);
    setFiles(getFiles());
  };

  // Admin Pin / Unpin
  const handleTogglePin = (fileId: string) => {
    const updated = files.map(f => {
      if (f.id === fileId) {
        const nextState = !f.isPinned;
        addAuditLog(
          'pin',
          'ผู้ดูแลระบบ (Admin)',
          'admin',
          f.title,
          nextState ? 'ปักหมุดไฟล์เป็นไฟล์แนะนำสำคัญ' : 'ยกเลิกการปักหมุดไฟล์'
        );
        return { ...f, isPinned: nextState };
      }
      return f;
    });
    setFiles(updated);
    saveFiles(updated);
    setAuditLogs(getAuditLogs());
  };

  // File Deletion (Admin หรือ ผู้ใช้งานลบไฟล์ของตนเองได้)
  const handleDeleteFile = (fileId: string) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;

    const isOwner = isMyFile(target);
    if (!isAdmin && !isOwner) {
      setToastMessage({
        title: 'ไม่มีสิทธิ์ลบไฟล์นี้',
        message: 'คุณสามารถลบได้เฉพาะไฟล์ที่คุณเป็นผู้อัพโหลดเท่านั้น',
        id: fileId,
      });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const updated = files.filter(f => f.id !== fileId);
    setFiles(updated);
    saveFiles(updated);
    removeMyFileId(fileId);

    const actorName = isAdmin ? 'ผู้ดูแลระบบ (Admin)' : (target.uploaderName || 'ผู้ใช้งานทั่วไป');
    const actorRole = isAdmin ? 'admin' : 'user';

    addAuditLog(
      'delete',
      actorName,
      actorRole,
      target.title,
      isAdmin 
        ? `ลบไฟล์ "${target.title}" ออกจากคลังระบบ โดยผู้ดูแลระบบ` 
        : `ผู้ใช้งานลบไฟล์ของตนเอง "${target.title}" ออกจากระบบ`
    );
    setAuditLogs(getAuditLogs());

    setToastMessage({
      title: 'ลบไฟล์สำเร็จแล้ว',
      message: `ลบ "${target.title}" ออกจากระบบเรียบร้อย`,
      id: target.id,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // File Update (Admin หรือ ผู้ใช้งานแก้ไขไฟล์ของตนเองได้)
  const handleUpdateFile = (updatedFile: PrinterFile) => {
    const target = files.find(f => f.id === updatedFile.id);
    if (!target) return;

    const isOwner = isMyFile(target);
    if (!isAdmin && !isOwner) {
      setToastMessage({
        title: 'ไม่มีสิทธิ์แก้ไขไฟล์นี้',
        message: 'คุณสามารถแก้ไขได้เฉพาะไฟล์ที่คุณเป็นผู้อัพโหลดเท่านั้น',
        id: updatedFile.id,
      });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const safeUpdatedFile: PrinterFile = {
      ...updatedFile,
      isOfficial: isAdmin ? updatedFile.isOfficial : target.isOfficial,
      isPinned: isAdmin ? updatedFile.isPinned : target.isPinned,
    };

    const updated = files.map(f => f.id === safeUpdatedFile.id ? safeUpdatedFile : f);
    setFiles(updated);
    saveFiles(updated);

    const actorName = isAdmin ? 'ผู้ดูแลระบบ (Admin)' : (safeUpdatedFile.uploaderName || 'ผู้ใช้งานทั่วไป');
    const actorRole = isAdmin ? 'admin' : 'user';

    addAuditLog(
      'edit',
      actorName,
      actorRole,
      safeUpdatedFile.title,
      isAdmin 
        ? `ผู้ดูแลระบบแก้ไขข้อมูลและคำอธิบายของไฟล์ "${safeUpdatedFile.title}" สำเร็จ`
        : `ผู้ใช้งานแก้ไขข้อมูลไฟล์ของตนเอง "${safeUpdatedFile.title}" สำเร็จ`
    );
    setAuditLogs(getAuditLogs());
    setSelectedFileForDetail(safeUpdatedFile);

    setToastMessage({
      title: 'บันทึกการแก้ไขไฟล์สำเร็จ',
      message: `อัปเดตข้อมูล "${safeUpdatedFile.title}" เรียบร้อย`,
      id: safeUpdatedFile.id,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Move File Category (Admin ย้ายคู่มือไปยังหมวดอื่นได้)
  const handleMoveFileCategory = (fileId: string, newCategory: string) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;

    if (!isAdmin) {
      setToastMessage({
        title: 'ไม่มีสิทธิ์ย้ายหมวดหมู่',
        message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถย้ายหมวดหมู่คู่มือ/ไฟล์ได้',
        id: fileId,
      });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const categoriesList = siteConfig.categories || [];
    const getCatLabel = (catId: string) => {
      const found = categoriesList.find(
        c => c.id.toLowerCase().trim() === catId.toLowerCase().trim() || 
             c.label.toLowerCase().trim() === catId.toLowerCase().trim()
      );
      return found ? found.label : catId;
    };

    const oldCategoryLabel = getCatLabel(target.category);
    const newCategoryLabel = getCatLabel(newCategory);

    const safeUpdatedFile: PrinterFile = {
      ...target,
      category: newCategory,
    };

    const updated = files.map(f => f.id === fileId ? safeUpdatedFile : f);
    setFiles(updated);
    saveFiles(updated);

    if (selectedFileForDetail && selectedFileForDetail.id === fileId) {
      setSelectedFileForDetail(safeUpdatedFile);
    }

    const actorName = currentUser?.displayName || 'ผู้ดูแลระบบ (Admin)';
    addAuditLog(
      'edit',
      actorName,
      'admin',
      target.title,
      `ผู้ดูแลระบบย้ายหมวดหมู่คู่มือ "${target.title}" จากหมวด "${oldCategoryLabel}" ไปยังหมวด "${newCategoryLabel}" สำเร็จ`
    );
    setAuditLogs(getAuditLogs());

    setToastMessage({
      title: 'ย้ายหมวดหมู่สำเร็จ',
      message: `ย้ายคู่มือ "${target.title}" ไปยังหมวด "${newCategoryLabel}" เรียบร้อยแล้ว`,
      id: fileId,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick Menu Add from Navbar or anywhere
  const handleAddQuickMenu = (label: string, type: 'custom_page' | 'external_link', extraUrlOrTitle?: string) => {
    const newId = `menu-${Date.now().toString(36)}`;
    const newMenu: MenuItemConfig = {
      id: newId,
      label,
      visible: true,
      order: (siteConfig.menuItems?.length || 0) + 1,
      type,
      pageTitle: type === 'custom_page' ? (extraUrlOrTitle || label) : undefined,
      pageContent: type === 'custom_page' ? '' : undefined,
      externalUrl: type === 'external_link' ? extraUrlOrTitle : undefined,
      isDeletable: true,
    };
    const updatedMenus = [...(siteConfig.menuItems || []), newMenu];
    const updatedConfig = { ...siteConfig, menuItems: updatedMenus };
    handleSaveConfig(updatedConfig);

    addAuditLog(
      'config_update',
      'ผู้ดูแลระบบ (Admin)',
      'admin',
      `เพิ่มเมนูใหม่: "${label}"`,
      `เพิ่มเมนูใหม่สู่แถบนำทาง (${type === 'custom_page' ? 'หน้าบทความ' : 'ลิงก์ภายนอก'})`
    );
    setAuditLogs(getAuditLogs());

    if (type === 'custom_page') {
      setActiveTab(newId);
    }

    setToastMessage({
      title: 'เพิ่มเมนูใหม่สำเร็จแล้ว',
      message: `เพิ่มเมนู "${label}" สู่แถบนำทางเรียบร้อย`,
      id: newId,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Menu Delete Trigger
  const handleDeleteMenu = (menuId: string, menuLabel: string) => {
    setMenuToDelete({ id: menuId, label: menuLabel });
  };

  const confirmDeleteMenu = () => {
    if (!menuToDelete) return;
    const { id: menuId, label: menuLabel } = menuToDelete;
    const updatedMenus = (siteConfig.menuItems || []).filter(m => m.id !== menuId);
    const updatedConfig = { ...siteConfig, menuItems: updatedMenus };
    handleSaveConfig(updatedConfig);

    addAuditLog(
      'config_update',
      'ผู้ดูแลระบบ (Admin)',
      'admin',
      `ลบเมนู: "${menuLabel}"`,
      `ลบเมนูออกจากแถบนำทางระบบ`
    );
    setAuditLogs(getAuditLogs());

    if (activeTab === menuId) {
      setActiveTab('dashboard');
    }

    setToastMessage({
      title: 'ลบเมนูสำเร็จ',
      message: `ลบเมนู "${menuLabel}" ออกจากแถบนำทางแล้ว`,
      id: menuId,
    });
    setTimeout(() => setToastMessage(null), 4000);
    setMenuToDelete(null);
  };

  // Clear Audit Logs
  const handleClearAllAuditLogs = () => {
    saveAuditLogs([]);
    setAuditLogs([]);
    setToastMessage({
      title: 'ล้างบันทึกประวัติการทำงานสำเร็จ',
      message: 'ประวัติการอัพโหลด แก้ไข และกิจกรรมทั้งหมดถูกล้างแล้ว (0 รายการ)',
      id: 'clear-logs',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clear Notifications
  const handleClearNotifications = () => {
    clearNotifications();
    setNotifications([]);
    setToastMessage({
      title: 'ล้างการแจ้งเตือนสำเร็จ',
      message: 'รายการแจ้งเตือนทั้งหมดถูกลบเรียบร้อยแล้ว',
      id: 'clear-notif',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset Download Counters
  const handleResetDownloadCounters = () => {
    resetDownloadCounters();
    setFiles(getFiles());
    setToastMessage({
      title: 'รีเซ็ตยอดดาวน์โหลดสำเร็จ',
      message: 'จำนวนครั้งที่ดาวน์โหลดของทุกไฟล์ถูกรีเซ็ตเป็น 0',
      id: 'reset-downloads',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset Today Visitors (แอดมินรีเซ็ตสถิติผู้เข้าชมวันนี้)
  const handleResetTodayVisitors = () => {
    resetTodayVisitors();
    setTodayVisitors(0);
    addAuditLog(
      'admin_manage',
      'ผู้ดูแลระบบ (Admin)',
      'admin',
      'รีเซ็ตสถิติผู้เข้าชมวันนี้',
      'ผู้ดูแลระบบทำการรีเซ็ตสถิติผู้เข้าใช้งานวันนี้เป็น 0'
    );
    setAuditLogs(getAuditLogs());
    setToastMessage({
      title: 'รีเซ็ตสถิติสำเร็จ',
      message: 'ยอดผู้เข้าใช้งานวันนี้ถูกรีเซ็ตเป็น 0 เรียบร้อยแล้ว',
      id: 'reset-today-visitors',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset All System Visitors (แอดมินรีเซ็ตสถิติการเข้าชมระบบทั้งหมด)
  const handleResetAllVisitors = () => {
    resetAllVisitorCounts();
    setTodayVisitors(0);
    addAuditLog(
      'admin_manage',
      'ผู้ดูแลระบบ (Admin)',
      'admin',
      'รีเซ็ตสถิติการเข้าชมระบบทั้งหมด',
      'ผู้ดูแลระบบทำการรีเซ็ตสถิติยอดการเข้าชมระบบทุกหน้าและยอดวันนี้กลับเป็น 0 ทั้งหมด'
    );
    setAuditLogs(getAuditLogs());
    setToastMessage({
      title: 'รีเซ็ตสถิติการเข้าชมระบบสำเร็จ',
      message: 'ยอดผู้เข้าชมระบบของทุกหน้าและสถิติวันนี้ถูกรีเซ็ตเป็น 0 ทั้งหมดแล้ว',
      id: 'reset-all-visitors',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Factory Reset
  const handleFactoryReset = () => {
    resetToDefaultData();
    setFiles(getFiles());
    setAuditLogs(getAuditLogs());
    setNotifications(getNotifications());
    setSiteConfig(getSiteConfig());
    setActiveTab('dashboard');
    setToastMessage({
      title: 'คืนค่าระบบสู่ค่าเริ่มต้นโรงงานสำเร็จ',
      message: 'คืนค่าเมนู ข้อความ และไฟล์เริ่มต้นของระบบเรียบร้อย',
      id: 'factory-reset',
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Login / Logout handlers (ผู้ดูแลระบบ Admin เท่านั้น)
  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setIsAdmin(true);
    setAdminSession(true);
    setCurrentAdmin(user);

    addAuditLog(
      'approve',
      user.displayName || user.username,
      'admin',
      'เข้าสู่ระบบ Admin สำเร็จ',
      `${user.displayName} เข้าสู่ระบบผู้ดูแลระบบสำเร็จ (${user.roleTitle || user.role})`
    );
    setAuditLogs(getAuditLogs());

    setToastMessage({
      title: 'เข้าสู่ระบบ Admin สำเร็จแล้ว',
      message: `ยินดีต้อนรับผู้ดูแลระบบ: คุณ ${user.displayName} (${user.roleTitle || 'ผู้ดูแลระบบ'})`,
      id: `login-${Date.now()}`,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    const prevName = currentUser?.displayName || 'ผู้ดูแลระบบ';
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminSession(false);
    setCurrentAdmin(null);
    setToastMessage({
      title: 'ออกจากระบบสำเร็จ',
      message: `ออกจากระบบผู้ดูแลระบบ ${prevName} เรียบร้อยแล้ว`,
      id: 'logout-toast',
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Configuration (Layout, Texts & Menus)
  const handleSaveConfig = (cfg: SiteConfig) => {
    setSiteConfig(cfg);
    saveSiteConfig(cfg);
    addAuditLog(
      'config_update',
      'ผู้ดูแลระบบ (Admin)',
      'admin',
      'ปรับแต่งการจัดตำแหน่งหน้าเว็บ & เมนู',
      'อัปเดตลำดับส่วนประกอบบนหน้าเว็บ ข้อความ และการแสดงผลเมนู'
    );
    setAuditLogs(getAuditLogs());
  };

  // Quick inline reordering of sections on Dashboard
  const handleReorderSection = (sectionId: DashboardSectionId, direction: 'up' | 'down') => {
    const currentSections = [...siteConfig.sections].sort((a, b) => a.order - b.order);
    const index = currentSections.findIndex(s => s.id === sectionId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSections.length) return;

    const [moved] = currentSections.splice(index, 1);
    currentSections.splice(targetIndex, 0, moved);

    const updatedSections = currentSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    const updatedConfig = { ...siteConfig, sections: updatedSections };
    handleSaveConfig(updatedConfig);
  };

  const handleToggleSectionVisibility = (sectionId: DashboardSectionId) => {
    const updatedSections = siteConfig.sections.map(s => 
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    const updatedConfig = { ...siteConfig, sections: updatedSections };
    handleSaveConfig(updatedConfig);
  };

  // Navigation helper
  const navigateToRepository = (categoryFilter?: string) => {
    setRepositoryInitialCategory(categoryFilter);
    setActiveTab('repository');
  };

  const openFileById = (fileId: string) => {
    const found = files.find(f => f.id === fileId);
    if (found) {
      setSelectedFileForDetail(found);
    } else {
      setActiveTab('repository');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        currentUser={currentUser}
        currentAdmin={currentUser}
        siteConfig={siteConfig}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenUpload={() => handleTriggerUpload(undefined)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onAddQuickMenu={handleAddQuickMenu}
        onDeleteMenu={handleDeleteMenu}
        notifications={notifications}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onViewsUpdated={() => setTodayVisitors(getTodayVisitors())}
      />

      {/* Real-time Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md w-full bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{toastMessage.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.message}</p>
              {toastMessage.id.startsWith('pnhd-') && (
                <button
                  onClick={() => {
                    openFileById(toastMessage.id);
                    setToastMessage(null);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline mt-1 block"
                >
                  ดูรายละเอียดไฟล์ทันที &rarr;
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Action Sub-bar when logged in */}
      {isAdmin && (
        <div className="bg-emerald-950 text-emerald-200 border-b border-emerald-800/80 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>โหมดผู้ดูแลระบบ: สิทธิ <strong>เพิ่ม/ลบ/แก้ไขหัวข้อ</strong> และ <strong>ปรับแต่งตำแหน่งทั้งเว็บไซต์</strong></span>
            </div>
            <div className="flex items-center gap-2">
              {/* ปุ่มจัดการระบบ สำหรับแอดมิน */}
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="จัดการระบบ: เพิ่ม ลบ แก้ไขหัวข้อ และปรับตำแหน่งทั้งเว็บไซต์"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>จัดการระบบ</span>
              </button>
              <button
                onClick={() => setIsResetVisitorsModalOpen(true)}
                className="px-2.5 py-1.5 bg-emerald-900/90 hover:bg-rose-900/80 text-emerald-200 hover:text-rose-200 font-medium rounded-lg border border-emerald-700 hover:border-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="รีเซ็ตสถิติการเข้าชมระบบทั้งหมดเป็น 0"
              >
                <RotateCcw className="w-3 h-3 text-rose-400" />
                <span>รีเซ็ตผู้เข้าชม</span>
              </button>
              <button
                onClick={() => setIsClearLogsModalOpen(true)}
                className="px-2.5 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 hover:text-white font-medium rounded-lg border border-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="ล้างบันทึกประวัติการทำงานทั้งหมด"
              >
                <Trash2 className="w-3 h-3" />
                <span>ล้างบันทึก</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-2.5 py-1.5 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 hover:text-white font-medium rounded-lg border border-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>ตั้งค่าประกาศ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            files={files}
            auditLogs={auditLogs}
            siteConfig={siteConfig}
            isAdmin={isAdmin}
            todayVisitors={todayVisitors}
            onNavigateToRepository={navigateToRepository}
            onNavigateToAudit={() => setActiveTab('audit')}
            onOpenFileDetail={(file) => setSelectedFileForDetail(file)}
            onOpenUpload={() => handleTriggerUpload(undefined)}
            onDownloadFile={handleDownloadFile}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onReorderSection={handleReorderSection}
            onToggleSectionVisibility={handleToggleSectionVisibility}
            onClearLogs={handleClearAllAuditLogs}
            onUpdateBannerImage={(newUrl) => handleSaveConfig({ ...siteConfig, heroImageUrl: newUrl })}
            onResetTodayVisitors={handleResetTodayVisitors}
            onResetVisitors={handleResetAllVisitors}
            onMoveCategory={isAdmin ? handleMoveFileCategory : undefined}
          />
        )}

        {activeTab === 'repository' && (
          <FileRepository
            files={files}
            initialCategory={repositoryInitialCategory}
            isAdmin={isAdmin}
            currentUser={currentUser}
            isLoggedIn={isAdmin}
            onOpenFileDetail={(file) => setSelectedFileForDetail(file)}
            onDownloadFile={handleDownloadFile}
            onTogglePin={isAdmin ? handleTogglePin : undefined}
            onDeleteFile={handleDeleteFile}
            onOpenUpload={(cat) => handleTriggerUpload(cat)}
            availableCategories={siteConfig.categories}
            onMoveCategory={isAdmin ? handleMoveFileCategory : undefined}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView
            logs={auditLogs}
            isAdmin={isAdmin}
            onClearLogs={handleClearAllAuditLogs}
          />
        )}

        {/* Custom Menu Pages created by Admin */}
        {activeTab !== 'dashboard' && activeTab !== 'repository' && activeTab !== 'audit' && (() => {
          const currentCustomMenu = (siteConfig.menuItems || []).find(m => m.id === activeTab);
          if (currentCustomMenu) {
            return (
              <CustomPageView
                menuItem={currentCustomMenu}
                isAdmin={isAdmin}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenCustomizer={() => setIsCustomizerOpen(true)}
                onUpdateMenuContent={(newTitle, newContent) => {
                  const updatedMenus = (siteConfig.menuItems || []).map(m =>
                    m.id === currentCustomMenu.id
                      ? { ...m, pageTitle: newTitle, pageContent: newContent }
                      : m
                  );
                  handleSaveConfig({ ...siteConfig, menuItems: updatedMenus });
                  setToastMessage({
                    title: 'บันทึกเนื้อหาหน้าเว็บสำเร็จ',
                    message: `อัปเดตหน้า "${newTitle}" เรียบร้อยแล้ว`,
                    id: currentCustomMenu.id,
                  });
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                onDeleteMenu={() => handleDeleteMenu(currentCustomMenu.id, currentCustomMenu.label)}
              />
            );
          }
          return (
            <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">ไม่พบหน้านี้ หรือเมนูถูกลบออกจากระบบแล้ว</h3>
              <p className="text-xs text-slate-500">กรุณาเลือกเมนูอื่นจากแถบนำทางด้านบน</p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                กลับสู่หน้าหลักแดชบอร์ด
              </button>
            </div>
          );
        })()}
      </main>

      {/* Clean Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-12 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="font-bold text-slate-200 text-sm sm:text-base">
              {siteConfig.siteTitle || 'Passport Printer PUNEHOD A4'}
            </div>
            <div className="text-xs sm:text-sm text-slate-400">
              {siteConfig.siteSubtitle || 'จัดเก็บคู่มือ ไดร์เวอร์ ซอฟต์แวร์ AcroRIP และโปรไฟล์สีสำหรับเครื่องพิมพ์เล่มหนังสือเดินทาง Punehod A4'}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <span>คลังเอกสารและโปรแกรมทางการ Passport Printer</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadInitialCategory(undefined);
        }}
        onSubmitUpload={handleUploadSubmit}
        isAdmin={isAdmin}
        currentUser={currentUser}
        availableCategories={siteConfig.categories}
        defaultCategory={uploadInitialCategory}
      />

      <FileDetailModal
        file={selectedFileForDetail}
        isOpen={selectedFileForDetail !== null}
        onClose={() => setSelectedFileForDetail(null)}
        isAdmin={isAdmin}
        availableCategories={siteConfig.categories}
        onDownloadFile={handleDownloadFile}
        onUpdateFile={handleUpdateFile}
        onDeleteFile={handleDeleteFile}
        onTogglePin={handleTogglePin}
        onMoveCategory={isAdmin ? handleMoveFileCategory : undefined}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          markNotificationsAsRead();
          setNotifications(getNotifications());
        }}
        onClearAll={handleClearNotifications}
        onSelectFileById={openFileById}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        siteConfig={siteConfig}
        onSaveConfig={handleSaveConfig}
      />

      <PageCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        siteConfig={siteConfig}
        onSaveConfig={handleSaveConfig}
        onClearLogs={handleClearAllAuditLogs}
        onClearNotifications={handleClearNotifications}
        onResetDownloads={handleResetDownloadCounters}
        onFactoryReset={handleFactoryReset}
        onResetVisitors={handleResetAllVisitors}
      />

      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        files={files}
        onSelectFile={(f) => setSelectedFileForDetail(f)}
        onDownloadFile={handleDownloadFile}
      />

      {/* Confirmation Dialog for Clearing Logs */}
      <ConfirmModal
        isOpen={isClearLogsModalOpen}
        title="ยืนยันการล้างประวัติการแก้ไขทั้งหมด"
        message="คุณต้องการล้างรายการประวัติการทำงาน บันทึกการอัพโหลด และกิจกรรมทั้งหมดออกจากระบบอย่างถาวรหรือไม่? รายการทั้งหมดจะถูกลบออกทันทีและไม่สามารถย้อนกลับได้"
        confirmLabel="ยืนยันล้างบันทึกทั้งหมด"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={handleClearAllAuditLogs}
        onClose={() => setIsClearLogsModalOpen(false)}
      />

      {/* Confirmation Dialog for Deleting Menu */}
      <ConfirmModal
        isOpen={menuToDelete !== null}
        title={`ยืนยันการลบเมนู "${menuToDelete?.label}"`}
        message={`คุณต้องการลบเมนู "${menuToDelete?.label}" ออกจากแถบนำทางอย่างถาวรหรือไม่?`}
        confirmLabel="ลบเมนูนี้"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={confirmDeleteMenu}
        onClose={() => setMenuToDelete(null)}
      />

      {/* Confirmation Dialog for Resetting System Visitors */}
      <ConfirmModal
        isOpen={isResetVisitorsModalOpen}
        title="ยืนยันการรีเซ็ตสถิติผู้เข้าชมระบบทั้งหมด"
        message="คุณต้องการรีเซ็ตสถิติยอดผู้เข้าชมของทุกหน้า และสถิติผู้เข้าใช้งานวันนี้กลับเป็น 0 ทั้งหมดหรือไม่? ข้อมูลจะถูกรีเซ็ตทันที"
        confirmLabel="ยืนยันรีเซ็ตเป็น 0"
        cancelLabel="ยกเลิก"
        variant="warning"
        onConfirm={() => {
          handleResetAllVisitors();
          setIsResetVisitorsModalOpen(false);
        }}
        onClose={() => setIsResetVisitorsModalOpen(false)}
      />
    </div>
  );
};
