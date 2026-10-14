import React, { useState } from 'react';
import { 
  X, 
  Layout, 
  Sliders, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Type, 
  Menu, 
  Sparkles,
  Columns,
  Maximize2,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  AlertTriangle,
  FolderPlus,
  HardDrive
} from 'lucide-react';
import { SiteConfig, DashboardSectionConfig, MenuItemConfig, CategoryConfig, HardwareSpec } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface PageCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  onSaveConfig: (cfg: SiteConfig) => void;
  onClearLogs?: () => void;
  onClearNotifications?: () => void;
  onResetDownloads?: () => void;
  onFactoryReset?: () => void;
  onResetVisitors?: () => void;
}

export const PageCustomizerModal: React.FC<PageCustomizerModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  onSaveConfig,
  onClearLogs,
  onClearNotifications,
  onResetDownloads,
  onFactoryReset,
  onResetVisitors,
}) => {
  const [activeTab, setActiveTab] = useState<'menus' | 'sections' | 'texts' | 'categories' | 'maintenance'>('menus');
  
  // Menus State (Add, Delete, Reorder, Edit)
  const [menuItems, setMenuItems] = useState<MenuItemConfig[]>(
    [...(siteConfig.menuItems || [])].sort((a, b) => a.order - b.order)
  );
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuType, setNewMenuType] = useState<'custom_page' | 'external_link'>('custom_page');
  const [newMenuPageTitle, setNewMenuPageTitle] = useState('');
  const [newMenuPageContent, setNewMenuPageContent] = useState('');
  const [newMenuExternalUrl, setNewMenuExternalUrl] = useState('');

  // Sections State
  const [sections, setSections] = useState<DashboardSectionConfig[]>(
    [...(siteConfig.sections || [])].sort((a, b) => a.order - b.order)
  );
  const [dashboardLayout, setDashboardLayout] = useState<'split' | 'stacked'>(siteConfig.dashboardLayout || 'split');
  const [defaultTab, setDefaultTab] = useState<string>(siteConfig.defaultTab || 'dashboard');
  
  // Texts State
  const [siteTitle, setSiteTitle] = useState(siteConfig.siteTitle || 'Passport Printer PUNEHOD A4');
  const [siteSubtitle, setSiteSubtitle] = useState(siteConfig.siteSubtitle || 'ศูนย์จัดเก็บข้อมูลคู่มือและไดร์เวอร์ทางการ');
  const [logoLetter, setLogoLetter] = useState(siteConfig.logoLetter || 'P');
  const [heroTitle, setHeroTitle] = useState(siteConfig.heroTitle || 'ศูนย์จัดเก็บคู่มือ ไดร์เวอร์ & ซอฟต์แวร์ Passport Printer PUNEHOD A4');
  const [heroSubtitle, setHeroSubtitle] = useState(siteConfig.heroSubtitle || 'คลังเอกสารและไฟล์โปรแกรมพิมพ์เล่มหนังสือเดินทาง บัตรประชาชน และวัสดุแบนราบ A4');
  const [heroModelCode, setHeroModelCode] = useState(siteConfig.heroModelCode || 'MODEL: PUNEHOD-A4-PASS · ICAO 9303 COMPLIANT');
  const [heroAlign, setHeroAlign] = useState<'left' | 'center'>(siteConfig.heroAlign || 'left');
  const [heroSpecs, setHeroSpecs] = useState<HardwareSpec[]>(siteConfig.heroSpecs || [
    { id: 'spec-1', label: 'ความละเอียด', value: '5760 x 1440 DPI' },
    { id: 'spec-2', label: 'ระบบหมึก', value: 'CMYK + White (6 Colors)' },
    { id: 'spec-3', label: 'ความหนาชิ้นงาน', value: 'ปรับได้สูงสุด 50 มม.' },
  ]);
  const [announcement, setAnnouncement] = useState(siteConfig.announcement || '');
  const [announcementTheme, setAnnouncementTheme] = useState<'amber' | 'blue' | 'emerald' | 'rose'>(siteConfig.announcementTheme || 'amber');
  const [supportPhone, setSupportPhone] = useState(siteConfig.supportPhone || '063-9052513');
  const [supportLine, setSupportLine] = useState(siteConfig.supportLine || '@nairut.fnw');
  const [workingHours, setWorkingHours] = useState(siteConfig.workingHours || 'จันทร์-เสาร์ 08:30-17:30');
  const [footerText, setFooterText] = useState(siteConfig.footerText || '');

  // Categories State
  const [categories, setCategories] = useState<CategoryConfig[]>(siteConfig.categories || [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'manual', label: 'คู่มือการใช้งาน' },
    { id: 'driver/software', label: 'ไดร์เวอร์/ซอฟต์แวร์' },
    { id: 'troubleshooting', label: 'การแก้ไขปัญหา' },
    { id: 'Maintenance', label: 'การบำรุงรักษา' },
    { id: 'video', label: 'วิดีโอสาธิต&การใช้งาน' },
  ]);
  const [newCatLabel, setNewCatLabel] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  if (!isOpen) return null;

  // --- MENU HANDLERS ---
  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel.trim()) return;

    const newId = `menu-${Date.now().toString(36)}`;
    const newMenu: MenuItemConfig = {
      id: newId,
      label: newMenuLabel.trim(),
      visible: true,
      order: menuItems.length + 1,
      type: newMenuType,
      pageTitle: newMenuType === 'custom_page' ? (newMenuPageTitle.trim() || newMenuLabel.trim()) : undefined,
      pageContent: newMenuType === 'custom_page' ? newMenuPageContent.trim() : undefined,
      externalUrl: newMenuType === 'external_link' ? newMenuExternalUrl.trim() : undefined,
      isDeletable: true,
    };

    setMenuItems([...menuItems, newMenu]);
    setNewMenuLabel('');
    setNewMenuPageTitle('');
    setNewMenuPageContent('');
    setNewMenuExternalUrl('');
    setIsAddingMenu(false);
  };

  const handleDeleteMenu = (id: string, label: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `ลบเมนู "${label}"`,
      message: `คุณต้องการลบเมนู "${label}" ออกจากแถบนำทางระบบอย่างถาวรหรือไม่?`,
      confirmLabel: 'ยืนยันลบเมนู',
      variant: 'danger',
      onConfirm: () => {
        const updated = menuItems
          .filter(m => m.id !== id)
          .map((m, idx) => ({ ...m, order: idx + 1 }));
        setMenuItems(updated);
        if (defaultTab === id) {
          setDefaultTab('dashboard');
        }
        setActionNotice(`ลบเมนู "${label}" เรียบร้อยแล้ว`);
      },
    });
  };

  const moveMenuItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menuItems.length) return;

    const newMenus = [...menuItems];
    const [moved] = newMenus.splice(index, 1);
    newMenus.splice(targetIndex, 0, moved);

    const updated = newMenus.map((item, idx) => ({ ...item, order: idx + 1 }));
    setMenuItems(updated);
  };

  const toggleMenuVisibility = (id: string) => {
    setMenuItems(menuItems.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
  };

  const updateMenuLabel = (id: string, newLabel: string) => {
    setMenuItems(menuItems.map(m => m.id === id ? { ...m, label: newLabel } : m));
  };

  // --- SECTIONS HANDLERS ---
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const updated = newSections.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(updated);
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  // --- CATEGORIES HANDLERS ---
  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return;
    const catId = `cat-${Date.now().toString(36)}`;
    setCategories([...categories, { id: catId, label: newCatLabel.trim() }]);
    setNewCatLabel('');
  };

  const handleDeleteCategory = (id: string) => {
    if (id === 'all') {
      setActionNotice('ไม่สามารถลบหมวดหมู่ "ทั้งหมด" ได้');
      return;
    }
    const target = categories.find(c => c.id === id);
    setConfirmDialog({
      isOpen: true,
      title: `ลบหมวดหมู่ "${target?.label || id}"`,
      message: 'คุณต้องการลบหมวดหมู่นี้ออกจากระบบหรือไม่?',
      confirmLabel: 'ยืนยันลบ',
      variant: 'danger',
      onConfirm: () => {
        setCategories(categories.filter(c => c.id !== id));
        setActionNotice('ลบหมวดหมู่เรียบร้อยแล้ว');
      },
    });
  };

  // --- SAVE ALL ---
  const handleSave = () => {
    onSaveConfig({
      ...siteConfig,
      siteTitle,
      siteSubtitle,
      logoLetter,
      heroTitle,
      heroSubtitle,
      heroModelCode,
      heroAlign,
      heroSpecs,
      announcement,
      announcementTheme,
      supportPhone,
      supportLine,
      workingHours,
      footerText,
      defaultTab,
      dashboardLayout,
      sections,
      menuItems,
      categories,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                จัดการระบบ (System Management)
              </h2>
              <p className="text-xs text-slate-400">
                สิทธิ์ Admin: สามารถเพิ่ม ลบ แก้ไข หัวข้อ และปรับตำแหน่งบล็อก/เมนูทั้งเว็บไซต์ได้
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100/90 border-b border-slate-200 p-2 px-4 flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('menus')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'menus'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Menu className="w-3.5 h-3.5" />
            <span>1. เพิ่ม/ลบ & แก้ไขหัวข้อเมนู</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>2. ปรับตำแหน่งทั้งเว็บไซต์</span>
          </button>

          <button
            onClick={() => setActiveTab('texts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'texts'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>3. แก้ไขข้อความ & หัวข้อหลัก</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>4. หมวดหมู่ไฟล์</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>5. ล้างบันทึก & รีเซ็ตข้อมูล</span>
          </button>
        </div>

        {/* Notices */}
        {isSaved && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกการปรับปรุงระบบทั้งหมดเรียบร้อยแล้ว!</span>
          </div>
        )}
        {actionNotice && (
          <div className="bg-blue-50 border-b border-blue-200 p-3 text-xs text-blue-800 font-semibold flex items-center justify-between px-5 shrink-0">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-xs underline">ปิด</button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: MENU MANAGER (ADD, DELETE, REORDER, RENAME) */}
          {activeTab === 'menus' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 p-4 rounded-xl border border-blue-200/80">
                <div>
                  <h4 className="text-sm font-bold text-blue-900">
                    จัดการปุ่มเมนูแถบนำทาง (Navbar Menu Manager)
                  </h4>
                  <p className="text-xs text-blue-700">
                    คุณสามารถ <strong>เพิ่มเมนูใหม่</strong> (หน้าบทความ หรือ ลิงก์ภายนอก), <strong>ลบเมนู</strong>, หรือเลื่อนสลับลำดับได้ตามต้องการ
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingMenu(!isAddingMenu)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingMenu ? 'ยกเลิก' : '+ เพิ่มเมนูใหม่'}</span>
                </button>
              </div>

              {/* Form to Add New Menu */}
              {isAddingMenu && (
                <form onSubmit={handleAddMenu} className="bg-white border-2 border-blue-300 p-4 rounded-xl shadow-xs space-y-3">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>แบบฟอร์มเพิ่มเมนูใหม่เข้าสู่แถบนำทาง</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ชื่อปุ่มเมนูบนแถบนำทาง <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newMenuLabel}
                        onChange={(e) => setNewMenuLabel(e.target.value)}
                        placeholder="เช่น ขั้นตอนการใช้งาน, ติดต่อเรา, สั่งซื้อหมึก"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ประเภทของเมนู
                      </label>
                      <select
                        value={newMenuType}
                        onChange={(e) => setNewMenuType(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
                      >
                        <option value="custom_page">สร้างหน้าเนื้อหาใหม่ (Custom Content Page)</option>
                        <option value="external_link">เปิดลิงก์ภายนอก (External Web Link)</option>
                      </select>
                    </div>
                  </div>

                  {newMenuType === 'custom_page' ? (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          หัวข้อหน้าเนื้อหา
                        </label>
                        <input
                          type="text"
                          value={newMenuPageTitle}
                          onChange={(e) => setNewMenuPageTitle(e.target.value)}
                          placeholder="เช่น ข้อแนะนำในการดูแลรักษาเครื่องพิมพ์ Passport Punehod"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          เนื้อหาของหน้านี้ (คำอธิบาย, ขั้นตอน หรือประกาศ)
                        </label>
                        <textarea
                          rows={4}
                          value={newMenuPageContent}
                          onChange={(e) => setNewMenuPageContent(e.target.value)}
                          placeholder="พิมพ์ข้อความแนะนำ หรือคำอธิบายที่ต้องการให้แสดงผลเมื่อผู้ใช้งานกดเมนูนี้..."
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        URL เว็บไซต์ปลายทาง <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={newMenuExternalUrl}
                        onChange={(e) => setNewMenuExternalUrl(e.target.value)}
                        placeholder="https://example.com หรือ https://line.me/R/ti/p/@nairut.fnw"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsAddingMenu(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-xs"
                    >
                      บันทึกเมนูใหม่
                    </button>
                  </div>
                </form>
              )}

              {/* Default Landing Tab Selection */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">หน้าเริ่มต้นเมื่อผู้ใช้เปิดเว็บไซต์:</span>
                <select
                  value={defaultTab}
                  onChange={(e) => setDefaultTab(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
                >
                  {menuItems.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Menu Items List with Delete & Reorder */}
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.visible
                        ? 'bg-white border-slate-200/90 shadow-2xs'
                        : 'bg-slate-100/70 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 font-mono text-xs font-bold text-blue-700 flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {item.type === 'custom_page' ? 'หน้าเนื้อหาพิเศษ' : item.type === 'external_link' ? 'ลิงก์ภายนอก' : 'เมนูระบบ'}
                          </span>
                          {item.externalUrl && (
                            <span className="text-[10px] text-blue-600 truncate max-w-xs font-mono">
                              ({item.externalUrl})
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateMenuLabel(item.id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      {/* Move Up */}
                      <button
                        onClick={() => moveMenuItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors"
                        title="เลื่อนขึ้น / ซ้าย"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => moveMenuItem(index, 'down')}
                        disabled={index === menuItems.length - 1}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors"
                        title="เลื่อนลง / ขวา"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Toggle Visibility */}
                      <button
                        onClick={() => toggleMenuVisibility(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.visible
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                        }`}
                        title={item.visible ? 'ซ่อนเมนูนี้' : 'แสดงเมนูนี้'}
                      >
                        {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Delete Menu Button */}
                      <button
                        onClick={() => handleDeleteMenu(item.id, item.label)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบเมนูนี้ออกจากระบบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS POSITION & ORDERING */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/80">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                    ลำดับการแสดงผลของส่วนต่างๆ บนหน้าแดชบอร์ดหลัก
                  </h4>
                  <p className="text-[11px] text-blue-700">
                    คลิกปุ่ม &ldquo;ขึ้น&rdquo; หรือ &ldquo;ลง&rdquo; เพื่อสลับตำแหน่ง หรือคลิกรูปดวงตาเพื่อซ่อน/แสดงส่วนนั้น
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-700">รูปแบบการจัดวาง:</span>
                  <button
                    onClick={() => setDashboardLayout('split')}
                    className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1 ${
                      dashboardLayout === 'split' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-white text-slate-700'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>2 คอลัมน์</span>
                  </button>
                  <button
                    onClick={() => setDashboardLayout('stacked')}
                    className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1 ${
                      dashboardLayout === 'stacked' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-white text-slate-700'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>เต็มความกว้าง</span>
                  </button>
                </div>
              </div>

              {/* Sections List */}
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      section.visible
                        ? 'bg-white border-slate-200/90 shadow-2xs'
                        : 'bg-slate-100/70 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-600 flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {section.label}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: {section.id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sections.length - 1}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg transition-colors"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleSectionVisibility(section.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          section.visible
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                        }`}
                        title={section.visible ? 'ซ่อนส่วนนี้' : 'แสดงส่วนนี้'}
                      >
                        {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TEXTS & BRANDING (เอารหัสรุ่น สเปกฮาร์ดแวร์ ข้อมูลติดต่อ และข้อมูลท้ายเว็บออก) */}
          {activeTab === 'texts' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  ปรับแต่งข้อความและแบรนด์บนเว็บไซต์
                </h4>
                <p className="text-[11px] text-slate-500">
                  แก้ไขชื่อเว็บไซต์, หัวข้อแบนเนอร์, คำบรรยาย, และข้อความประกาศสำคัญ
                </p>
              </div>

              {/* Branding */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตัวอักษรโลโก้
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={logoLetter}
                    onChange={(e) => setLogoLetter(e.target.value)}
                    className="w-full px-3 py-1.5 text-center text-sm bg-white border border-slate-300 rounded-lg font-bold font-mono"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อหัวเว็บไซต์ (Site Title)
                  </label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คำบรรยายย่อใต้โลโก้
                  </label>
                  <input
                    type="text"
                    value={siteSubtitle}
                    onChange={(e) => setSiteSubtitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Hero Banner Texts (เอารหัสรุ่นออก) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หัวข้อใหญ่บนแบนเนอร์หน้าแรก (Hero Title)
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คำบรรยายบนแบนเนอร์หน้าแรก (Hero Subtitle)
                  </label>
                  <textarea
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold text-slate-700">การจัดตำแหน่งข้อความแบนเนอร์:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="heroAlign"
                      value="left"
                      checked={heroAlign === 'left'}
                      onChange={() => setHeroAlign('left')}
                    />
                    <span>ชิดซ้าย (Left)</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="heroAlign"
                      value="center"
                      checked={heroAlign === 'center'}
                      onChange={() => setHeroAlign('center')}
                    />
                    <span>กึ่งกลาง (Center)</span>
                  </label>
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    ข้อความประกาศสำคัญแถบด้านบน
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <span>โทนสี:</span>
                    <select
                      value={announcementTheme}
                      onChange={(e) => setAnnouncementTheme(e.target.value as any)}
                      className="text-xs bg-white border border-slate-300 rounded px-1.5 py-0.5"
                    >
                      <option value="amber">สีเหลืองอำพัน (เตือน)</option>
                      <option value="blue">สีน้ำเงิน (ประกาศทั่วไป)</option>
                      <option value="emerald">สีเขียว (อัปเดตใหม่)</option>
                      <option value="rose">สีแดง (ด่วนมาก)</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="ข้อความแจ้งเตือนผู้ใช้งาน..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGER (ADD, DELETE, EDIT CATEGORIES) */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/80">
                <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                  จัดการหมวดหมู่ไฟล์ในระบบ (File Categories Manager)
                </h4>
                <p className="text-[11px] text-blue-700">
                  คุณสามารถเพิ่มหมวดหมู่ใหม่ หรือลบหมวดหมู่ที่ไม่ต้องการได้
                </p>
              </div>

              {/* Add category input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="พิมพ์ชื่อหมวดหมู่ใหม่ เช่น โปรแกรมเสริม, วิดีโอสอน..."
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มหมวดหมู่</span>
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 flex-1">
                      <span className="font-mono text-xs text-slate-400 font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        value={cat.label}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[idx].label = e.target.value;
                          setCategories(updated);
                        }}
                        className="text-xs sm:text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none flex-1 py-0.5"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                    </div>

                    {cat.id !== 'all' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบหมวดหมู่นี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MAINTENANCE & CLEAR LOGS (CLEAR AUDIT LOGS, NOTIFS, RESET COUNTERS) */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200">
                <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ล้างบันทึกและจัดการข้อมูลระบบ (Maintenance & Clear Logs)</span>
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  เครื่องมือสำหรับผู้ดูแลระบบในการล้างบันทึกประวัติการทำงาน ล้างการแจ้งเตือน หรือคืนค่าเริ่มต้น
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Clear Audit Logs */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      ล้างบันทึกประวัติการแก้ไขทั้งหมด (Clear Audit Logs)
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      ล้างรายการประวัติการอัพโหลด แก้ไข และกิจกรรมในอดีตทั้งหมดออกจากหน้าประวัติ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'ล้างบันทึกประวัติการทำงานทั้งหมด',
                        message: 'คุณต้องการล้างรายการประวัติการอัพโหลด แก้ไข และกิจกรรมในอดีตทั้งหมดออกจากระบบอย่างถาวรหรือไม่? รายการทั้งหมดจะถูกลบออกทันที',
                        confirmLabel: 'ยืนยันล้างประวัติทั้งหมด',
                        variant: 'danger',
                        onConfirm: () => {
                          onClearLogs?.();
                          setActionNotice('ล้างบันทึกประวัติการทำงานทั้งหมดเรียบร้อยแล้ว (0 รายการ)');
                        },
                      });
                    }}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ล้างประวัติการทำงานทั้งหมด</span>
                  </button>
                </div>

                {/* Clear Notifications */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      ล้างรายการแจ้งเตือนทั้งหมด (Clear Notifications)
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      ลบการแจ้งเตือนไฟล์ใหม่และการแจ้งเตือนทั้งหมดออกจากกล่องกระดิ่ง
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'ล้างรายการแจ้งเตือนทั้งหมด',
                        message: 'คุณต้องการลบรายการแจ้งเตือนทั้งหมดออกจากกล่องกระดิ่งหรือไม่?',
                        confirmLabel: 'ยืนยันล้างแจ้งเตือน',
                        variant: 'warning',
                        onConfirm: () => {
                          onClearNotifications?.();
                          setActionNotice('ล้างการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว');
                        },
                      });
                    }}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ล้างการแจ้งเตือนทั้งหมด</span>
                  </button>
                </div>

                {/* Reset Download Counters */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      รีเซ็ตตัวนับยอดดาวน์โหลด (Reset Downloads)
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      รีเซ็ตจำนวนครั้งที่ดาวน์โหลดของไฟล์ทั้งหมดกลับเป็น 0
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'รีเซ็ตยอดดาวน์โหลดเป็น 0',
                        message: 'คุณต้องการรีเซ็ตจำนวนครั้งที่ดาวน์โหลดของทุกไฟล์ในระบบกลับเป็น 0 หรือไม่?',
                        confirmLabel: 'ยืนยันรีเซ็ตเป็น 0',
                        variant: 'warning',
                        onConfirm: () => {
                          onResetDownloads?.();
                          setActionNotice('รีเซ็ตยอดดาวน์โหลดทั้งหมดเป็น 0 เรียบร้อย');
                        },
                      });
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>รีเซ็ตยอดดาวน์โหลดเป็น 0</span>
                  </button>
                </div>

                {/* Reset Visitor Counters */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      รีเซ็ตสถิติผู้เข้าชมระบบ (Reset Visitors)
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      รีเซ็ตจำนวนผู้เข้าชมทุกหน้าและผู้เข้าใช้งานวันนี้กลับเป็น 0
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'รีเซ็ตสถิติผู้เข้าชมระบบทั้งหมด',
                        message: 'คุณต้องการรีเซ็ตสถิติยอดผู้เข้าชมของทุกหน้า และสถิติผู้เข้าใช้งานวันนี้กลับเป็น 0 หรือไม่?',
                        confirmLabel: 'ยืนยันรีเซ็ตเป็น 0',
                        variant: 'warning',
                        onConfirm: () => {
                          onResetVisitors?.();
                          setActionNotice('รีเซ็ตสถิติผู้เข้าชมระบบทั้งหมดเป็น 0 เรียบร้อย');
                        },
                      });
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>รีเซ็ตสถิติผู้เข้าชมเป็น 0</span>
                  </button>
                </div>

                {/* Factory Reset */}
                <div className="p-4 bg-white border border-rose-200 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-rose-900">
                      คืนค่าระบบสู่ค่าเริ่มต้นโรงงาน (Factory Reset)
                    </h5>
                    <p className="text-xs text-rose-600 mt-1">
                      คืนค่าไฟล์ตั้งต้นและรีเซ็ตการตั้งค่าข้อความและเมนูทั้งหมดกลับเป็นค่ามาตรฐาน
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'คืนค่าระบบสู่ค่าเริ่มต้นโรงงาน',
                        message: 'คำเตือน: คุณต้องการคืนค่าระบบกลับสู่สถานะโรงงานเริ่มต้นทั้งหมดหรือไม่? เมนู ไฟล์ และข้อความทั้งหมดจะถูกรีเซ็ตกลับเป็นค่ามาตรฐาน',
                        confirmLabel: 'ยืนยันคืนค่าโรงงาน',
                        variant: 'danger',
                        onConfirm: () => {
                          onFactoryReset?.();
                          setActionNotice('คืนค่าระบบกลับสู่สถานะเริ่มต้นเรียบร้อยแล้ว');
                        },
                      });
                    }}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>คืนค่าเริ่มต้นทั้งหมด</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            ระบบจะบันทึกการเปลี่ยนแปลงทั้งหมดทันทีที่กดบันทึก
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกการปรับปรุงทั้งหมด</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog within PageCustomizer */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
