import React, { useState, useEffect, useRef } from 'react';
import { Eye, TrendingUp, BarChart3, RefreshCw, Sparkles, X, RotateCcw, Trash2 } from 'lucide-react';
import { getPageCount, getPageViews, incrementPageView, resetPageView, resetAllVisitorCounts } from '../utils/storage';

interface PageViewBadgeProps {
  pageId: string;
  pageName: string;
  isAdmin?: boolean;
  className?: string;
  variant?: 'dark' | 'pill' | 'subtle' | 'card';
  onViewsUpdated?: () => void;
}

export const PageViewBadge: React.FC<PageViewBadgeProps> = ({
  pageId,
  pageName,
  isAdmin = false,
  className = '',
  variant = 'pill',
  onViewsUpdated,
}) => {
  const [viewCount, setViewCount] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [confirmResetAll, setConfirmResetAll] = useState<boolean>(false);

  // Sync and load view counts
  const refreshCounts = () => {
    const views = getPageViews();
    const count = views[pageId] || 0;
    setViewCount(count);

    const total = Object.values(views).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
    setTotalViews(total);
  };

  useEffect(() => {
    refreshCounts();
    const handleUpdate = () => refreshCounts();
    window.addEventListener('punehod_views_updated', handleUpdate);
    return () => window.removeEventListener('punehod_views_updated', handleUpdate);
  }, [pageId]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
        setConfirmResetAll(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen]);

  const handleManualIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    const newCount = incrementPageView(pageId);
    setViewCount(newCount);
    refreshCounts();
    setTimeout(() => setIsAnimating(false), 600);
    if (onViewsUpdated) onViewsUpdated();
  };

  const handleResetThisPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetPageView(pageId);
    refreshCounts();
    if (onViewsUpdated) onViewsUpdated();
  };

  const handleResetAllPages = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmResetAll) {
      setConfirmResetAll(true);
      setTimeout(() => setConfirmResetAll(false), 3500);
      return;
    }
    resetAllVisitorCounts();
    refreshCounts();
    setConfirmResetAll(false);
    if (onViewsUpdated) onViewsUpdated();
  };

  const percentage = totalViews > 0 ? Math.round((viewCount / totalViews) * 100) : 0;

  const isDark = variant === 'dark';

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        title={`คลิกเพื่อดูสถิติการเข้าชมหน้า "${pageName}"`}
        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer select-none ${
          isDark
            ? isPopoverOpen
              ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/30'
              : 'bg-slate-800/90 hover:bg-slate-800 text-slate-100 hover:text-white border-slate-700 shadow-xs'
            : isPopoverOpen 
              ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20' 
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200'
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <Eye className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isAnimating ? 'text-emerald-400 scale-125' : isDark ? 'text-emerald-400' : 'text-slate-500 group-hover:text-blue-500'}`} />
        <span className={`font-bold font-mono text-sm ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-blue-700'}`}>
          {viewCount.toLocaleString()}
        </span>
        <span className={`text-xs font-normal ${isDark ? 'text-slate-300' : 'text-slate-500 group-hover:text-blue-500'}`}>
          ผู้เข้าชม
        </span>
      </button>

      {/* Popover Breakdown Dialog */}
      {isPopoverOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-40 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>สถิติการเข้าชมระบบ</span>
            </div>
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500 font-medium">หน้านี้:</div>
              <div className="text-sm font-semibold text-slate-800 truncate">{pageName}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">ยอดเข้าชมหน้านี้</div>
                <div className="text-lg font-bold text-blue-600">
                  {viewCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">สัดส่วนทั้งระบบ</div>
                <div className="text-sm font-semibold text-slate-700">{percentage}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 px-0.5">
              <span>ยอดรวมทุกหน้ารวม:</span>
              <span className="font-bold text-slate-800">{totalViews.toLocaleString()} ครั้ง</span>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleManualIncrement}
                className="flex-1 py-1.5 px-2.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                title="จำลองการเข้าชม +1"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+1 เข้าชม</span>
              </button>

              {isAdmin && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleResetThisPage}
                    className="py-1.5 px-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="รีเซ็ตยอดหน้านี้เป็น 0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>หน้านี้</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAllPages}
                    className={`py-1.5 px-2 text-[11px] font-bold text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      confirmResetAll ? 'bg-amber-600 hover:bg-amber-700 animate-pulse' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                    title={confirmResetAll ? 'คลิกอีกครั้งเพื่อยืนยันการรีเซ็ตทุกหน้าเป็น 0' : 'รีเซ็ตสถิติยอดผู้เข้าชมของทุกหน้าเป็น 0'}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{confirmResetAll ? 'ยืนยันรีเซ็ต?' : 'ทุกหน้า'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
