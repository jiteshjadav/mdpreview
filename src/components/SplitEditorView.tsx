'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { ParseResult } from '@/lib/engine/converter';
import { EditorPanel } from './EditorPanel';

export interface SplitEditorViewProps {
  parseResult: ParseResult;
  rawMarkdown: string;
  filename: string;
  onContentChange: (content: string) => void;
  docBgColor: string;
  docTextColor: string;
  docBorderColor: string;
}

export function SplitEditorView({
  parseResult,
  rawMarkdown,
  filename,
  onContentChange,
  docBgColor,
  docTextColor,
  docBorderColor,
}: SplitEditorViewProps) {
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRatio = localStorage.getItem('mdpreview_split_ratio');
      if (savedRatio) {
        const parsed = parseFloat(savedRatio);
        if (!isNaN(parsed) && parsed >= 20 && parsed <= 80) {
          setSplitRatio(parsed);
        }
      }
    }
  }, []);

  const updateSplitRatio = (newRatio: number) => {
    const clamped = Math.min(Math.max(newRatio, 20), 80);
    setSplitRatio(clamped);
    try {
      localStorage.setItem('mdpreview_split_ratio', clamped.toString());
    } catch (e) {}
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offset = e.clientX - rect.left;
      const percentage = (offset / rect.width) * 100;
      updateSplitRatio(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col lg:flex-row items-stretch min-h-[450px] sm:min-h-[600px] mb-10 mt-14 sm:mt-16 relative gap-3 lg:gap-0 ${
        isDragging ? 'select-none' : ''
      }`}
    >
      {/* Left Editor Panel Component */}
      <EditorPanel
        rawMarkdown={rawMarkdown}
        onContentChange={onContentChange}
        filename={filename}
        splitRatio={splitRatio}
        onUpdateSplitRatio={updateSplitRatio}
        style={{
          width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${splitRatio}%` : '100%',
        }}
      />

      {/* Draggable Divider Handle (Desktop) */}
      <div
        onMouseDown={handleMouseDown}
        className={`hidden lg:flex items-center justify-center w-5 cursor-col-resize group select-none relative z-20 shrink-0 transition-all ${
          isDragging ? 'w-6' : ''
        }`}
        title="Drag left or right to resize panels"
      >
        <div
          className={`w-1 h-full rounded-full transition-colors duration-200 ${
            isDragging
              ? 'bg-sky-500 shadow-md shadow-sky-500/30'
              : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-sky-400 dark:group-hover:bg-sky-500'
          }`}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full border shadow-md transition-transform duration-150 ${
            isDragging
              ? 'bg-sky-600 text-white border-sky-400 scale-110'
              : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 group-hover:text-sky-500 group-hover:scale-105'
          }`}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Right Live Preview Panel */}
      <div
        style={{
          width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - splitRatio}%` : '100%',
          backgroundColor: docBgColor,
          color: docTextColor,
          borderColor: docBorderColor,
        }}
        className="border rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm transition-all overflow-auto max-h-[500px] sm:max-h-[650px] shrink-0"
      >
        <article
          className="markdown-body leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: parseResult.html }}
        />
      </div>
    </div>
  );
}
