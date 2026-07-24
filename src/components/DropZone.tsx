'use client';

import React, { useState, useRef } from 'react';
import { Upload, Code, Files, FileText, Sparkles, Layers, ArrowDown } from 'lucide-react';

export interface DropZoneProps {
  onFilesLoaded: (loaded: { name: string; content: string }[]) => void;
  onOpenEditor: () => void;
  appTheme?: 'sapphire' | 'dark';
  lang?: 'en' | 'fr';
}

export function DropZone({ onFilesLoaded, onOpenEditor, lang = 'en' }: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      readMultipleFiles(Array.from(files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readMultipleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ext === 'md' || ext === 'mdx' || ext === 'html' || ext === 'htm';
    });

    if (validFiles.length === 0) return;

    const promises = validFiles.map((file) => {
      return new Promise<{ name: string; content: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            content: (event.target?.result as string) || '',
          });
        };
        reader.onerror = () => {
          resolve({ name: file.name, content: '' });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(promises).then((results) => {
      const successFiles = results.filter((r) => r.content.length > 0);
      if (successFiles.length > 0) {
        onFilesLoaded(successFiles);
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Main Interactive DropZone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 shadow-sm app-bg-card app-border hover:shadow-xl hover:border-sky-500 dark:hover:border-sky-400 overflow-hidden"
      >
        {/* Subtle background glow effect on hover */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all duration-500 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500 pointer-events-none" />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".md,.mdx,.html,.htm"
          multiple
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-5 relative z-10">
          {/* Animated Multi-Card Fan-out Visual Stack */}
          <div className="relative w-28 h-16 flex items-center justify-center">
            {/* Card 3 (Back / Left tilted) */}
            <div
              className={`absolute top-1 left-2 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex flex-col items-center justify-center p-1 shadow-md transition-all duration-300 border border-indigo-400/30 ${
                isHovered ? '-rotate-12 -translate-x-5 -translate-y-1 scale-105' : '-rotate-6 -translate-x-3'
              }`}
            >
              <FileText className="w-5 h-5 opacity-90" />
              <span className="text-[8px] font-black uppercase tracking-widest mt-0.5 opacity-90">.html</span>
            </div>

            {/* Card 2 (Back / Right tilted) */}
            <div
              className={`absolute top-1 right-2 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex flex-col items-center justify-center p-1 shadow-md transition-all duration-300 border border-amber-400/30 ${
                isHovered ? 'rotate-12 translate-x-5 -translate-y-1 scale-105' : 'rotate-6 translate-x-3'
              }`}
            >
              <Layers className="w-5 h-5 opacity-90" />
              <span className="text-[8px] font-black uppercase tracking-widest mt-0.5 opacity-90">.mdx</span>
            </div>

            {/* Card 1 (Front Center Main Upload Card) */}
            <div
              className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex flex-col items-center justify-center p-1.5 shadow-lg border border-sky-300/40 transition-all duration-300 ${
                isHovered ? 'scale-110 -translate-y-1 shadow-sky-500/30' : ''
              }`}
            >
              <Upload className={`w-6 h-6 transition-transform duration-300 ${isHovered ? '-translate-y-0.5 scale-110' : ''}`} />
              <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">.md</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h3 className="text-sm sm:text-base font-bold app-text">
                {lang === 'en' ? 'Drag & drop multiple files here' : 'Glissez & déposez plusieurs fichiers ici'}
              </h3>
            </div>
            <p className="text-xs app-text-secondary">
              {lang === 'en'
                ? 'Supports .md, .mdx or .html — Select 1 or drop whole folders at once'
                : 'Prend en charge .md, .mdx ou .html — Sélectionnez 1 ou des dossiers entiers'}
            </p>
          </div>

          {/* Action button inside dropzone */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-600/20 group-hover:bg-sky-500 transition-all">
            <Files className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Choose Files' : 'Choisir des fichiers'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-1">
        <button
          onClick={onOpenEditor}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm app-bg-card app-border app-text-secondary hover:app-bg-hover"
        >
          <Code className="w-4 h-4 app-accent-text" />
          <span>{lang === 'en' ? 'Start writing from scratch' : 'Commencer à écrire de zéro'}</span>
        </button>
      </div>
    </div>
  );
}
