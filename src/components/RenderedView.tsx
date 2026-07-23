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
      let linkEl = document.getElementById('preview-doc-theme-stylesheet') as HTMLLinkElement;
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.id = 'preview-doc-theme-stylesheet';
        linkEl.rel = 'stylesheet';
        document.head.appendChild(linkEl);
      }
      linkEl.href = `/themes/pages/${themeId}.css`;
      document.documentElement.setAttribute('data-theme', themeId);
      const gridCapable = ['split-book', 'dashboard-deck', 'stepped-progress'].includes(themeId);
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
        const unrenderedNodes = Array.from(document.querySelectorAll('.mermaid-zoom-wrapper pre.mermaid')).filter(
          (el) => !el.hasAttribute('data-processed') && el.querySelector('svg') === null
        );

        if (unrenderedNodes.length === 0) {
          setupZoomPan();
          return;
        }

        // Render unrendered mermaid elements safely
        mermaid.run({
          nodes: unrenderedNodes as HTMLElement[],
        }).then(() => {
          setupZoomPan();
        }).catch(() => {
          // Catch errors silently if elements are unmounted or already processed
          setupZoomPan();
        });
      } catch (e) {
        // Safe catch
      }
    }
  }, [parseResult.html, isEditing, selectedTheme]);

  if (isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[450px] sm:min-h-[600px] mb-10">
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
            backgroundColor: 'var(--bg-color, #ffffff)', 
            color: 'var(--text-color, #1a1a1a)',
            borderColor: 'var(--border-color, #e5e5e5)' 
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
        backgroundColor: 'var(--bg-color, #ffffff)', 
        color: 'var(--text-color, #1a1a1a)',
        borderColor: 'var(--border-color, #e5e5e5)' 
      }}
      className="w-full max-w-[1320px] mx-auto border rounded-3xl pt-5 pb-10 px-4 sm:pt-8 sm:pb-16 sm:px-14 shadow-sm transition-all duration-300 min-h-[450px] sm:min-h-[550px] mb-10"
    >
      <article
        className="markdown-body leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: parseResult.html }}
      />
    </div>
  );
}

// Attach zoom and pan controllers dynamically
function setupZoomPan() {
  document.querySelectorAll('.mermaid-pan-zoom-container').forEach((el) => {
    const container = el as HTMLElement;
    const wrapper = container.querySelector('.mermaid-zoom-wrapper') as HTMLDivElement;
    if (!wrapper) return;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const updateTransform = () => {
      wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };

    const zoomInBtn = container.querySelector('.zoom-in-btn') as HTMLButtonElement;
    const zoomOutBtn = container.querySelector('.zoom-out-btn') as HTMLButtonElement;
    const resetBtn = container.querySelector('.zoom-reset-btn') as HTMLButtonElement;

    if (zoomInBtn) {
      zoomInBtn.onclick = (e) => {
        e.stopPropagation();
        scale = Math.min(scale + 0.15, 8);
        updateTransform();
      };
    }

    if (zoomOutBtn) {
      zoomOutBtn.onclick = (e) => {
        e.stopPropagation();
        scale = Math.max(scale - 0.15, 0.4);
        updateTransform();
      };
    }

    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
      };
    }

    const fullscreenBtn = container.querySelector('.zoom-fullscreen-btn') as HTMLButtonElement;
    if (fullscreenBtn) {
      fullscreenBtn.onclick = (e) => {
        e.stopPropagation();
        container.classList.toggle('fullscreen-active');
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
        if (container.classList.contains('fullscreen-active')) {
          fullscreenBtn.title = "Exit Fullscreen";
          fullscreenBtn.innerText = "✕";
        } else {
          fullscreenBtn.title = "Toggle Fullscreen";
          fullscreenBtn.innerText = "⛶";
        }
      };
    }

    // Wheel zooming
    const wheelHandler = (e: any) => {
      e.preventDefault();
      const zoomFactor = 0.08;
      if (e.deltaY < 0) {
        scale = Math.min(scale + zoomFactor, 8);
      } else {
        scale = Math.max(scale - zoomFactor, 0.4);
      }
      updateTransform();
    };

    container.addEventListener('wheel', wheelHandler, { passive: false });

    // Drag panning
    const mouseDownHandler = (e: any) => {
      if (e.target.closest('.absolute')) return;
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      container.style.cursor = 'grabbing';
    };

    const mouseMoveHandler = (e: any) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    };

    const mouseUpHandler = () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'grab';
      }
    };

    container.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  });
}
