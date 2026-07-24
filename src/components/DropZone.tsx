'use client';

import React, { useState, useRef } from 'react';
import { Upload, Code } from 'lucide-react';

export interface DropZoneProps {
  onFilesLoaded: (loaded: { name: string; content: string }[]) => void;
  onOpenEditor: () => void;
  appTheme?: 'sapphire' | 'indigo' | 'teal' | 'dark';
  lang?: 'en' | 'fr';
}

export function DropZone({ onFilesLoaded, onOpenEditor, lang = 'en' }: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
 
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
      const successFiles = results.filter(r => r.content.length > 0);
      if (successFiles.length > 0) {
        onFilesLoaded(successFiles);
      }
    });
  };
 
  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 shadow-sm app-bg-card app-border hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".md,.mdx,.html,.htm"
          multiple
          className="hidden"
        />
 
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border app-accent-bg app-accent-border app-accent-text">
            <Upload className="w-6 h-6" />
          </div>
 
          <div>
            <h3 className="text-sm font-semibold app-text">
              {lang === 'en' ? 'Drag & drop file(s)' : 'Glissez & déposez des fichiers'}
            </h3>
            <p className="text-xs app-text-secondary mt-1">
              {lang === 'en' 
                ? 'Supports .md, .mdx or .html (Upload multiple at once)' 
                : 'Prend en charge .md, .mdx ou .html (Téléverser plusieurs à la fois)'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
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
