'use client';

import React, { useEffect } from 'react';
import mermaid from 'mermaid';
import { ParseResult } from '@/lib/engine/converter';

import { ThemeType } from './ThemeSwitcher';

export interface RenderedViewProps {
  parseResult: ParseResult;
  rawMarkdown: string;
  filename: string;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  selectedTheme?: ThemeType;
}

export function RenderedView({
  parseResult,
  rawMarkdown,
  filename,
  isEditing,
  onContentChange,
  selectedTheme = 'split-book',
}: RenderedViewProps) {

  // Dynamically load document presentation layout theme CSS file when selectedTheme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const themeId = selectedTheme || 'split-book';

      // Load shared doc-framework.css for consistent component rendering across app preview and export
      let frameworkLinkEl = document.getElementById('preview-doc-framework-stylesheet') as HTMLLinkElement;
      if (!frameworkLinkEl) {
        frameworkLinkEl = document.createElement('link');
        frameworkLinkEl.id = 'preview-doc-framework-stylesheet';
        frameworkLinkEl.rel = 'stylesheet';
        frameworkLinkEl.href = '/themes/pages/shared/doc-framework.css';
        document.head.appendChild(frameworkLinkEl);
      }

      let linkEl = document.getElementById('preview-doc-theme-stylesheet') as HTMLLinkElement;
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.id = 'preview-doc-theme-stylesheet';
        linkEl.rel = 'stylesheet';
        document.head.appendChild(linkEl);
      }
      linkEl.href = `/themes/pages/${themeId}.css`;
      document.documentElement.setAttribute('data-theme', themeId);
      const gridCapable = ['split-book', 'dashboard-deck', 'stepped-progress', 'dark-spec', 'warm-editorial', 'sapphire-spec', 'enterprise-blue'].includes(themeId);
      document.documentElement.setAttribute('data-layout', gridCapable ? 'grid' : 'column');
    }
  }, [selectedTheme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });

        // Find elements that have not been compiled into SVG elements yet
        const unrenderedNodes = Array.from(document.querySelectorAll('.doc-mermaid.mermaid')).filter(
          (el) => !el.hasAttribute('data-processed') && el.querySelector('svg') === null
        );

        setupCodeBlockCopyButtons();
        if (unrenderedNodes.length === 0) {
          setupMermaidViewers();
          return;
        }

        // Render unrendered mermaid elements safely
        mermaid.run({
          nodes: unrenderedNodes as HTMLElement[],
        }).then(() => {
          setupMermaidViewers();
        }).catch((err) => {
          console.error('Mermaid render error:', err);
          setupMermaidViewers();
        });
      } catch (e) {
        console.error('Mermaid setup error:', e);
      }
    }
  }, [parseResult.html, isEditing, selectedTheme]);

  const isDarkDocTheme = selectedTheme === 'dark-spec' || selectedTheme === 'warm-editorial';
  const docBgColor = isDarkDocTheme ? '#0b0f19' : 'var(--bg-color, #ffffff)';
  const docTextColor = isDarkDocTheme ? '#cbd5e1' : 'var(--text-color, #1a1a1a)';
  const docBorderColor = isDarkDocTheme ? '#1e293b' : 'var(--border-color, #e5e5e5)';

  if (isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[450px] sm:min-h-[600px] mb-10 mt-14 sm:mt-16">
        {/* Editor Panel Left */}
        <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4.5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Live Editor</span>
            <span className="font-mono text-[10px] truncate max-w-[150px] xs:max-w-[200px]">{filename}</span>
          </div>
          <textarea
            value={rawMarkdown}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Type or paste Markdown here..."
            className="flex-1 min-h-[320px] sm:min-h-[500px] w-full p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 font-mono text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed transition-all shadow-inner"
          />
        </div>

        {/* Live Preview Panel Right */}
        <div
          style={{
            backgroundColor: docBgColor,
            color: docTextColor,
            borderColor: docBorderColor
          }}
          className="border rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm transition-colors overflow-auto max-h-[500px] sm:max-h-[650px]"
        >
          <article
            className="markdown-body leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: parseResult.html }}
          />
        </div>
      </div>
    );
  }

  // Full screen preview mode
  return (
    <div
      style={{
        backgroundColor: docBgColor,
        color: docTextColor,
        borderColor: docBorderColor
      }}
      className="w-full max-w-full mx-auto border rounded-3xl mt-16 sm:mt-20 pt-5 pb-12 px-6 sm:px-10 md:px-12 shadow-sm transition-all duration-300 min-h-[450px] sm:min-h-[550px] mb-10"
    >
      <article
        className="markdown-body leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: parseResult.html }}
      />
    </div>
  );
}

// Attach zoom and pan controllers dynamically to mermaid viewers
function setupMermaidViewers() {
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  document.querySelectorAll('[data-doc-mermaid-viewer]').forEach((viewerEl) => {
    const viewer = viewerEl as HTMLElement;
    if (viewer.dataset.mermaidViewerReady === 'true') return;

    const canvas = viewer.querySelector('.doc-mermaid-canvas') as HTMLElement;
    const diagram = viewer.querySelector('.doc-mermaid') as HTMLElement;

    if (!canvas || !diagram || !diagram.querySelector('svg')) return;

    viewer.dataset.mermaidViewerReady = 'true';

    let scale = 1;
    let x = 0;
    let y = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const zoomTextEl = viewer.querySelector('[data-mermaid-zoom-indicator]') as HTMLElement;

    const applyTransform = () => {
      diagram.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      const zoomPct = `${Math.round(scale * 100)}%`;
      viewer.dataset.zoom = zoomPct;
      if (zoomTextEl) zoomTextEl.textContent = zoomPct;
    };

    const reset = () => {
      scale = 1;
      x = 0;
      y = 0;
      applyTransform();
    };

    const zoom = (delta: number, originX = canvas.clientWidth / 2, originY = canvas.clientHeight / 2) => {
      const prevScale = scale;
      scale = clamp(scale + delta, 0.4, 4);
      const ratio = scale / prevScale;
      x = originX - (originX - x) * ratio;
      y = originY - (originY - y) * ratio;
      applyTransform();
    };

    viewer.addEventListener('click', (event) => {
      const target = event.target as Element;
      const button = target ? target.closest('[data-mermaid-action]') as HTMLButtonElement : null;
      if (!button) return;

      const action = button.dataset.mermaidAction;
      if (action === 'zoom-in') zoom(0.15);
      if (action === 'zoom-out') zoom(-0.15);
      if (action === 'reset') reset();
      if (action === 'copy') {
        const diagramCode = diagram.textContent || diagram.innerText || '';
        navigator.clipboard.writeText(diagramCode).then(() => {
          const origHtml = button.innerHTML;
          button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => { button.innerHTML = origHtml; }, 2000);
        });
      }
      if (action === 'fullscreen') {
        if (document.fullscreenElement === viewer) {
          document.exitFullscreen().catch(() => { });
        } else {
          viewer.requestFullscreen().catch(() => { });
        }
      }
    });

    canvas.addEventListener('wheel', (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      zoom(event.deltaY < 0 ? 0.12 : -0.12, event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener('pointerdown', (event: PointerEvent) => {
      isDragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener('pointermove', (event: PointerEvent) => {
      if (!isDragging) return;
      x += event.clientX - lastX;
      y += event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      applyTransform();
    });

    const stopDragging = (event: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try { canvas.releasePointerCapture(event.pointerId); } catch (_) { }
      }
    };

    canvas.addEventListener('pointerup', stopDragging);
    canvas.addEventListener('pointercancel', stopDragging);

    applyTransform();
  });
}

function setupCodeBlockCopyButtons() {
  document.querySelectorAll('.markdown-body pre').forEach((preEl) => {
    const pre = preEl as HTMLElement;
    if (pre.querySelector('.copy-btn')) return;
    if (pre.classList.contains('mermaid') || pre.closest('.doc-mermaid-viewer')) return;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Copy code snippet');
    btn.innerText = 'Copy';
    btn.onclick = (e) => {
      e.stopPropagation();
      const code = pre.querySelector('code') || pre;
      const textToCopy = code.innerText || code.textContent || '';
      navigator.clipboard.writeText(textToCopy).then(() => {
        btn.innerText = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerText = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    };
    pre.appendChild(btn);
  });
}
