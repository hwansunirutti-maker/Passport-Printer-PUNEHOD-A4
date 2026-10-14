import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Download, ArrowRight } from 'lucide-react';
import { PrinterFile } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: PrinterFile[];
  onSelectFile: (file: PrinterFile) => void;
  onDownloadFile: (file: PrinterFile) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  onDownloadFile,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filtered = files.filter(f => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.fileName.toLowerCase().includes(q) ||
      f.uploaderName.toLowerCase().includes(q) ||
      f.uploaderPhone.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectFile(filtered[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="ค้นหาคู่มือ, ไดร์เวอร์, ชื่อไฟล์, หรือเบอร์ติดต่อผู้ส่ง..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              ไม่พบไฟล์ที่ตรงกับคำค้นหา
            </div>
          ) : (
            filtered.map((file, idx) => (
              <div
                key={file.id}
                onClick={() => {
                  onSelectFile(file);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  selectedIndex === idx ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="uppercase font-semibold text-blue-600 font-mono">{file.category}</span>
                      <span>·</span>
                      <span>{file.uploaderName}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold truncate text-slate-900">
                      {file.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadFile(file);
                    }}
                    className="p-1.5 hover:bg-blue-600 hover:text-white rounded-lg text-slate-400 transition-colors"
                    title="ดาวน์โหลด"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <div className="flex items-center gap-2">
            <span>ใช้ <kbd className="font-mono bg-white border px-1 rounded">↑</kbd> <kbd className="font-mono bg-white border px-1 rounded">↓</kbd> เพื่อเลื่อน</span>
            <span>·</span>
            <span>กด <kbd className="font-mono bg-white border px-1 rounded">Enter</kbd> เพื่อเปิดดู</span>
          </div>
          <span className="font-mono">แสดง {filtered.length} จาก {files.length} ไฟล์</span>
        </div>
      </div>
    </div>
  );
};
