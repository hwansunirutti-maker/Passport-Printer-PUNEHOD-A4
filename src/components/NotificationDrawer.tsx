import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  Upload, 
  AlertCircle, 
  Phone, 
  User, 
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react';
import { NotificationItem, PrinterFile } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectFileById: (fileId: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSelectFileById,
  soundEnabled,
  setSoundEnabled,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'new_upload':
        return <Upload className="w-4 h-4 text-blue-600" />;
      case 'system_alert':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-2xs transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center relative">
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
                )}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold">
                  การแจ้งเตือนระบบ ({notifications.length})
                </h2>
                <p className="text-xs text-slate-400">
                  {unreadCount > 0 ? `มี ${unreadCount} การแจ้งเตือนใหม่ที่ยังไม่ได้อ่าน` : 'ไม่มีการแจ้งเตือนค้าง'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Sub-header */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllAsRead}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>อ่านทั้งหมดแล้ว</span>
            </button>

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างทั้งหมด</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <span>ยังไม่มีรายการแจ้งเตือนในระบบ</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.fileId) {
                      onSelectFileById(notif.fileId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !notif.isRead
                      ? 'bg-blue-50/60 border-blue-200/90 shadow-2xs'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotifIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate">
                          {notif.title}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0 font-mono tabular-nums">
                          {new Date(notif.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.uploaderName && notif.uploaderName !== '-' && (
                        <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <strong className="text-slate-700">{notif.uploaderName}</strong>
                          </span>
                          {notif.uploaderPhone && notif.uploaderPhone !== '-' && (
                            <span className="flex items-center gap-1 font-mono text-slate-700">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{notif.uploaderPhone}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
