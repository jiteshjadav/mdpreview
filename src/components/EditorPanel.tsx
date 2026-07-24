'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface EditorPanelProps {
  rawMarkdown: string;
  onContentChange: (content: string) => void;
  filename: string;
  splitRatio?: number;
  onUpdateSplitRatio?: (newRatio: number) => void;
  style?: React.CSSProperties;
  className?: string;
}

export function EditorPanel({
  rawMarkdown,
  onContentChange,
  filename,
  style,
  className = '',
}: EditorPanelProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyMarkdown = () => {
    if (!rawMarkdown) return;
    try {
      navigator.clipboard.writeText(rawMarkdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy Markdown:', e);
    }
  };

  return (
    <div
      style={style}
      className={`flex flex-col gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4.5 shadow-sm transition-all shrink-0 ${className}`}
    >
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Live Editor</span>
          <span className="font-mono text-[10px] truncate max-w-[120px] xs:max-w-[160px] opacity-75">
            {filename}
          </span>
        </div>

        {/* Copy MD Button */}
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400"
          title="Copy raw Markdown to clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-sky-500" />
              <span>Copy MD</span>
            </>
          )}
        </button>
      </div>

      {/* Code Textarea */}
      <textarea
        value={rawMarkdown}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Type or paste Markdown here..."
        className="flex-1 min-h-[320px] sm:min-h-[500px] w-full p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 font-mono text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed transition-all shadow-inner"
      />
    </div>
  );
}
