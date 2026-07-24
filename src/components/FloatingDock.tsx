'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Copy, Printer, Check, Edit3, ArrowLeft, Eye, FileText, Globe, HelpCircle, MoreVertical, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { ParseResult } from '@/lib/engine/converter';
import { generateStandaloneHtml } from '@/lib/export/htmlExport';
import { ThemeSwitcher, ThemeType } from './ThemeSwitcher';
import { TRANSLATIONS } from './WorkspaceApp';

export interface FloatingDockProps {
  parseResult: ParseResult;
  filename: string;
  selectedTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  onBackToUpload: () => void;
  files: { id: string; name: string; content?: string; html?: string }[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onAddFiles: (loaded: { name: string; content: string }[]) => void;
  appTheme?: 'indigo' | 'teal' | 'dark';
  lang?: 'en' | 'fr';
  setLang?: (lang: 'en' | 'fr') => void;
  workspaceName?: string;
  onWorkspaceNameChange?: (name: string) => void;
}
 
export function FloatingDock({
  parseResult,
  filename,
  selectedTheme,
  onThemeChange,
  isEditing,
  onToggleEdit,
  onBackToUpload,
  files,
  activeFileId,
  onSelectFile,
  onRemoveFile,
  onRenameFile,
  onAddFiles,
  appTheme = 'teal',
  lang = 'en',
  setLang,
  workspaceName = 'untitled-workspace',
  onWorkspaceNameChange = () => {},
}: FloatingDockProps) {
  const [copied, setCopied] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [includeMdInZip, setIncludeMdInZip] = useState<boolean>(false);

  const handleConfirmRename = (file: typeof files[number], newBaseName: string) => {
    const trimmed = newBaseName.trim();
    if (!trimmed) {
      setEditingFileId(null);
      return;
    }
    const dotIndex = file.name.lastIndexOf('.');
    const ext = dotIndex === -1 ? '' : file.name.substring(dotIndex);
    onRenameFile(file.id, trimmed + ext);
    setEditingFileId(null);
  };
  
  const lastScrollY = useRef(0);
 
  const handlePrevFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1 || !activeFileId) return;
    const currentIndex = files.findIndex(f => f.id === activeFileId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + files.length) % files.length;
    onSelectFile(files[prevIndex].id);
  };
 
  const handleNextFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1 || !activeFileId) return;
    const currentIndex = files.findIndex(f => f.id === activeFileId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % files.length;
    onSelectFile(files[nextIndex].id);
  };

  const handleDownloadHtml = () => {
    const standaloneHtml = generateStandaloneHtml(parseResult.html, {
      title: parseResult.title || filename.replace(/\.(md|mdx|txt)$/, ''),
      theme: selectedTheme,
      files,
      activeFileName: filename,
    });
 
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const downloadName = filename ? filename.replace(/\.(mdx|md|txt)$/, '') + '.html' : 'document.html';
    link.setAttribute('download', downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
 
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.15 },
    });
  };
 
  const handleDownloadMd = () => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile) return;
 
    const fileContent = activeFile.content || '';
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', activeFile.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
 
  const handleDownloadAllMd = async () => {
    const zip = new JSZip();
    
    files.forEach((file) => {
      const fileContent = file.content || '';
      zip.file('md/' + file.name, fileContent);
    });
 
    const content = await zip.generateAsync({ type: 'blob' });
    const blob = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${workspaceName}-source-markdown.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
 
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.15 },
    });
  };
 
  const handleDownloadAllHtml = async (interlink: boolean = false) => {
    const zip = new JSZip();
 
    files.forEach((file) => {
      if (file.html) {
        const standaloneHtml = generateStandaloneHtml(file.html!, {
          title: file.name.replace(/\.(md|mdx|txt)$/, ''),
          theme: selectedTheme,
          files: interlink ? files : [],
          activeFileName: interlink ? file.name : undefined,
        });
   
        const fileName = file.name ? file.name.replace(/\.(mdx|md|txt)$/, '') + '.html' : 'document.html';
        zip.file(fileName, standaloneHtml);
      }
      if (includeMdInZip && file.content) {
        zip.file('md/' + file.name, file.content);
      }
    });
 
    const content = await zip.generateAsync({ type: 'blob' });
    
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${workspaceName}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
 
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.15 },
    });
  };

  const handleCopyHtml = () => {
    const standaloneHtml = generateStandaloneHtml(parseResult.html, {
      title: parseResult.title || 'Exported Document',
      theme: selectedTheme,
      files,
      activeFileName: filename,
    });

    navigator.clipboard.writeText(standaloneHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleSelectFile = (id: string) => {
    onSelectFile(id);
    setIsFilesOpen(false);
  };

  // Scroll listener for Autohiding Sticky Header behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Keep visible at the very top of the page
      if (currentScrollY <= 40) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down -> hide header
        setVisible(false);
      } else {
        // Scrolling up -> show header
        setVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close open state when clicking anywhere outside files container
  useEffect(() => {
    if (!isFilesOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.files-dropdown-container')) {
        setIsFilesOpen(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isFilesOpen]);

  // Keep header visible if the files switcher dropdown is open
  const isHeaderVisible = visible || isFilesOpen;

  return (
    <>
      {/* Click outside backdrop for files popover */}
      {isFilesOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            setIsFilesOpen(false);
          }}
        />
      )}

      {/* Autohiding Sticky Top Header Menu */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 h-14 border-b shadow-sm backdrop-blur-xl transition-transform duration-300 ease-in-out print:hidden flex items-center justify-between px-3 sm:px-6 app-bg-card app-border app-text ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        } ${appTheme === 'dark' ? 'dark' : ''}`}
      >
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Clickable Logo in Top Menu - Hidden on mobile viewports to maximize spacing */}
          <div 
            onClick={onBackToUpload}
            className="hidden sm:flex items-center gap-2 cursor-pointer active:scale-95 transition-transform shrink-0 select-none"
            title="Go to upload screen"
          >
            <img src="/logo.png" alt="MD Preview Logo" className={`h-9 w-auto object-contain transition-all rounded px-2 py-0.5 ${
              appTheme === 'dark' ? 'bg-white/95 shadow-sm' : ''
            }`} />
          </div>
 
          <div className="hidden sm:block w-[1px] h-5 app-border shrink-0" />
 
          {/* Direct File Opening */}
          <label
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 border app-bg-hover app-border app-text select-none"
            title="Open local files in workspace"
          >
            <FolderOpen className="w-4 h-4 app-accent-text" />
            <span>{lang === 'en' ? 'Open' : 'Ouvrir'}</span>
            <input
              type="file"
              multiple
              accept=".md,.mdx,.html,.htm,.txt"
              onChange={(e) => {
                if (e.target.files) {
                  const validFiles = Array.from(e.target.files).filter((f) => {
                    const ext = f.name.split('.').pop()?.toLowerCase();
                    return ext === 'md' || ext === 'mdx' || ext === 'html' || ext === 'htm' || ext === 'txt';
                  });
                  if (validFiles.length > 0) {
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
                        onAddFiles(successFiles);
                      }
                    });
                  }
                }
              }}
              className="hidden"
            />
          </label>

          {/* Active Filename Display & Switcher Dropdown */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="relative files-dropdown-container shrink-0 min-w-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilesOpen(!isFilesOpen);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl border app-border app-bg-hover select-none shadow-xs shrink-0 max-w-[130px] xxs:max-w-[160px] xs:max-w-[190px] sm:max-w-[260px] md:max-w-[360px] hover:border-slate-350 dark:hover:border-slate-700 cursor-pointer transition-all duration-200"
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
                  {TRANSLATIONS[lang].viewing} ({files.length})
                </span>
                <span className="text-xs font-bold truncate px-0.5 app-text">
                  {filename}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] shrink-0 font-bold">
                  ▼
                </span>
              </button>
 
              {/* Click-to-Open Files Menu Dropdown (Renders downwards) */}
              {isFilesOpen && (
                <div className="absolute left-0 w-80 p-2.5 rounded-xl border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 top-full mt-2 app-bg-card app-border app-text">
                  {/* Workspace Name Input Block */}
                  <div className="flex flex-col gap-1.5 mb-2 pb-2 border-b app-border">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 px-1">
                      {lang === 'en' ? 'Workspace Name' : "Nom de l'Espace"}
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                      <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => onWorkspaceNameChange(e.target.value)}
                        placeholder={lang === 'en' ? 'untitled-workspace' : 'espace-sans-titre'}
                        className="flex-1 px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border app-border app-text focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
 
                  <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 mb-1 border-b app-text-light app-border">
                    {lang === 'en' ? 'Workspace Files' : "Fichiers de l'Espace"}
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {files.map((file) => {
                      const isEditingThisFile = editingFileId === file.id;
                      return (
                        <div
                          key={file.id}
                          onClick={() => {
                            if (!isEditingThisFile) {
                              handleSelectFile(file.id);
                            }
                          }}
                          className={`w-full p-2 rounded-lg flex items-center justify-between gap-2 transition-colors text-left ${
                            isEditingThisFile
                              ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner'
                              : activeFileId === file.id
                                ? 'app-accent-bg app-accent-text font-semibold'
                                : 'hover:app-bg-hover app-text-secondary'
                          }`}
                        >
                          <div 
                            className="flex items-center gap-2.5 min-w-0 flex-1"
                            onClick={(e) => {
                              if (isEditingThisFile) {
                                e.stopPropagation();
                              }
                            }}
                          >
                            <FileText className="w-4 h-4 shrink-0 app-accent-text" />
                            {isEditingThisFile ? (
                              <input
                                type="text"
                                value={editingName}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.stopPropagation();
                                    handleConfirmRename(file, editingName);
                                  } else if (e.key === 'Escape') {
                                    e.stopPropagation();
                                    setEditingFileId(null);
                                  }
                                }}
                                onBlur={() => {
                                  handleConfirmRename(file, editingName);
                                }}
                                className="text-xs px-2 py-0.5 rounded border border-slate-300 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none w-full focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-150"
                              />
                            ) : (
                              <span className="text-xs truncate">{file.name}</span>
                            )}
                          </div>
 
                          <div 
                            className="flex items-center gap-0.5 shrink-0" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isEditingThisFile ? (
                              <>
                                <button
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleConfirmRename(file, editingName);
                                  }}
                                  className="p-1 rounded text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                  title="Confirm Rename"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setEditingFileId(null);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                  title="Cancel Rename"
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    const dotIndex = file.name.lastIndexOf('.');
                                    const baseName = dotIndex === -1 ? file.name : file.name.substring(0, dotIndex);
                                    setEditingFileId(file.id);
                                    setEditingName(baseName);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                  title="Rename file"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {files.length > 1 && (
                                  <button
                                    onClick={() => {
                                      onRemoveFile(file.id);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer font-bold text-[10px]"
                                    title="Delete file"
                                  >
                                    ✕
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
 
                  {/* Quick Add File */}
                  <div className="mt-2 pt-2 border-t app-border flex flex-col gap-1.5">
                    <div className="flex gap-1.5">
                      <label className="flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex-1 border border-dashed border-slate-355 dark:border-slate-700 app-text-secondary hover:app-bg-hover hover:app-accent-text select-none">
                        <span>{lang === 'en' ? '+ Add Files' : '+ Ajouter'}</span>
                        <input
                          type="file"
                          multiple
                          accept=".md,.mdx,.html,.htm"
                          onChange={(e) => {
                            if (e.target.files) {
                              const validFiles = Array.from(e.target.files).filter((f) => {
                                const ext = f.name.split('.').pop()?.toLowerCase();
                                return ext === 'md' || ext === 'mdx' || ext === 'html' || ext === 'htm';
                              });
                              if (validFiles.length > 0) {
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
                                    onAddFiles(successFiles);
                                  }
                                });
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
 
                      <button
                        onClick={() => {
                          onAddFiles([{ name: 'untitled.md', content: '# New Document\n\n' }]);
                        }}
                        className="flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex-1 border border-dashed border-slate-355 dark:border-slate-700 app-text-secondary hover:app-bg-hover hover:app-accent-text select-none"
                      >
                        <span>{lang === 'en' ? '+ New Scratch' : '+ Nouveau Brouillon'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
 
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Live Edit Toggle */}
          {!filename.toLowerCase().endsWith('.html') && !filename.toLowerCase().endsWith('.htm') && (
            <>
              <button
                onClick={onToggleEdit}
                className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
                  isEditing
                    ? 'app-primary-btn border-transparent'
                    : 'border app-bg-hover app-border app-text'
                }`}
                title="Toggle live markdown editor"
              >
                {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span className="hidden lg:inline">{isEditing ? TRANSLATIONS[lang].preview : TRANSLATIONS[lang].editor}</span>
              </button>
              <div className="hidden xs:block w-[1px] h-5 app-border shrink-0" />
            </>
          )}
 
          {/* Theme Selector Dropdown */}
          <ThemeSwitcher currentTheme={selectedTheme} onThemeChange={onThemeChange} isNearTop={true} appTheme={appTheme} lang={lang} />
 
          {/* FAQ Button (Desktop only) */}
          <button
            onClick={() => setIsFaqOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 cursor-pointer app-bg-hover app-border app-text shrink-0"
            title="Frequently Asked Questions"
          >
            <HelpCircle className="w-4 h-4 app-accent-text" />
            <span>FAQ</span>
          </button>
 
          <div className="hidden lg:block w-[1px] h-6 mx-0.5 app-border" />
 
          {/* Copy HTML (Desktop only) */}
          <button
            onClick={handleCopyHtml}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer border app-bg-hover app-border app-text shrink-0"
            title="Copy Standalone HTML Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? TRANSLATIONS[lang].copied : TRANSLATIONS[lang].copy}</span>
          </button>
 
 
          {/* PDF Export (Desktop only) */}
          <button
            onClick={handlePrintPdf}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer border app-bg-hover app-border app-text shrink-0"
            title="Print to PDF"
          >
            <Printer className="w-4 h-4" />
            <span>PDF</span>
          </button>
 
          {/* Primary Download Button (Desktop only) */}
          <div className="relative hidden lg:block download-dropdown-container">
            <button
              onClick={() => {
                setIsDownloadOpen(!isDownloadOpen);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer border-transparent app-primary-btn shrink-0"
              title="Download Options"
            >
              <Download className="w-4 h-4" />
              <span>{TRANSLATIONS[lang].download}</span>
              <span className="ml-0.5 text-[10px] opacity-80">▾</span>
            </button>
 
            {/* Click-outside backdrop overlay */}
            {isDownloadOpen && (
              <div 
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsDownloadOpen(false)}
              />
            )}
 
            {isDownloadOpen && (
              <div className="absolute right-0 w-64 p-2.5 rounded-xl border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 top-full mt-2 app-bg-card app-border app-text">
                <div className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 mb-1 text-slate-450 dark:text-slate-500">
                  {lang === 'en' ? 'Active File' : 'Fichier Actif'}
                </div>
 
                <button
                  onClick={() => {
                    setIsDownloadOpen(false);
                    handleDownloadHtml();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{lang === 'en' ? 'Download HTML' : 'Télécharger HTML'}</div>
                    <div className="text-[9px] truncate text-slate-400 dark:text-slate-500">{filename.replace(/\.(md|mdx|html|htm)$/, '') + '.html'}</div>
                  </div>
                </button>
 
                <button
                  onClick={() => {
                    setIsDownloadOpen(false);
                    handleDownloadMd();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{lang === 'en' ? 'Download Markdown' : 'Télécharger Markdown'}</div>
                    <div className="text-[9px] truncate text-slate-400 dark:text-slate-500">{filename.replace(/\.(md|mdx|html|htm)$/, '') + '.md'}</div>
                  </div>
                </button>
 
                {files.length > 1 && (
                  <>
                    <div className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 mt-2.5 mb-1 border-t app-border pt-2 text-slate-455 dark:text-slate-500">
                      {lang === 'en' ? 'All Workspace Files' : "Tous les Fichiers"}
                    </div>
 
                    <label className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold hover:app-bg-hover cursor-pointer app-text select-none">
                      <input
                        type="checkbox"
                        checked={includeMdInZip}
                        onChange={(e) => setIncludeMdInZip(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-555"
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {lang === 'en' ? 'Include MD sources in ZIP (md/ folder)' : 'Inclure les MD dans le ZIP (dossier md/)'}
                      </span>
                    </label>
 
                    <button
                      onClick={() => {
                        setIsDownloadOpen(false);
                        handleDownloadAllHtml(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left"
                    >
                      <Download className="w-4 h-4 text-indigo-500" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{lang === 'en' ? 'Download All HTML (Independent)' : 'Télécharger tous HTML (Indépendant)'}</div>
                        <div className="text-[9px] text-slate-450 dark:text-slate-500">{lang === 'en' ? `Export ${files.length} HTML pages` : `Exporter ${files.length} pages HTML`}</div>
                      </div>
                    </button>
 
                    <button
                      onClick={() => {
                        setIsDownloadOpen(false);
                        handleDownloadAllHtml(true);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left mt-1"
                    >
                      <Download className="w-4 h-4 text-cyan-500" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{lang === 'en' ? 'Download All HTML (Interlinked)' : 'Télécharger tous HTML (Interconnecté)'}</div>
                        <div className="text-[9px] text-slate-450 dark:text-slate-500">{lang === 'en' ? `Export as interconnected wiki` : `Lier les documents entre eux`}</div>
                      </div>
                    </button>
 
                    <button
                      onClick={() => {
                        setIsDownloadOpen(false);
                        handleDownloadAllMd();
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left mt-1"
                    >
                      <Download className="w-4 h-4 text-emerald-500" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{lang === 'en' ? 'Download All Markdown (.zip)' : 'Télécharger tous Markdown (.zip)'}</div>
                        <div className="text-[9px] text-slate-450 dark:text-slate-500">{lang === 'en' ? `Export all source files as a ZIP` : `Exporter les fichiers source en ZIP`}</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
 
          {/* Backdrop overlay for closing 'More' popover */}
          {isMoreOpen && (
            <div 
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsMoreOpen(false)}
            />
          )}
 
          {/* More Actions Dropdown (Only visible on tablet & mobile < 1024px) */}
          <div className="relative lg:hidden more-actions-container">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreOpen(!isMoreOpen);
              }}
              className={`flex items-center justify-center p-2 rounded-2xl border transition-all active:scale-95 cursor-pointer app-bg-hover app-border app-text shrink-0 ${
                isMoreOpen ? 'app-accent-bg app-accent-border app-accent-text shadow-sm' : ''
              }`}
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
 
            {isMoreOpen && (
              <div className="absolute right-0 w-56 p-2 rounded-xl border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 top-full mt-2 app-bg-card app-border app-text">
                {/* Download */}
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    handleDownloadHtml();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>{TRANSLATIONS[lang].download}</span>
                </button>
 
                {/* Download Markdown */}
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    handleDownloadMd();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'en' ? 'Download Markdown' : 'Télécharger Markdown'}</span>
                </button>
 
                {/* Copy HTML */}
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    handleCopyHtml();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copied ? TRANSLATIONS[lang].copied : TRANSLATIONS[lang].copy}</span>
                </button>
 
                {/* PDF Export */}
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    handlePrintPdf();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left"
                >
                  <Printer className="w-4 h-4 text-amber-500" />
                  <span>PDF</span>
                </button>
 
                {/* FAQ */}
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsFaqOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:app-bg-hover text-left"
                >
                  <HelpCircle className="w-4 h-4 text-sky-500" />
                  <span>FAQ</span>
                </button>
 
                {files.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setIsMoreOpen(false);
                        handleDownloadAllHtml(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:app-bg-hover text-left border-t app-border mt-1.5 pt-1.5"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                      <span>{lang === 'en' ? 'Download All (Independent)' : 'Tout Télécharger (Indépendant)'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMoreOpen(false);
                        handleDownloadAllHtml(true);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:app-bg-hover text-left"
                    >
                      <Download className="w-4 h-4 text-emerald-500" />
                      <span>{lang === 'en' ? 'Download All (Interlinked)' : 'Tout Télécharger (Interconnecté)'}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* FAQ Modal */}
      {isFaqOpen && (
        <div 
          className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 ${appTheme === 'dark' ? 'dark' : ''}`}
          onClick={() => setIsFaqOpen(false)}
        >
          <div 
            className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl border shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-6 app-bg-card app-border app-text relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsFaqOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:app-bg-hover transition-colors cursor-pointer text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold"
              title="Close FAQ"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider app-accent-text">
                {TRANSLATIONS[lang].faq}
              </h3>
              <p className="text-[11px] app-text-secondary">
                {lang === 'en' 
                  ? "Everything you need to know about security, privacy, and how MD Preview works."
                  : "Tout ce que vous devez savoir sur la sécurité, la confidentialité et le fonctionnement de MD Preview."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border app-bg app-border space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold app-text flex items-center gap-1.5">
                  <span>🔒</span> {TRANSLATIONS[lang].faqSec}
                </h4>
                <p className="text-[11px] app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqSecAns}
                </p>
              </div>
              <div className="p-4 rounded-2xl border app-bg app-border space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold app-text flex items-center gap-1.5">
                  <span>🍪</span> {TRANSLATIONS[lang].faqCookie}
                </h4>
                <p className="text-[11px] app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqCookieAns}
                </p>
              </div>
              <div className="p-4 rounded-2xl border app-bg app-border space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold app-text flex items-center gap-1.5">
                  <span>📄</span> {TRANSLATIONS[lang].faqFiles}
                </h4>
                <p className="text-[11px] app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqFilesAns}
                </p>
              </div>
              <div className="p-4 rounded-2xl border app-bg app-border space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold app-text flex items-center gap-1.5">
                  <span>💾</span> {TRANSLATIONS[lang].faqExport}
                </h4>
                <p className="text-[11px] app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqExportAns}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsFaqOpen(false)}
              className="mt-2 self-center px-6 py-2 rounded-xl text-xs font-bold app-primary-btn border-transparent cursor-pointer hover:shadow-md transition-all active:scale-95"
            >
              {TRANSLATIONS[lang].done}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
