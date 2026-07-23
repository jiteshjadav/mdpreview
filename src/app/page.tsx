'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, ShieldCheck, Upload, SunMoon, Globe, HelpCircle, AlertTriangle, Download } from 'lucide-react';
import { DropZone } from '@/components/DropZone';
import { RenderedView } from '@/components/RenderedView';
import { FloatingDock } from '@/components/FloatingDock';
import { AdSlot } from '@/components/AdSlot';
import { convertMarkdown, ParseResult } from '@/lib/engine/converter';
import { ThemeType } from '@/components/ThemeSwitcher';
import { generateStandaloneHtml } from '@/lib/export/htmlExport';
import JSZip from 'jszip';
import packageJson from '../../package.json';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  parseResult: ParseResult | null;
}

export type AppTheme = 'teal' | 'indigo' | 'dark';

interface AppThemeConfig {
  id: AppTheme;
  name: string;
  previewColor: string;
}

const APP_THEMES: AppThemeConfig[] = [
  {
    id: 'teal',
    name: 'Teal Lagoon (Default)',
    previewColor: 'bg-teal-600',
  },
  {
    id: 'indigo',
    name: 'Indigo Breeze',
    previewColor: 'bg-indigo-600',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    previewColor: 'bg-slate-800 dark:bg-slate-100 border-slate-650 dark:border-slate-355',
  },
];

// French / English translation mapping dictionary
export const TRANSLATIONS = {
  en: {
    title: "Instant Markdown Viewer & HTML Exporter",
    desc: "No servers, no tracking. Drop multiple Markdown files (md/mdx) and instantly view, copy, or download them as self-contained web pages.",
    securityBadge: "100% Local & Secure — No files are uploaded to any server",
    dropzoneTitle: "Drag and drop markdown files here",
    dropzoneSubtitle: "or click to select from your device",
    dropzoneButton: "Choose Files",
    editorPlaceholder: "Type or paste Markdown here...",
    faq: "FAQ",
    theme: "Theme",
    appTheme: "App Theme",
    layout: "Layout",
    files: "Files",
    upload: "Upload",
    viewing: "Viewing",
    copied: "Copied!",
    copy: "Copy",
    download: "Download",
    backToConverter: "Back to Converter",
    editor: "Edit",
    preview: "Preview",
    localCheck: "Converted 100% locally inside your web browser",
    developedBy: "Developed by",
    privacyTitle: "100% Local & Private",
    done: "Done reading",
    faqSec: "Are my documents uploaded to a server?",
    faqSecAns: "No. MD Preview is 100% client-side. All parsing and conversion are executed locally inside your web browser. Your private documents never leave your computer.",
    faqCookie: "Does this site use tracking cookies?",
    faqCookieAns: "No. We respect your privacy completely. We do not use analytics, tracking, or marketing cookies. Any settings you choose are stored purely inside your local browser.",
    faqFiles: "What file types are supported?",
    faqFilesAns: "You can instantly drag, drop, or copy-paste standard Markdown (.md), MDX (.mdx), or HTML files (.html).",
    faqExport: "How do HTML exports work?",
    faqExportAns: "You can copy the raw parsed HTML code to your clipboard, save the document as a print-optimized PDF, or download a fully responsive, standalone HTML web page."
  },
  fr: {
    title: "Visualiseur Markdown Instantané & Exportateur HTML",
    desc: "Pas de serveurs, pas de suivi. Déposez plusieurs fichiers Markdown (md/mdx) et visualisez, copiez ou téléchargez-les instantanément sous forme de pages Web autonomes.",
    securityBadge: "100% Local & Sécurisé — Aucun fichier n'est téléversé sur un serveur",
    dropzoneTitle: "Glissez et déposez des fichiers markdown ici",
    dropzoneSubtitle: "ou cliquez pour sélectionner depuis votre appareil",
    dropzoneButton: "Choisir des fichiers",
    editorPlaceholder: "Saisissez ou collez du Markdown ici...",
    faq: "FAQ",
    theme: "Thème",
    appTheme: "Thème de l'App",
    layout: "Mise en page",
    files: "Fichiers",
    upload: "Importer",
    viewing: "Visualisation",
    copied: "Copié !",
    copy: "Copier",
    download: "Télécharger",
    backToConverter: "Retour au convertisseur",
    editor: "Modifier",
    preview: "Aperçu",
    localCheck: "Converti à 100% localement dans votre navigateur Web",
    developedBy: "Développé par",
    privacyTitle: "100% Local & Privé",
    done: "Fermer",
    faqSec: "Mes documents sont-ils téléversés sur un serveur ?",
    faqSecAns: "Non. MD Preview est 100% côté client. Tous les traitements et conversions sont exécutés localement dans votre navigateur. Vos documents privés ne quittent jamais votre ordinateur.",
    faqCookie: "Ce site utilise-t-il des cookies de suivi ?",
    faqCookieAns: "Non. Nous respectons totalement votre vie privée. Nous n'utilisons aucun cookie d'analyse, de suivi ou de marketing. Vos réglages sont stockés localement.",
    faqFiles: "Quels types de fichiers sont pris en charge ?",
    faqFilesAns: "Vous pouvez instantanément glisser-déposer ou copier-coller des fichiers Markdown standard (.md), MDX (.mdx) ou HTML (.html).",
    faqExport: "Comment fonctionne l'export HTML ?",
    faqExportAns: "Vous pouvez copier le code HTML brut, enregistrer le document au format PDF ou télécharger une page HTML autonome et responsive."
  }
};

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('split-book');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [appTheme, setAppTheme] = useState<AppTheme>('teal'); // Teal is default
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [isFaqView, setIsFaqView] = useState(false);
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const [isAppThemeOpen, setIsAppThemeOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string>('untitled-workspace');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('mdpreview-app-theme') as AppTheme;
    if (savedTheme && ['teal', 'indigo', 'dark'].includes(savedTheme)) {
      setAppTheme(savedTheme);
    }
    const savedLang = localStorage.getItem('mdpreview-lang') as 'en' | 'fr';
    if (savedLang && ['en', 'fr'].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);
 
  // Prevent accidental close/reload when files are loaded
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (files.length > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [files]);

  const handleAppThemeChange = (theme: AppTheme) => {
    setAppTheme(theme);
    localStorage.setItem('mdpreview-app-theme', theme);
  };

  const handleFilesLoaded = (loaded: { name: string; content: string }[]) => {
    const promises = loaded.map(async (item) => {
      const isHtml = item.name.toLowerCase().endsWith('.html') || item.name.toLowerCase().endsWith('.htm');
      const parseResult = await convertMarkdown(item.content, isHtml);
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: item.name,
        content: item.content,
        parseResult,
      };
    });

    const getUniqueFilename = (name: string, existingNames: string[]): string => {
      if (!existingNames.includes(name)) return name;

      const dotIndex = name.lastIndexOf('.');
      const base = dotIndex === -1 ? name : name.substring(0, dotIndex);
      const ext = dotIndex === -1 ? '' : name.substring(dotIndex);

      let counter = 2;
      let uniqueName = `${base} (v${counter})${ext}`;
      while (existingNames.includes(uniqueName)) {
        counter++;
        uniqueName = `${base} (v${counter})${ext}`;
      }
      return uniqueName;
    };

    Promise.all(promises).then((newFiles) => {
      setIsFaqView(false);
      setFiles((prev) => {
        const resolvedNewFiles: UploadedFile[] = [];
        const existingNames = prev.map((f) => f.name);

        for (const file of newFiles) {
          const uniqueName = getUniqueFilename(
            file.name,
            [...existingNames, ...resolvedNewFiles.map((f) => f.name)]
          );
          resolvedNewFiles.push({
            ...file,
            name: uniqueName,
          });
        }

        if (resolvedNewFiles.length > 0) {
          setActiveFileId(resolvedNewFiles[0].id);
        }
        return [...prev, ...resolvedNewFiles];
      });
    });
  };

  const handleActiveFileContentChange = (content: string) => {
    if (!activeFileId) return;

    // 1. Update text content synchronously so editor keeps focus with no lag
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === activeFileId) {
          return { ...f, content };
        }
        return f;
      })
    );

    // 2. Compile/parse Markdown asynchronously in the background
    convertMarkdown(content).then((parseResult) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === activeFileId && f.content === content) {
            return { ...f, parseResult };
          }
          return f;
        })
      );
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };
 
  const handleRenameFile = (fileId: string, newName: string) => {
    let cleanName = newName.trim();
    if (!cleanName) return;
 
    const activeFile = files.find(f => f.id === fileId);
    if (activeFile) {
      const originalExt = activeFile.name.split('.').pop() || 'md';
      const newExt = cleanName.split('.').pop()?.toLowerCase();
      if (newExt !== 'md' && newExt !== 'mdx' && newExt !== 'html' && newExt !== 'htm') {
        cleanName = `${cleanName}.${originalExt}`;
      }
    }
 
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: cleanName } : f))
    );
  };

  const handleBackToUpload = () => {
    if (files.length > 0) {
      setShowExitConfirm(true);
    } else {
      performBackToUpload();
    }
  };
 
  const performBackToUpload = () => {
    setFiles([]);
    setActiveFileId(null);
    setIsEditing(false);
    setIsFaqView(false);
    setShowExitConfirm(false);
    setWorkspaceName('untitled-workspace');
  };
 
  const handleExportAndExit = async () => {
    const zip = new JSZip();
 
    files.forEach((file) => {
      if (file.parseResult?.html) {
        const standaloneHtml = generateStandaloneHtml(file.parseResult.html, {
          title: file.name.replace(/\.(md|mdx|txt)$/, ''),
          theme: selectedTheme,
          files: [],
        });
        zip.file(file.name.replace(/\.(mdx|md|txt)$/, '') + '.html', standaloneHtml);
      }
      if (file.content) {
        zip.file(file.name, file.content);
      }
    });
 
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const blob = new Blob([content], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${workspaceName || 'workspace'}-backup.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export backup ZIP:', err);
    }
 
    performBackToUpload();
  };

  const handleOpenEditor = () => {
    handleFilesLoaded([
      {
        name: 'untitled.md',
        content: '# Untitled Document\n\nType your markdown here...',
      },
    ]);
    setIsEditing(true);
  };

  const activeFile = files.find((f) => f.id === activeFileId) || null;
  const hasContent = files.length > 0 && activeFile !== null && activeFile.parseResult !== null;

  // Inject selected theme link in head for reliable dynamic updates
  useEffect(() => {
    if (hasContent) {
      let link = document.getElementById('theme-stylesheet') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = 'theme-stylesheet';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `themes/pages/${selectedTheme}.css`;
    } else {
      const link = document.getElementById('theme-stylesheet');
      if (link) {
        link.remove();
      }
    }
  }, [selectedTheme, hasContent]);

  // Inject app theme link in head for reliable dynamic updates
  useEffect(() => {
    let link = document.getElementById('app-theme-stylesheet') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'app-theme-stylesheet';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `themes/app/${appTheme}.css`;
  }, [appTheme]);

  // Page level drag-and-drop window event handlers
  useEffect(() => {
    let dragCounter = 0;
 
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
 
      if (e.dataTransfer?.types) {
        const types = Array.from(e.dataTransfer.types);
        if (types.includes('Files')) {
          dragCounter++;
          setIsPageDragging(true);
        }
      }
    };
 
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };
 
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
 
      if (e.dataTransfer?.types) {
        const types = Array.from(e.dataTransfer.types);
        if (types.includes('Files')) {
          dragCounter--;
          if (dragCounter <= 0) {
            dragCounter = 0;
            setIsPageDragging(false);
          }
        }
      }
    };
 
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      dragCounter = 0;
      setIsPageDragging(false);
 
      const droppedFiles = e.dataTransfer?.files;
      const droppedItems = e.dataTransfer?.items;
      if (droppedFiles && droppedFiles.length > 0) {
        const filesList: File[] = [];
        for (let i = 0; i < droppedFiles.length; i++) {
          const file = droppedFiles[i];
          let isDir = false;
          if (droppedItems && droppedItems[i]) {
            try {
              const entry = droppedItems[i].webkitGetAsEntry();
              if (entry && entry.isDirectory) {
                isDir = true;
              }
            } catch (err) {
              console.error(err);
            }
          }
          if (!isDir) {
            filesList.push(file);
          }
        }
 
        const validFiles = filesList.filter((f) => {
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
              try {
                reader.readAsText(file);
              } catch (err) {
                console.error(err);
                resolve({ name: file.name, content: '' });
              }
            });
          });
 
          Promise.all(promises).then((results) => {
            const successFiles = results.filter(r => r.content.length > 0);
            if (successFiles.length > 0) {
              handleFilesLoaded(successFiles);
            }
          });
        }
      }
    };
 
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
 
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 app-bg app-text relative ${appTheme === 'dark' ? 'dark' : ''}`}
    >

      {/* 1. Header is ONLY visible on the Upload screen (State A) to keep Rendered screen 100% full-page */}
      {!hasContent && (
        <header className="border-b sticky top-0 z-30 transition-colors duration-300 app-bg-card app-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div 
              onClick={handleBackToUpload}
              className="flex items-center gap-2 cursor-pointer active:scale-98 transition-transform select-none"
              title="Go to upload screen"
            >
              <img src="logo.png" alt="MD Preview Logo" className={`h-9 w-auto object-contain transition-all rounded px-2 py-0.5 ${
                appTheme === 'dark' ? 'bg-white/95 shadow-sm' : ''
              }`} />
            </div>

            <div className="flex items-center gap-1.5">
              {/* FAQ Toggling Link */}
              <button
                onClick={() => setIsFaqView(!isFaqView)}
                className={`flex items-center justify-center gap-2 w-9 h-9 xs:w-auto xs:h-9 px-2 xs:px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer select-none shrink-0 ${
                  isFaqView 
                    ? 'app-accent-bg app-accent-border app-accent-text' 
                    : 'app-bg-hover app-border app-text'
                }`}
                title={isFaqView ? "Converter" : "FAQ"}
              >
                <HelpCircle className="w-4 h-4 app-accent-text" />
                <span className="hidden xs:inline">{isFaqView ? TRANSLATIONS[lang].backToConverter : TRANSLATIONS[lang].faq}</span>
              </button>

              {/* Language Selector Button */}
              <button
                onClick={() => {
                  const nextLang = lang === 'en' ? 'fr' : 'en';
                  setLang(nextLang);
                  localStorage.setItem('mdpreview-lang', nextLang);
                }}
                className="flex items-center justify-center gap-2 h-9 px-2.5 xs:px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border app-bg-hover app-border app-text cursor-pointer select-none shrink-0"
                title={lang === 'en' ? "Passer en Français" : "Switch to English"}
              >
                <Globe className="w-4 h-4 app-accent-text" />
                <span>{lang === 'en' ? 'FR' : 'EN'}</span>
              </button>

              {/* App Color Theme Selector Popup Dropdown */}
              <div className="relative app-theme-dropdown-container">
                <button
                  onClick={() => setIsAppThemeOpen(!isAppThemeOpen)}
                  className={`flex items-center justify-center gap-2 w-9 h-9 xs:w-auto xs:h-9 px-2 xs:px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer select-none shrink-0 ${
                    isAppThemeOpen ? 'app-accent-bg app-accent-border app-accent-text' : 'app-bg-hover app-border app-text'
                  }`}
                  title={lang === 'en' ? "Change App Theme" : "Changer le thème de l'application"}
                >
                  <SunMoon className="w-4 h-4 app-accent-text" />
                  <span className="hidden xs:inline">{lang === 'en' ? 'Theme' : 'Thème'}</span>
                </button>

                {isAppThemeOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent animate-none"
                      onClick={() => setIsAppThemeOpen(false)}
                    />
                    <div className="absolute right-0 w-44 p-2 rounded-xl border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 top-full mt-2 app-bg-card app-border app-text">
                      <div className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 mb-1 border-b app-text-light app-border">
                        {TRANSLATIONS[lang].appTheme}
                      </div>
                      <div className="space-y-1">
                        {APP_THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => {
                              handleAppThemeChange(theme.id);
                              setIsAppThemeOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-xs font-semibold ${
                              appTheme === theme.id
                                ? 'app-accent-bg app-accent-text'
                                : 'hover:app-bg-hover app-text-secondary'
                            }`}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${theme.previewColor} border border-slate-350`} />
                            <span>{theme.id === 'teal' ? (lang === 'en' ? 'Teal' : 'Sarcelle') : theme.id === 'indigo' ? 'Indigo' : (lang === 'en' ? 'Dark Mode' : 'Mode Sombre')}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 transition-all duration-300 ${hasContent ? 'pt-20 pb-10 max-w-[1360px]' : 'py-16 max-w-5xl flex flex-col justify-center'}`}>
        
        {/* Upload Screen (State A) - Active when no content loaded and FAQ is not active */}
        {!hasContent && !isFaqView && (
          <div className="space-y-10 my-auto animate-in fade-in slide-in-from-bottom-6 duration-300 flex flex-col items-center">
            {/* Focused header design with security badge */}
            <div className="flex flex-col items-center gap-4 text-center max-w-2xl">
              <section className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight transition-colors app-text">
                  {TRANSLATIONS[lang].title}
                </h1>

                {/* Security & Confidence Tag */}
                <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-2xl text-xs font-medium bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-xs mx-auto animate-in fade-in duration-300 select-none backdrop-blur-xs">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-center text-center">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-250">
                      {lang === 'en' ? '100% Local & Secure' : '100% Local & Sécurisé'}
                    </span>
                    <span className="text-emerald-400/40 dark:text-emerald-600/40 hidden xs:inline">•</span>
                    <span className="opacity-90 font-medium">
                      {lang === 'en' ? 'No files are uploaded to any server' : "Aucun fichier n'est téléversé sur un serveur"}
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed max-w-lg mx-auto transition-colors app-text-secondary pt-1">
                  {lang === 'en' ? (
                    <>
                      No servers, no tracking. Drop <span className="font-extrabold app-text text-amber-600 dark:text-amber-455">multiple Markdown files (md/mdx)</span> and instantly view, copy, or download them as self-contained web pages.
                    </>
                  ) : (
                    <>
                      Pas de serveurs, pas de suivi. Déposez <span className="font-extrabold app-text text-amber-600 dark:text-amber-455">plusieurs fichiers Markdown (md/mdx)</span> et visualisez, copiez ou téléchargez-les instantanément sous forme de pages Web autonomes.
                    </>
                  )}
                </p>
              </section>
            </div>

            <DropZone
              onFilesLoaded={handleFilesLoaded}
              onOpenEditor={handleOpenEditor}
              appTheme={appTheme}
              lang={lang}
            />
          </div>
        )}

        {/* Dedicated FAQ Screen - Active when FAQ is toggled from header */}
        {!hasContent && isFaqView && (
          <div className="max-w-3xl mx-auto space-y-8 my-auto animate-in fade-in slide-in-from-bottom-6 duration-300 py-6">
            <section className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight app-text">
                {TRANSLATIONS[lang].faq}
              </h2>
              <p className="text-sm app-text-secondary max-w-md mx-auto">
                {lang === 'en' 
                  ? "Everything you need to know about security, data privacy, and how MD Preview converts your documentation."
                  : "Tout ce que vous devez savoir sur la sécurité, la confidentialité des données et la conversion de vos documents."}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-3xl border app-bg-card app-border space-y-2 shadow-sm transition-colors">
                <h3 className="text-sm font-bold app-text flex items-center gap-2">
                  <span className="text-base select-none">🔒</span> {TRANSLATIONS[lang].faqSec}
                </h3>
                <p className="text-xs app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqSecAns}
                </p>
              </div>

              <div className="p-5 rounded-3xl border app-bg-card app-border space-y-2 shadow-sm transition-colors">
                <h3 className="text-sm font-bold app-text flex items-center gap-2">
                  <span className="text-base select-none">🍪</span> {TRANSLATIONS[lang].faqCookie}
                </h3>
                <p className="text-xs app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqCookieAns}
                </p>
              </div>

              <div className="p-5 rounded-3xl border app-bg-card app-border space-y-2 shadow-sm transition-colors">
                <h3 className="text-sm font-bold app-text flex items-center gap-2">
                  <span className="text-base select-none">📄</span> {TRANSLATIONS[lang].faqFiles}
                </h3>
                <p className="text-xs app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqFilesAns}
                </p>
              </div>

              <div className="p-5 rounded-3xl border app-bg-card app-border space-y-2 shadow-sm transition-colors">
                <h3 className="text-sm font-bold app-text flex items-center gap-2">
                  <span className="text-base select-none">💾</span> {TRANSLATIONS[lang].faqExport}
                </h3>
                <p className="text-xs app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqExportAns}
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setIsFaqView(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer border-transparent app-primary-btn active:scale-98 transition-transform"
              >
                {TRANSLATIONS[lang].backToConverter}
              </button>
            </div>
          </div>
        )}

        {/* Full-Page HTML Output Screen (State B) */}
        {hasContent && activeFile && (
          <div className="animate-in fade-in duration-300">
            <RenderedView
              parseResult={activeFile.parseResult!}
              rawMarkdown={activeFile.content}
              filename={activeFile.name}
              isEditing={isEditing}
              onContentChange={handleActiveFileContentChange}
            />
          </div>
        )}
      </main>

      {/* Floating Action Header (Only visible when document is loaded) */}
      {hasContent && activeFile && (
        <FloatingDock
          parseResult={activeFile.parseResult!}
          filename={activeFile.name}
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onBackToUpload={handleBackToUpload}
          files={files.map(f => ({ id: f.id, name: f.name, content: f.content, html: f.parseResult?.html }))}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
          onRemoveFile={handleRemoveFile}
          onRenameFile={handleRenameFile}
          onAddFiles={handleFilesLoaded}
          appTheme={appTheme}
          lang={lang}
          setLang={setLang}
          workspaceName={workspaceName}
          onWorkspaceNameChange={setWorkspaceName}
        />
      )}

      {/* Simple Footer (Upload screen only) */}
      {!hasContent && (
        <footer className="border-t py-5 text-center text-xs transition-colors mt-auto app-bg-card app-border app-text-secondary">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{TRANSLATIONS[lang].localCheck}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>&copy; {new Date().getFullYear()} MD Preview</span>
              <span>•</span>
              <span className="font-semibold text-slate-400 dark:text-slate-500">v{packageJson.version}</span>
              <span>•</span>
              <span>{TRANSLATIONS[lang].developedBy} <a href="https://northbit.ca/" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium app-accent-text">Northbit</a></span>
            </div>
          </div>
        </footer>
      )}
 
      {/* Custom Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 ${appTheme === 'dark' ? 'dark' : ''}`}>
          <div 
            className="w-full max-w-md p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-5 app-bg-card app-border app-text relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {lang === 'en' ? 'Unsaved Changes' : 'Modifications non enregistrées'}
                </h3>
                <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5">
                  {lang === 'en' ? 'Are you sure you want to go back?' : 'Êtes-vous sûr de vouloir retourner ?'}
                </p>
              </div>
            </div>
 
            <p className="text-xs app-text-secondary leading-relaxed border-y py-3.5 app-border">
              {lang === 'en' 
                ? 'All files and unsaved changes in the workspace will be permanently lost. We recommend exporting your documents first.' 
                : 'Tous les fichiers et modifications de l’espace seront définitivement perdus. Nous vous conseillons d’exporter vos documents au préalable.'}
            </p>
 
            <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-end">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-bold border app-bg-hover app-border app-text transition-all cursor-pointer select-none"
              >
                {lang === 'en' ? 'Cancel' : 'Annuler'}
              </button>
              <button
                onClick={performBackToUpload}
                className="w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer select-none"
              >
                {lang === 'en' ? 'Exit (Discard Changes)' : 'Quitter (Abandonner)'}
              </button>
              <button
                onClick={handleExportAndExit}
                className="w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-bold bg-teal-650 text-white hover:bg-teal-700 transition-all cursor-pointer shadow-md shadow-teal-500/20 select-none flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Export & Exit' : 'Exporter & Quitter'}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Global Drag-and-Drop Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none select-none text-white transition-all duration-250 ${
          isPageDragging ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
        }`}
      >
        <div className="p-8 rounded-3xl border border-white/20 bg-slate-950/60 flex flex-col items-center gap-4 text-center max-w-sm shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg border border-teal-400">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Drop files to add</h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports .md, .mdx or .html files
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
