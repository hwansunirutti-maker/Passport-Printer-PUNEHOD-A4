import React, { useState } from 'react';
import { 
  Bell, 
  Upload, 
  Shield, 
  ShieldCheck, 
  Search, 
  History, 
  FolderArchive, 
  LayoutDashboard, 
  Volume2, 
  VolumeX, 
  Sliders, 
  ExternalLink, 
  FileText,
  Plus,
  Trash2,
  Menu as MenuIcon,
  X,
  Users
} from 'lucide-react';
import { NotificationItem, SiteConfig, MenuItemConfig, AdminUser } from '../types';
import { PageViewBadge } from './PageViewBadge';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  siteConfig: SiteConfig;
  currentUser?: AdminUser | null;
  currentAdmin?: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenUpload: () => void;
  onOpenNotifications: () => void;
  onOpenQuickSearch: () => void;
  onOpenCustomizer?: () => void;
  onOpenAdminPermissions?: () => void;
  onAddQuickMenu?: (label: string, type: 'custom_page' | 'external_link', extraUrlOrTitle?: string) => void;
  onDeleteMenu?: (id: string, label: string) => void;
  notifications: NotificationItem[];
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onViewsUpdated?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  siteConfig,
  currentUser = null,
  currentAdmin,
  onOpenLogin,
  onLogout,
  onOpenUpload,
  onOpenNotifications,
  onOpenQuickSearch,
  onOpenCustomizer,
  onOpenAdminPermissions,
  onAddQuickMenu,
  onDeleteMenu,
  notifications,
  soundEnabled,
  setSoundEnabled,
  onViewsUpdated,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuType, setNewMenuType] = useState<'custom_page' | 'external_link'>('custom_page');
  const [newMenuExtra, setNewMenuExtra] = useState('');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Render ordered, visible menu items (Audit log is hidden from general users)
  const menuItems = (siteConfig.menuItems || [
    { id: 'dashboard', label: 'แดชบอร์ดหลัก', visible: true, order: 1, type: 'builtin' },
    { id: 'repository', label: 'คลังไฟล์ & ค้นหา', visible: true, order: 2, type: 'builtin' },
    { id: 'audit', label: 'ประวัติการแก้ไข', visible: true, order: 3, type: 'builtin' },
  ])
    .filter(item => item.visible !== false && (item.id !== 'audit' || isAdmin))
    .sort((a, b) => a.order - b.order);

  const getMenuIcon = (item: MenuItemConfig) => {
    if (item.type === 'external_link') {
      return <ExternalLink className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (item.type === 'custom_page') {
      return <FileText className="w-4 h-4 text-blue-400" />;
    }
    switch (item.id) {
      case 'dashboard':
        return <LayoutDashboard className="w-4 h-4 text-slate-400" />;
      case 'repository':
        return <FolderArchive className="w-4 h-4 text-slate-400" />;
      case 'audit':
        return <History className="w-4 h-4 text-slate-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel.trim()) return;
    if (onAddQuickMenu) {
      onAddQuickMenu(newMenuLabel.trim(), newMenuType, newMenuExtra.trim());
      setNewMenuLabel('');
      setNewMenuExtra('');
      setQuickAddOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Brand Wordmark with Customizable Text */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner group-hover:bg-blue-500 transition-colors shrink-0">
                <span className="font-mono text-base">{siteConfig.logoLetter || 'P'}</span>
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block group-hover:text-blue-300 transition-colors truncate max-w-[200px] sm:max-w-xs md:max-w-none">
                  {siteConfig.siteTitle || 'Passport Printer PUNEHOD A4'}
                </span>
                <span className="text-[11px] text-slate-400 font-normal hidden sm:block -mt-0.5 truncate max-w-sm">
                  {siteConfig.siteSubtitle || 'ศูนย์จัดเก็บข้อมูลคู่มือและไดร์เวอร์'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Ordered, Added & Deleted by Admin) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
            {menuItems.map((item) => {
              if (item.type === 'external_link' && item.externalUrl) {
                return (
                  <div key={item.id} className="relative group/menu flex items-center">
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors whitespace-nowrap"
                    >
                      {getMenuIcon(item)}
                      <span>{item.label}</span>
                    </a>
                    {isAdmin && onDeleteMenu && item.isDeletable !== false && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteMenu(item.id, item.label);
                        }}
                        className="opacity-0 group-hover/menu:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-all -ml-1 mr-1"
                        title="ลบเมนูนี้"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.id} className="relative group/menu flex items-center">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === item.id
                        ? 'bg-slate-800 text-blue-400 border border-slate-700/80 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {getMenuIcon(item)}
                    <span>{item.label}</span>
                  </button>

                  {isAdmin && onDeleteMenu && item.isDeletable !== false && item.id !== 'dashboard' && item.id !== 'repository' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMenu(item.id, item.label);
                      }}
                      className="opacity-0 group-hover/menu:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-all -ml-1 mr-1"
                      title="ลบเมนูนี้"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Admin Direct "+ เพิ่มเมนู" Button in Navbar */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setQuickAddOpen(!quickAddOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-300 bg-blue-950/70 hover:bg-blue-900 border border-blue-800/70 rounded-lg transition-colors ml-1"
                  title="เพิ่มเมนูใหม่สู่แถบนำทาง"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มเมนู</span>
                </button>

                {/* Quick Add Menu Dropdown Form */}
                {quickAddOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        <span>เพิ่มเมนูใหม่</span>
                      </span>
                      <button
                        onClick={() => setQuickAddOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <form onSubmit={handleQuickAddSubmit} className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          ชื่อปุ่มเมนู <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newMenuLabel}
                          onChange={(e) => setNewMenuLabel(e.target.value)}
                          placeholder="เช่น ข้อควรระวัง"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          ประเภทเมนู
                        </label>
                        <select
                          value={newMenuType}
                          onChange={(e) => setNewMenuType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-medium"
                        >
                          <option value="custom_page">สร้างหน้าเนื้อหาใหม่ (Custom Page)</option>
                          <option value="external_link">เปิดลิงก์ภายนอก (External Link)</option>
                        </select>
                      </div>

                      {newMenuType === 'external_link' ? (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            URL ปลายทาง
                          </label>
                          <input
                            type="url"
                            value={newMenuExtra}
                            onChange={(e) => setNewMenuExtra(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            หัวข้อหน้าเนื้อหา
                          </label>
                          <input
                            type="text"
                            value={newMenuExtra}
                            onChange={(e) => setNewMenuExtra(e.target.value)}
                            placeholder="พิมพ์หัวข้อหน้าเนื้อหา..."
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setQuickAddOpen(false)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-xs"
                        >
                          เพิ่มเมนู
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Zone 3: Actions - Includes top right visitor counter */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick search shortcut trigger */}
            <button
              onClick={onOpenQuickSearch}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-700 transition-colors"
              title="ค้นหาด่วน (Ctrl+K หรือ /)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden lg:inline">ค้นหา...</span>
              <kbd className="hidden lg:inline text-xs bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-700">
                /
              </kbd>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              title="การแจ้งเตือนไฟล์ใหม่"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-red-500 rounded-full border-2 border-slate-900 tabular-nums animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Admin Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                {(currentUser || currentAdmin) && (
                  <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{(currentUser || currentAdmin)?.displayName}</span>
                  </span>
                )}

                {onOpenAdminPermissions && (
                  <button
                    onClick={onOpenAdminPermissions}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-emerald-200 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    title="จัดการสิทธิ์ผู้ดูแลระบบ (เพิ่ม ลบ แก้ไขสิทธิ์แอดมิน)"
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="hidden md:inline">จัดการสิทธิ์</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  title="คลิกเพื่อออกจากระบบ Admin"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">ออกระบบ</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
                title="เข้าสู่ระบบผู้ดูแลระบบ (Admin Only)"
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <span>เข้าสู่ระบบ Admin</span>
              </button>
            )}

            {/* 1. จำนวนผู้เข้าชมย้ายไปอยู่มุมขวาบน */}
            <div className="flex items-center pl-1 shrink-0">
              <PageViewBadge
                pageId={activeTab}
                pageName={
                  activeTab === 'dashboard'
                    ? 'แดชบอร์ดหลัก'
                    : activeTab === 'repository'
                    ? 'คลังไฟล์ & ค้นหา'
                    : activeTab === 'audit'
                    ? 'ประวัติการแก้ไข'
                    : 'ระบบ'
                }
                isAdmin={isAdmin}
                variant="dark"
                onViewsUpdated={onViewsUpdated}
              />
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-1">
            เมนูนำทาง
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                {item.type === 'external_link' && item.externalUrl ? (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
                  >
                    {getMenuIcon(item)}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-left ${
                      activeTab === item.id
                        ? 'bg-slate-800 text-blue-400 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {getMenuIcon(item)}
                    <span>{item.label}</span>
                  </button>
                )}

                {isAdmin && onDeleteMenu && item.isDeletable !== false && item.id !== 'dashboard' && item.id !== 'repository' && (
                  <button
                    onClick={() => onDeleteMenu(item.id, item.label)}
                    className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-lg"
                    title="ลบเมนูนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAdmin ? (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between px-2 py-1 bg-slate-800/80 rounded-lg text-xs">
                <span className="text-slate-300">ผู้ดูแลระบบ: <strong className="text-white">{(currentUser || currentAdmin)?.displayName}</strong></span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded font-medium">
                  {(currentUser || currentAdmin)?.roleTitle || 'ผู้ดูแลระบบ'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onOpenAdminPermissions && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminPermissions();
                    }}
                    className="flex-1 py-2 text-xs text-center font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>จัดการสิทธิ์</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="flex-1 py-2 px-3 text-xs text-center font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white rounded-lg border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ออกระบบ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2.5 px-3 text-xs text-center font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <span>เข้าสู่ระบบ Admin</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
