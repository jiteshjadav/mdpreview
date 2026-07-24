'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, ShieldCheck, Upload, Sun, Moon, Globe, HelpCircle, AlertTriangle, Download, Files, Sparkles, X, Layers } from 'lucide-react';
import { DropZone } from '@/components/DropZone';
import { RenderedView } from '@/components/RenderedView';
import { FloatingDock } from '@/components/FloatingDock';
import { AdSlot } from '@/components/AdSlot';
import { convertMarkdown, ParseResult } from '@/lib/engine/converter';
import { ThemeType } from '@/components/ThemeSwitcher';
import { Logo } from '@/components/Logo';
import { GreenShieldIcon } from '@/components/GreenShieldIcon';
import { generateStandaloneHtml } from '@/lib/export/htmlExport';
import JSZip from 'jszip';
import packageJson from '../../package.json';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  parseResult: ParseResult | null;
}

export type AppTheme = 'sapphire' | 'dark';



export const TRANSLATIONS = {
  en: {
    title: "Instant Markdown Viewer & HTML Exporter",
    descPrefix: "No servers, no tracking.",
    descHighlight: "Drop multiple Markdown files (md/mdx)",
    descSuffix: "and instantly view, copy, or download them as self-contained web pages.",
    securityBadge: "100% Local & Private Guarantee — No files leave your browser",
    privacyNotice: "🔒 Private & Serverless — Zero tracking or data transmission",
    dropzoneTitle: "Drag and drop markdown files here",
    dropzoneSubtitle: "or click to select from your device",
    dropzoneButton: "Choose Files",
    editorPlaceholder: "Type or paste Markdown here...",
    faq: "FAQ",
    theme: "Theme",
    appTheme: "App Theme",
    layout: "Layout",
    files: "Files",
    upload: "Open",
    viewing: "Viewing",
    copied: "Copied!",
    copy: "Copy",
    download: "Download",
    backToConverter: "Back to Converter",
    editor: "Edit",
    preview: "Preview",
    localCheck: "Converted locally inside your web browser",
    developedBy: "Developed by",
    privacyTitle: "Local & Private",
    done: "Done reading",
    faqSec: "Are my documents uploaded to a server?",
    faqSecAns: "No. MD Preview is completely client-side. All parsing and conversion are executed locally inside your web browser. Your private documents never leave your computer.",
    faqCookie: "Does this site use tracking cookies?",
    faqCookieAns: "No. We respect your privacy completely. We do not use analytics, tracking, or marketing cookies. Any settings you choose are stored purely inside your local browser.",
    faqFiles: "What file types are supported?",
    faqFilesAns: "You can instantly drag, drop, or copy-paste standard Markdown (.md), MDX (.mdx), or HTML files (.html).",
    faqExport: "How do HTML exports work?",
    faqExportAns: "You can copy the raw parsed HTML code to your clipboard, save the document as a print-optimized PDF, or download a fully responsive, standalone HTML web page."
  },
  fr: {
    title: "Visualiseur Markdown Instantané & Exportateur HTML",
    descPrefix: "Pas de serveurs, pas de suivi.",
    descHighlight: "Déposez plusieurs fichiers Markdown (md/mdx)",
    descSuffix: "et visualisez, copiez ou téléchargez-les instantanément sous forme de pages Web autonomes.",
    securityBadge: "Garantie 100% Local & Privé — Aucun fichier ne quitte votre navigateur",
    privacyNotice: "🔒 Privé & Sans serveur — Aucun suivi ni transmission de données",
    dropzoneTitle: "Glissez et déposez des fichiers markdown ici",
    dropzoneSubtitle: "ou cliquez pour sélectionner depuis votre appareil",
    dropzoneButton: "Choisir des fichiers",
    editorPlaceholder: "Saisissez ou collez du Markdown ici...",
    faq: "FAQ",
    theme: "Thème",
    appTheme: "Thème de l'App",
    layout: "Mise en page",
    files: "Fichiers",
    upload: "Ouvrir",
    viewing: "Visualisation",
    copied: "Copié !",
    copy: "Copier",
    download: "Télécharger",
    backToConverter: "Retour au convertisseur",
    editor: "Modifier",
    preview: "Aperçu",
    localCheck: "Converti localement dans votre navigateur Web",
    developedBy: "Développé par",
    privacyTitle: "Local & Privé",
    done: "Fermer",
    faqSec: "Mes documents sont-ils téléversés sur un serveur ?",
    faqSecAns: "Non. MD Preview est totalement côté client. Tous les traitements et conversions sont exécutés localement dans votre navigateur. Vos documents privés ne quittent jamais votre ordinateur.",
    faqCookie: "Ce site utilise-t-il des cookies de suivi ?",
    faqCookieAns: "Non. Nous respectons totalement votre vie privée. Nous n'utilisons aucun cookie d'analyse, de suivi ou de marketing. Vos réglages sont stockés localement.",
    faqFiles: "Quels types de fichiers sont pris en charge ?",
    faqFilesAns: "Vous pouvez instantanément glisser-déposer ou copier-coller des fichiers Markdown standard (.md), MDX (.mdx) ou HTML (.html).",
    faqExport: "Comment fonctionne l'export HTML ?",
    faqExportAns: "Vous pouvez copier le code HTML brut, enregistrer le document au format PDF ou télécharger une page HTML autonome et responsive."
  }
};

const DEFAULT_TEMPLATES: Record<string, { filename: string; content: string }> = {
  md: {
    filename: 'document.md',
    content: `# Welcome to Markdown Editor\n\nStart typing your Markdown documentation here. You can use standard GitHub Flavored Markdown, tables, callouts, and code blocks.\n\n## Features\n- Live side-by-side editing\n- 100% Client-side parsing\n- Instant HTML & PDF exports\n\n\`\`\`javascript\nconsole.log("Hello, Markdown!");\n\`\`\`\n`
  },
  mdx: {
    filename: 'interactive.mdx',
    content: `# MDX Interactive Components\n\nMDX lets you write JSX components directly inside your Markdown documents.\n\n<Callout variant="info">\n  This is a custom alert callout powered by client-side MDX evaluation.\n</Callout>\n\n<Badge variant="primary">React 19 Supported</Badge> <Badge variant="success">Client-Side</Badge>\n\n## Live Component Demo\nTry editing the text or tags above in the live editor!`
  },
  mermaid: {
    filename: 'architecture-diagram.md',
    content: `# System Architecture & Flowchart\n\nMermaid diagrams render instantly with built-in pan, zoom, and fullscreen capabilities.\n\n\`\`\`mermaid\ngraph TD\n  Client[Web Browser] --> Gateway[API Gateway]\n  Gateway --> Auth[Authentication Service]\n  Gateway --> Engine[Node.js Engine]\n  Engine --> Database[(PostgreSQL Cache)]\n\`\`\`\n\n## Sequence Diagram Example\n\n\`\`\`mermaid\nsequenceDiagram\n  autonumber\n  User->>Browser: Upload Markdown File\n  Browser->>Engine: Evaluate MD/MDX\n  Engine-->>Browser: Render Standalone HTML\n\`\`\`\n`
  },
  readme: {
    filename: 'README.md',
    content: `# Project Name\n\n> A fast, privacy-focused Markdown viewer and exporter.\n\n[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)\n\n## Installation\n\n\`\`\`bash\nnpm install @northbit/mdpreview\n\`\`\`\n\n## Quick Start\n\n\`\`\`ts\nimport { convertMarkdown } from '@northbit/mdpreview';\nconst html = await convertMarkdown('# Hello World');\n\`\`\`\n\n## License\nMIT © NorthbitHQ\n`
  }
};

export interface WorkspaceAppProps {
  initialMode?: 'uploader' | 'editor' | 'preview';
  initialTemplate?: 'blank' | 'md' | 'mdx' | 'mermaid' | 'readme';
  customTitle?: string;
  customDescription?: string;
}

export function WorkspaceApp({
  initialMode = 'uploader',
  initialTemplate = 'md',
  customTitle,
  customDescription,
}: WorkspaceAppProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('sapphire-spec');
  const [isEditing, setIsEditing] = useState<boolean>(initialMode === 'editor');
  const [appTheme, setAppTheme] = useState<AppTheme>('sapphire');
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [isFaqView, setIsFaqView] = useState(false);
  const [lang, setLang] = useState<'en' | 'fr'>('en');

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string>('untitled-workspace');

  const handleCloseIntroModal = () => {
    setShowIntroModal(false);
    try {
      localStorage.setItem('mdpreview_seen_intro_modal', 'true');
      document.cookie = 'mdpreview_seen_intro_modal=true; path=/; max-age=31536000; SameSite=Lax';
    } catch (e) {
      console.error('Failed to save intro modal preference:', e);
    }
  };

  const handleDocThemeChange = (newTheme: ThemeType) => {
    setSelectedTheme(newTheme);
    try {
      localStorage.setItem('mdpreview_doc_theme', newTheme);
      document.cookie = `mdpreview_doc_theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.error('Failed to save document theme preference:', e);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('mdpreview-app-theme') as AppTheme;
    if (savedTheme && ['sapphire', 'dark'].includes(savedTheme)) {
      setAppTheme(savedTheme);
    }
    const savedLang = localStorage.getItem('mdpreview-lang') as 'en' | 'fr';
    if (savedLang && ['en', 'fr'].includes(savedLang)) {
      setLang(savedLang);
    }

    // Load saved document layout theme selection from cookie or localStorage
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    // First-time visit check for multi-file guiding popup
    const cookieSeen = getCookie('mdpreview_seen_intro_modal');
    const localSeen = typeof window !== 'undefined' ? localStorage.getItem('mdpreview_seen_intro_modal') : null;
    if (!cookieSeen && !localSeen) {
      const timer = setTimeout(() => setShowIntroModal(true), 400);
    }

    const cookieTheme = getCookie('mdpreview_doc_theme') as ThemeType;
    const localTheme = (typeof window !== 'undefined' ? localStorage.getItem('mdpreview_doc_theme') : null) as ThemeType;
    const savedDocTheme = cookieTheme || localTheme;
    const validThemes: ThemeType[] = ['split-book', 'dashboard-deck', 'stepped-progress', 'warm-editorial', 'sapphire-spec', 'enterprise-blue', 'clean-html'];

    if (savedDocTheme && validThemes.includes(savedDocTheme)) {
      setSelectedTheme(savedDocTheme);
    }

    // Direct route initialization (if mode is editor or preview, load template automatically)
    if ((initialMode === 'editor' || initialMode === 'preview') && files.length === 0) {
      const templateConfig = DEFAULT_TEMPLATES[initialTemplate] || DEFAULT_TEMPLATES.md;
      convertMarkdown(templateConfig.content).then((parseResult) => {
        const fileId = Math.random().toString(36).substring(2, 9);
        setFiles([
          {
            id: fileId,
            name: templateConfig.filename,
            content: templateConfig.content,
            parseResult,
          },
        ]);
        setActiveFileId(fileId);
        setIsEditing(initialMode === 'editor');
      });
    }
  }, []);

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

    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === activeFileId) {
          return { ...f, content };
        }
        return f;
      })
    );

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

  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
    const selectedFile = files.find((f) => f.id === fileId);
    if (selectedFile) {
      const isHtml = selectedFile.name.toLowerCase().endsWith('.html') || selectedFile.name.toLowerCase().endsWith('.htm');
      if (isHtml) {
        setIsEditing(false);
      }
    }
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
        zip.file('md/' + file.name, file.content);
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
    if (files.length === 0) {
      handleFilesLoaded([{ name: 'scratch.md', content: '# New Workspace\n\nStart typing markdown here...' }]);
    }
    setIsEditing(true);
  };

  const activeFile = files.find((f) => f.id === activeFileId);
  const hasContent = files.length > 0;

  return (
    <div
      data-app-theme={appTheme}
      style={hasContent ? { backgroundColor: 'var(--doc-page-bg, #f4f7fb)', color: 'var(--doc-header-text, #091e42)' } : undefined}
      className={`min-h-screen flex flex-col transition-colors duration-300 ${appTheme === 'dark' ? 'dark' : ''} ${!hasContent ? 'app-bg-main app-text' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsPageDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (e.clientX === 0 || e.clientY === 0) {
          setIsPageDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsPageDragging(false);

        const droppedFiles = e.dataTransfer?.files;
        if (droppedFiles && droppedFiles.length > 0) {
          const validFiles = Array.from(droppedFiles).filter((f) => {
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
                reader.readAsText(file);
              });
            });

            Promise.all(promises).then((results) => {
              handleFilesLoaded(results);
            });
          }
        }
      }}
    >
      {/* Dynamic Top App Header */}
      {!hasContent && (
        <header className="w-full border-b app-border app-bg-card transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsFaqView(false)}>
              <Logo className="h-6 w-auto" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAppThemeChange(appTheme === 'dark' ? 'sapphire' : 'dark')}
                className="flex items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer app-bg-hover app-border app-text select-none"
                title={appTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark/light mode"
              >
                {appTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 app-accent-text" />
                )}
              </button>

              <button
                onClick={() => {
                  const nextLang = lang === 'en' ? 'fr' : 'en';
                  setLang(nextLang);
                  localStorage.setItem('mdpreview-lang', nextLang);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer app-bg-hover app-border app-text select-none"
              >
                <Globe className="w-3.5 h-3.5 app-accent-text" />
                <span className="uppercase font-mono text-[11px]">{lang}</span>
              </button>

              <button
                onClick={() => setIsFaqView(!isFaqView)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${isFaqView
                    ? 'app-primary-btn border-transparent shadow-xs'
                    : 'app-bg-hover app-border app-text'
                  }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{TRANSLATIONS[lang].faq}</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Workspace Area */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col justify-center ${hasContent ? 'max-w-[96%]' : 'max-w-6xl'}`}>
        {!hasContent && !isFaqView && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight app-text leading-tight">
                {customTitle || TRANSLATIONS[lang].title}
              </h2>
              <p className="text-sm sm:text-base app-text-secondary leading-relaxed">
                {customDescription ? (
                  customDescription
                ) : (
                  <>
                    {TRANSLATIONS[lang].descPrefix}{' '}
                    <span className="hero-highlight-text">{TRANSLATIONS[lang].descHighlight}</span>{' '}
                    {TRANSLATIONS[lang].descSuffix}
                  </>
                )}
              </p>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold app-bg-card border app-border shadow-md select-none">
                <GreenShieldIcon size={24} />
                <span className="app-text font-bold">{TRANSLATIONS[lang].securityBadge}</span>
              </div>
            </div>

            <DropZone
              onFilesLoaded={handleFilesLoaded}
              onOpenEditor={handleOpenEditor}
              lang={lang}
            />
          </div>
        )}

        {/* FAQ Screen View */}
        {!hasContent && isFaqView && (
          <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between pb-4 border-b app-border">
              <h2 className="text-2xl font-bold tracking-tight app-text">
                {TRANSLATIONS[lang].faq}
              </h2>
              <button
                onClick={() => setIsFaqView(false)}
                className="px-4 py-2 rounded-2xl text-xs font-bold app-primary-btn cursor-pointer transition-all shadow-xs"
              >
                {TRANSLATIONS[lang].done}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl border app-bg-card app-border space-y-2">
                <h3 className="text-sm font-bold app-text flex items-center gap-2">
                  <GreenShieldIcon size={20} />
                  {TRANSLATIONS[lang].faqSec}
                </h3>
                <p className="text-xs app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqSecAns}
                </p>
              </div>

              <div className="p-5 rounded-3xl border app-bg-card app-border space-y-2">
                <h3 className="text-sm font-bold app-text flex items-center gap-2">
                  <Globe className="w-4 h-4 app-accent-text" />
                  {TRANSLATIONS[lang].faqCookie}
                </h3>
                <p className="text-xs app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqCookieAns}
                </p>
              </div>

              <div className="p-5 rounded-3xl border app-bg-card app-border space-y-2">
                <h3 className="text-sm font-bold app-text flex items-center gap-2">
                  <FileText className="w-4 h-4 app-accent-text" />
                  {TRANSLATIONS[lang].faqFiles}
                </h3>
                <p className="text-xs app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqFilesAns}
                </p>
              </div>

              <div className="p-5 rounded-3xl border app-bg-card app-border space-y-2">
                <h3 className="text-sm font-bold app-text flex items-center gap-2">
                  <Download className="w-4 h-4 app-accent-text" />
                  {TRANSLATIONS[lang].faqExport}
                </h3>
                <p className="text-xs app-text-secondary leading-relaxed">
                  {TRANSLATIONS[lang].faqExportAns}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Full-Page Workspace Screen (State B) */}
        {hasContent && activeFile && (
          <div className="animate-in fade-in duration-300 preview-isolate" style={{ colorScheme: (selectedTheme === 'dark-spec' || selectedTheme === 'warm-editorial') ? 'dark' : 'light' }}>
            <RenderedView
              parseResult={activeFile.parseResult!}
              rawMarkdown={activeFile.content}
              filename={activeFile.name}
              isEditing={isEditing && !activeFile.name.toLowerCase().endsWith('.html') && !activeFile.name.toLowerCase().endsWith('.htm')}
              onContentChange={handleActiveFileContentChange}
              selectedTheme={selectedTheme}
            />
          </div>
        )}
      </main>

      {/* Floating Action Header */}
      {hasContent && activeFile && (
        <FloatingDock
          parseResult={activeFile.parseResult!}
          filename={activeFile.name}
          selectedTheme={selectedTheme}
          onThemeChange={handleDocThemeChange}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onBackToUpload={handleBackToUpload}
          files={files.map(f => ({ id: f.id, name: f.name, content: f.content, html: f.parseResult?.html }))}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
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

      {/* Footer */}
      {!hasContent && (
        <footer className="w-full border-t app-border app-bg-card py-6 transition-colors duration-300 mt-auto">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs app-text-secondary">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold">{TRANSLATIONS[lang].privacyNotice}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border app-border app-bg-hover app-text-secondary select-none">
                v{packageJson.version}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Logo className="h-5 w-auto" />
            </div>
          </div>
        </footer>
      )}

      {/* Exit Confirmation Dialog */}
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
                className="w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-all cursor-pointer shadow-md shadow-teal-500/20 select-none flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Export & Exit' : 'Exporter & Quitter'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
