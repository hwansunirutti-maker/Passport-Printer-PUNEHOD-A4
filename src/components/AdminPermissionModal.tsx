import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  ShieldCheck, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Check, 
  Key, 
  User, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Clock, 
  LogIn, 
  FileText, 
  FolderArchive, 
  Palette, 
  History, 
  Users, 
  Cog,
  Sparkles
} from 'lucide-react';
import { AdminUser, AdminPermission, AdminRole } from '../types';
import { 
  getAdminUsers, 
  saveAdminUsers, 
  getCurrentAdmin, 
  setCurrentAdmin, 
  deleteAdminUser, 
  updateAdminUser, 
  addAdminUser 
} from '../utils/storage';

interface AdminPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminListChanged: () => void;
  onSwitchAdminUser?: (user: AdminUser) => void;
  onAuditLog?: (action: string, title: string, details: string) => void;
}

const ALL_PERMISSIONS: { id: AdminPermission; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  {
    id: 'manage_files',
    label: 'จัดการไฟล์และคลังเอกสาร',
    desc: 'อัพโหลด อนุมัติ ลบ แก้ไขข้อมูล ปักหมุดไฟล์ และตั้งค่าทางการ',
    icon: FolderArchive,
  },
  {
    id: 'manage_menus',
    label: 'จัดการเมนูและหน้าบทความ',
    desc: 'เพิ่ม ลบ แก้ไขเมนูนำทาง และเนื้อหาหน้าแบบกำหนดเอง',
    icon: FileText,
  },
  {
    id: 'manage_customizer',
    label: 'ปรับแต่งการแสดงผลและธีม',
    desc: 'สลับลำดับการแสดงผล ซ่อน/แสดงบล็อก และเปลี่ยนธีมประกาศ',
    icon: Palette,
  },
  {
    id: 'manage_audit',
    label: 'จัดการและล้างประวัติการทำงาน',
    desc: 'ดูรายการบันทึกประวัติการแก้ไข และล้างประวัติการทำงานในระบบ',
    icon: History,
  },
  {
    id: 'manage_admins',
    label: 'จัดการสิทธิ์และผู้ดูแลระบบ',
    desc: 'เพิ่ม ลบ และแก้ไขสิทธิ์การเข้าถึงของผู้ดูแลระบบคนอื่น',
    icon: Users,
  },
  {
    id: 'manage_system',
    label: 'ตั้งค่าระบบและรีเซ็ตข้อมูล',
    desc: 'ปรับแต่งข้อมูลสายด่วน การอนุญาตอัพโหลด และรีเซ็ตข้อมูลโรงงาน',
    icon: Cog,
  },
];

export const AdminPermissionModal: React.FC<AdminPermissionModalProps> = ({
  isOpen,
  onClose,
  onAdminListChanged,
  onSwitchAdminUser,
  onAuditLog,
}) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [currentAdmin, setCurrentAdminState] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('custom');
  const [formRoleTitle, setFormRoleTitle] = useState('');
  const [formPermissions, setFormPermissions] = useState<AdminPermission[]>([]);
  const [formError, setFormError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Delete confirmation
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const loadData = () => {
    setAdminUsers(getAdminUsers());
    setCurrentAdminState(getCurrentAdmin());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setActiveTab('list');
      setFormError('');
      setFeedbackMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Preset Selection
  const handleSelectRolePreset = (role: AdminRole) => {
    setFormRole(role);
    switch (role) {
      case 'super_admin':
        setFormRoleTitle('ผู้ดูแลระบบระดับสูงสุด');
        setFormPermissions(ALL_PERMISSIONS.map(p => p.id));
        break;
      case 'editor':
        setFormRoleTitle('ผู้จัดการเนื้อหาและไฟล์');
        setFormPermissions(['manage_files', 'manage_menus']);
        break;
      case 'moderator':
        setFormRoleTitle('เจ้าหน้าที่ตรวจรับไฟล์');
        setFormPermissions(['manage_files']);
        break;
      case 'custom':
        setFormRoleTitle('ผู้ดูแลระบบกำหนดสิทธิ์เฉพาะ');
        break;
    }
  };

  const handleTogglePermission = (permId: AdminPermission) => {
    if (formPermissions.includes(permId)) {
      setFormPermissions(formPermissions.filter(p => p !== permId));
      if (formRole !== 'custom') setFormRole('custom');
    } else {
      setFormPermissions([...formPermissions, permId]);
    }
  };

  // Open Create Form
  const handleStartCreate = () => {
    setFormUsername('');
    setFormPassword('');
    setFormDisplayName('');
    setFormRole('editor');
    setFormRoleTitle('ผู้จัดการเนื้อหาและไฟล์');
    setFormPermissions(['manage_files', 'manage_menus']);
    setFormError('');
    setActiveTab('create');
  };

  // Open Edit Form
  const handleStartEdit = (user: AdminUser) => {
    setEditingUserId(user.id);
    setFormUsername(user.username);
    setFormPassword(''); // blank means don't change
    setFormDisplayName(user.displayName);
    setFormRole(user.role);
    setFormRoleTitle(user.roleTitle || '');
    setFormPermissions(user.permissions || []);
    setFormError('');
    setActiveTab('edit');
  };

  // Submit Create or Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUsername = formUsername.trim().toLowerCase();
    const cleanDisplayName = formDisplayName.trim();

    if (!cleanUsername) {
      setFormError('กรุณาระบุชื่อผู้ใช้งาน (Username)');
      return;
    }
    if (!cleanDisplayName) {
      setFormError('กรุณาระบุชื่อ-นามสกุล หรือตำแหน่ง');
      return;
    }

    if (activeTab === 'create') {
      if (!formPassword.trim()) {
        setFormError('กรุณากำหนดรหัสผ่านสำหรับผู้ดูแลระบบใหม่');
        return;
      }
      // Check duplicate username
      if (adminUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
        setFormError(`ชื่อผู้ใช้งาน "${cleanUsername}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
        return;
      }

      const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600'];
      const avatarColor = colors[adminUsers.length % colors.length];

      const newAdmin: AdminUser = {
        id: `admin-${Date.now().toString(36)}`,
        username: cleanUsername,
        password: formPassword.trim(),
        displayName: cleanDisplayName,
        role: formRole,
        roleTitle: formRoleTitle.trim() || 'ผู้ดูแลระบบ',
        permissions: formPermissions,
        isProtected: false,
        createdAt: new Date().toISOString(),
        avatarColor,
      };

      addAdminUser(newAdmin);
      loadData();
      onAdminListChanged();

      if (onAuditLog) {
        onAuditLog(
          'admin_manage',
          `เพิ่มผู้ดูแลระบบ: "${cleanDisplayName}" (@${cleanUsername})`,
          `กำหนดบทบาท ${formRoleTitle} พร้อมสิทธิ์ ${formPermissions.length} รายการ`
        );
      }

      setFeedbackMessage(`เพิ่มผู้ดูแลระบบ "${cleanDisplayName}" เรียบร้อยแล้ว`);
      setActiveTab('list');
      setTimeout(() => setFeedbackMessage(null), 3500);

    } else if (activeTab === 'edit' && editingUserId) {
      const updates: Partial<AdminUser> = {
        displayName: cleanDisplayName,
        role: formRole,
        roleTitle: formRoleTitle.trim() || 'ผู้ดูแลระบบ',
        permissions: formPermissions,
      };

      if (formPassword.trim()) {
        updates.password = formPassword.trim();
      }

      updateAdminUser(editingUserId, updates);
      loadData();
      onAdminListChanged();

      if (onAuditLog) {
        onAuditLog(
          'admin_manage',
          `แก้ไขสิทธิ์ผู้ดูแลระบบ: "${cleanDisplayName}"`,
          `อัปเดตสิทธิ์ ${formPermissions.length} รายการ และบทบาท ${formRoleTitle}`
        );
      }

      setFeedbackMessage(`แก้ไขข้อมูลและสิทธิ์ของ "${cleanDisplayName}" เรียบร้อย`);
      setActiveTab('list');
      setTimeout(() => setFeedbackMessage(null), 3500);
    }
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    const res = deleteAdminUser(userToDelete.id);
    if (!res.success) {
      alert(res.message || 'ไม่สามารถลบได้');
      setUserToDelete(null);
      return;
    }

    loadData();
    onAdminListChanged();

    if (onAuditLog) {
      onAuditLog(
        'admin_manage',
        `ลบผู้ดูแลระบบ: "${userToDelete.displayName}" (@${userToDelete.username})`,
        `ลบบัญชีและเพิกถอนสิทธิ์ผู้ดูแลระบบออกจากระบบเรียบร้อย`
      );
    }

    setFeedbackMessage(`ลบบัญชี "${userToDelete.displayName}" เรียบร้อยแล้ว`);
    setUserToDelete(null);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Switch Active User / Test Login
  const handleSwitchUser = (user: AdminUser) => {
    setCurrentAdmin(user);
    setCurrentAdminState(user);
    if (onSwitchAdminUser) {
      onSwitchAdminUser(user);
    }
    setFeedbackMessage(`สลับเข้าสู่ระบบในนาม "${user.displayName}" เรียบร้อย`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  จัดการสิทธิ์ผู้ดูแลระบบ (Admin & Permissions)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {adminUsers.length} บัญชี
                </span>
              </div>
              <p className="text-xs text-slate-400">
                เพิ่ม ลบ และกำหนดสิทธิ์การจัดการไฟล์ เมนู ปรับแต่งหน้าเว็บ และล้างประวัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedbackMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{feedbackMessage}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              รายชื่อผู้ดูแลระบบ ({adminUsers.length})
            </button>
            <button
              onClick={handleStartCreate}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ เพิ่มแอดมินใหม่</span>
            </button>
          </div>

          {currentAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>กำลังใช้งานในนาม:</span>
              <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {currentAdmin.displayName} (@{currentAdmin.username})
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'list' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>บัญชีผู้ดูแลระบบทั้งหมดที่สามารถเข้าสู่ระบบและมีสิทธิ์ในระบบ:</span>
                <span className="text-[11px] text-slate-400">คลิก "แก้ไข" เพื่อเปลี่ยนสิทธิ์ หรือ "เข้าใช้งาน" เพื่อสลับสิทธิ์</span>
              </div>

              {adminUsers.map((user) => {
                const isCurrent = currentAdmin?.id === user.id;
                const isRoot = user.isProtected || user.username.toLowerCase() === 'admin';

                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-50/50 to-teal-50/30 border-emerald-300 ring-1 ring-emerald-400/30 shadow-xs'
                        : 'bg-white hover:bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: User Info */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${user.avatarColor || 'bg-slate-700'} text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0`}>
                          {user.displayName.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {user.displayName}
                            </span>
                            <span className="text-xs font-mono text-slate-500">
                              @{user.username}
                            </span>
                            
                            {/* Role Badge */}
                            {user.role === 'super_admin' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Super Admin
                              </span>
                            ) : user.role === 'editor' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                Editor
                              </span>
                            ) : user.role === 'moderator' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Moderator
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                Custom
                              </span>
                            )}

                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white shadow-2xs">
                                บัญชีปัจจุบัน
                              </span>
                            )}
                            {isRoot && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100">
                                บัญชีหลักระบบ
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-slate-600 mt-0.5">
                            {user.roleTitle || 'ผู้ดูแลระบบ'}
                          </div>

                          {/* Permissions Chips */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {user.role === 'super_admin' ? (
                              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                ✓ มีสิทธิ์ทุกฟังก์ชันในระบบอย่างสมบูรณ์
                              </span>
                            ) : (
                              user.permissions?.map((perm) => {
                                const found = ALL_PERMISSIONS.find(p => p.id === perm);
                                return (
                                  <span
                                    key={perm}
                                    className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                                  >
                                    ✓ {found?.label || perm}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleSwitchUser(user)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                            title="สลับเข้าใช้งานด้วยบัญชีนี้ทันที"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>เข้าใช้งาน</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleStartEdit(user)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                          title="แก้ไขข้อมูลและสิทธิ์"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>แก้ไขสิทธิ์</span>
                        </button>

                        {!isRoot && !isCurrent && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
                            title="ลบบัญชีนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Create / Edit */}
          {(activeTab === 'create' || activeTab === 'edit') && (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    {activeTab === 'create' ? <UserPlus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeTab === 'create' ? 'เพิ่มบัญชีผู้ดูแลระบบใหม่' : `แก้ไขสิทธิ์ของ @${formUsername}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  ← กลับสู่รายชื่อ
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={activeTab === 'edit'}
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="เช่น tech_admin หรือ staff01"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white disabled:bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {activeTab === 'edit' && (
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      ไม่สามารถเปลี่ยนชื่อบัญชีเดิมได้
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {activeTab === 'create' ? 'รหัสผ่าน (Password) *' : 'เปลี่ยนรหัสผ่านใหม่ (เว้นว่างไว้หากไม่เปลี่ยน)'}
                  </label>
                  <input
                    type="password"
                    required={activeTab === 'create'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={activeTab === 'create' ? '••••••••' : 'เว้นว่างไว้เพื่อคงรหัสเดิม'}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล หรือชื่อแสดงผล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="เช่น คุณสมศักดิ์ ฝ่ายบริการ"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่ง / รายละเอียดบทบาท
                  </label>
                  <input
                    type="text"
                    value={formRoleTitle}
                    onChange={(e) => setFormRoleTitle(e.target.value)}
                    placeholder="เช่น หัวหน้าทีมไอที, ผู้ตรวจรับไฟล์"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role Presets */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  เลือกรูปแบบสิทธิ์สำเร็จรูป (Role Presets)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectRolePreset('super_admin')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      formRole === 'super_admin'
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-800">Super Admin</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">สิทธิ์เต็มทุกส่วน</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRolePreset('editor')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      formRole === 'editor'
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-blue-800">Editor</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">จัดการไฟล์ & เมนู</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRolePreset('moderator')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      formRole === 'moderator'
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-indigo-800">Moderator</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">ตรวจรับไฟล์</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRolePreset('custom')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      formRole === 'custom'
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-purple-800">Custom</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">กำหนดเอง</div>
                  </button>
                </div>
              </div>

              {/* Granular Permission Checklist */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  กำหนดสิทธิ์รายฟังก์ชัน (Granular Permissions)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = formPermissions.includes(perm.id) || formRole === 'super_admin';
                    const IconComp = perm.icon;

                    return (
                      <div
                        key={perm.id}
                        onClick={() => {
                          if (formRole === 'super_admin') return;
                          handleTogglePermission(perm.id);
                        }}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                          formRole === 'super_admin' ? 'cursor-default opacity-90' : 'cursor-pointer'
                        } ${
                          isChecked
                            ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={formRole === 'super_admin'}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <IconComp className={`w-3.5 h-3.5 ${isChecked ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className={`text-xs font-bold ${isChecked ? 'text-blue-900' : 'text-slate-700'}`}>
                              {perm.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {perm.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{activeTab === 'create' ? 'บันทึกผู้ดูแลระบบใหม่' : 'บันทึกการแก้ไขสิทธิ์'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Delete Confirmation Popup */}
        {userToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-slate-900">
                  ยืนยันการลบผู้ดูแลระบบ?
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  คุณต้องการลบบัญชี <strong>"{userToDelete.displayName}" (@{userToDelete.username})</strong> หรือไม่? การกระทำนี้จะเพิกถอนสิทธิ์ทั้งหมดทันที
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
