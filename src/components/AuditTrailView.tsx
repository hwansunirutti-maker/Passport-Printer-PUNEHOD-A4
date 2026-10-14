import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Clock, 
  User, 
  ShieldCheck, 
  Cpu, 
  FileText
} from 'lucide-react';
import { AuditLog, AuditAction } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { PageViewBadge } from './PageViewBadge';

interface AuditTrailViewProps {
  logs: AuditLog[];
  isAdmin: boolean;
  onClearLogs?: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  logs,
  isAdmin,
  onClearLogs,
}) => {
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterAction !== 'all' && log.action !== filterAction) return false;
      if (filterRole !== 'all' && log.actorRole !== filterRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.actorName.toLowerCase().includes(q) ||
          log.targetTitle.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, filterAction, filterRole, searchQuery]);

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'upload':
        return <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-semibold">อัพโหลดไฟล์</span>;
      case 'approve':
        return <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">อนุมัติแล้ว</span>;
      case 'edit':
        return <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold">แก้ไขข้อมูล</span>;
      case 'delete':
        return <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-semibold">ลบไฟล์</span>;
      case 'pin':
        return <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded text-[11px] font-semibold">ปักหมุด</span>;
      default:
        return <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">กิจกรรม</span>;
    }
  };

  const getActorIcon = (role: AuditLog['actorRole']) => {
    switch (role) {
      case 'admin':
        return (
          <span title="ผู้ดูแลระบบ" className="inline-flex">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </span>
        );
      case 'system':
        return (
          <span title="ระบบอัตโนมัติ" className="inline-flex">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          </span>
        );
      default:
        return (
          <span title="ผู้ใช้ทั่วไป" className="inline-flex">
            <User className="w-3.5 h-3.5 text-slate-500" />
          </span>
        );
    }
  };

  const exportLogsAsCsv = () => {
    const headers = ['Timestamp', 'Action', 'Actor Name', 'Role', 'Target Title', 'Details'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.actorName.replace(/"/g, '""')}"`,
      `"${l.actorRole}"`,
      `"${l.targetTitle.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Punehod_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <History className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                ประวัติการแก้ไขและบันทึกกิจกรรม (Audit Trail)
              </h1>
              <PageViewBadge pageId="audit" pageName="ประวัติการแก้ไข" isAdmin={isAdmin} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ตรวจสอบการอัพโหลด แก้ไข อนุมัติ และกิจกรรมในระบบอย่างละเอียด
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportLogsAsCsv}
              className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>ส่งออกบันทึก (CSV)</span>
            </button>

            {isAdmin && onClearLogs && (
              <button
                onClick={() => setIsConfirmClearOpen(true)}
                disabled={logs.length === 0}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors flex items-center gap-1.5 border border-rose-200"
                title="ล้างประวัติการทำงานทั้งหมด"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างบันทึกทั้งหมด</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผู้ดำเนินการ, ชื่อไฟล์, รายละเอียด..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">ทุกกิจกรรม (All Actions)</option>
              <option value="upload">การอัพโหลด (Upload)</option>
              <option value="approve">การอนุมัติ (Approve)</option>
              <option value="edit">การแก้ไขข้อมูล (Edit)</option>
              <option value="delete">การลบไฟล์ (Delete)</option>
              <option value="pin">การปักหมุด (Pin)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">ทุกกลุ่มผู้ใช้ (All Roles)</option>
              <option value="user">ผู้ใช้ทั่วไป (Public Users)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
              <option value="system">ระบบอัตโนมัติ (System)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>แสดง <strong className="text-slate-800 font-mono tabular-nums">{filteredLogs.length}</strong> รายการล่าสุด</span>
          <span>เรียงตามเวลาล่าสุด</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">ไม่มีรายการบันทึกประวัติกิจกรรม</div>
            <div className="text-slate-400">
              {logs.length === 0 
                ? 'ประวัติบันทึกการทำงานถูกล้างเรียบร้อยแล้ว หรือยังไม่มีกิจกรรมใหม่' 
                : 'ไม่พบบันทึกกิจกรรมที่ตรงกับเงื่อนไขการค้นหา'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      {getActorIcon(log.actorRole)}
                      <span>{log.actorName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 font-mono tabular-nums text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(log.timestamp).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-1.5 font-bold text-xs sm:text-sm text-slate-900">
                  {log.targetTitle}
                </div>

                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Clearing Logs */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="ยืนยันการล้างประวัติการทำงานทั้งหมด"
        message="คุณต้องการล้างรายการประวัติการอัพโหลด แก้ไข และกิจกรรมทั้งหมดออกจากระบบอย่างถาวรหรือไม่? รายการทั้งหมดจะถูกลบออกทันทีและไม่สามารถย้อนกลับได้"
        confirmLabel="ยืนยันล้างบันทึกทั้งหมด"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          onClearLogs?.();
        }}
        onClose={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
};
