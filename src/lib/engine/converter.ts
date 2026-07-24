'use client';

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/tokyo-night-dark.css';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface ParseResult {
  html: string;
  toc: TocItem[];
  title: string;
  wordCount: number;
  readTimeMinutes: number;
  isMdx: boolean;
  error?: string;
}

// Configure Marked with highlight.js syntax highlighting
marked.setOptions({
  gfm: true,
  breaks: true,
});

export async function convertMarkdown(content: string, isHtml: boolean = false): Promise<ParseResult> {
  const isMdx = !isHtml && (/<[A-Z][a-zA-Z0-9]*[\s/>]/.test(content) || content.includes('import ') || content.includes('export '));

  let rawHtml = '';
  let errorMsg: string | undefined = undefined;

  try {
    if (isHtml) {
      // Direct raw HTML - sanitize safely preserving custom layout containers
      rawHtml = DOMPurify.sanitize(content, {
        ADD_TAGS: ['Callout', 'Badge', 'TabGroup', 'Card', 'Accordion'],
        ADD_ATTR: ['type', 'title', 'variant', 'labels', 'icon'],
      });
    } else {
      // Process standard Markdown & HTML tags safely
      const parsed = marked.parse(content);
      const htmlString = typeof parsed === 'string' ? parsed : await parsed;

      // Sanitize output while preserving callout and custom element attributes
      rawHtml = DOMPurify.sanitize(htmlString, {
        ADD_TAGS: ['Callout', 'Badge', 'TabGroup', 'Card', 'Accordion'],
        ADD_ATTR: ['type', 'title', 'variant', 'labels', 'icon'],
      });

      // Transform custom tags into rendered HTML components if present in static string
      rawHtml = transformStaticCustomComponents(rawHtml);
      // Transform mermaid code blocks to pan-zoom wrappers
      rawHtml = transformMermaidBlocks(rawHtml);
      // Wrap tables in responsive container for horizontal scroll capabilities
      rawHtml = rawHtml.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match) => {
        return `<div class="table-container">${match}</div>`;
      });
    }
  } catch (err: any) {
    console.error('Markdown Parsing Error:', err);
    errorMsg = err.message || 'Failed to parse Markdown content';
    rawHtml = `<div class="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
      <h4 class="font-bold mb-1">Parsing Error</h4>
      <p class="text-sm font-mono">${escapeHtml(errorMsg || '')}</p>
    </div>`;
  }

  // Highlight syntax in <pre><code> blocks using highlight.js
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;

    tempDiv.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });

    rawHtml = tempDiv.innerHTML;
  }

  // Extract Table of Contents
  const toc: TocItem[] = [];
  const headingRegex = /<h([1-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-3]>/gi;
  const simpleHeadingRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;

  let match;
  let idx = 0;
  // Inject IDs into headings if missing & build TOC
  rawHtml = rawHtml.replace(simpleHeadingRegex, (fullMatch, levelStr, textContent) => {
    idx++;
    const level = parseInt(levelStr, 10);
    const cleanText = textContent.replace(/<[^>]+>/g, '').trim();
    const slug = `heading-${idx}-${cleanText.toLowerCase().replace(/[^\w]+/g, '-')}`;

    toc.push({
      id: slug,
      text: cleanText,
      level,
    });

    return `<h${level} id="${slug}">${textContent}</h${level}>`;
  });

  // Calculate Document Stats
  const plainText = content.replace(/[#*`_~[\]()]/g, '');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

  // Extract primary title
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Document';

  return {
    html: rawHtml,
    toc,
    title,
    wordCount: words,
    readTimeMinutes,
    isMdx,
    error: errorMsg,
  };
}

function transformStaticCustomComponents(html: string): string {
  // Convert <Callout type="..." title="...">content</Callout> to styled HTML
  let output = html.replace(/<Callout([^>]*)>([\s\S]*?)<\/Callout>/gi, (match, attrs, inner) => {
    const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
    const titleMatch = attrs.match(/title=["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1] : 'info';
    const title = titleMatch ? titleMatch[1] : '';

    const colors: Record<string, string> = {
      info: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
      warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      danger: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    };

    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      danger: '🚨',
    };

    return `<div class="callout-component callout-${type} my-4 p-4 rounded-xl border backdrop-blur-md ${colors[type] || colors.info}">
      <div class="flex gap-3 items-start">
        <span class="text-lg">${icons[type] || 'ℹ️'}</span>
        <div>
          ${title ? `<h5 class="font-semibold text-base mb-1 text-white">${title}</h5>` : ''}
          <div class="text-sm leading-relaxed">${inner}</div>
        </div>
      </div>
    </div>`;
  });

  // Convert <Badge variant="...">content</Badge>
  output = output.replace(/<Badge([^>]*)>([\s\S]*?)<\/Badge>/gi, (match, attrs, inner) => {
    const varMatch = attrs.match(/variant=["']([^"']+)["']/i);
    const variant = varMatch ? varMatch[1] : 'primary';

    const badges: Record<string, string> = {
      primary: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    };

    return `<span class="badge-component badge-${variant} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[variant] || badges.primary} mx-0.5 align-middle">${inner}</span>`;
  });

  return output;
}

function transformMermaidBlocks(html: string): string {
  // Find all <pre><code class="language-mermaid">...</code></pre> patterns
  const regex = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi;
  return html.replace(regex, (match, code) => {
    // Decode HTML entities safely
    const decodedCode = code
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');

    return `<figure class="doc-mermaid-viewer" data-doc-mermaid-viewer data-zoom="100%">
      <div class="doc-mermaid-toolbar" aria-label="Diagram controls">
        <span>Diagram</span>
        <div class="doc-mermaid-actions">
          <button type="button" data-mermaid-action="copy" data-tooltip="Copy" aria-label="Copy Diagram Code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button type="button" data-mermaid-action="zoom-out" data-tooltip="Zoom Out" aria-label="Zoom out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
          <button type="button" data-mermaid-action="zoom-in" data-tooltip="Zoom In" aria-label="Zoom in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
          <button type="button" data-mermaid-action="reset" data-tooltip="Reset" aria-label="Reset zoom">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          </button>
          <button type="button" data-mermaid-action="fullscreen" data-tooltip="Fullscreen" aria-label="Toggle fullscreen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          </button>
        </div>
      </div>
      <div class="doc-mermaid-canvas" role="group" aria-label="Interactive Mermaid diagram" tabindex="0">
        <div class="doc-mermaid mermaid">${decodedCode}</div>
      </div>
      <div class="doc-mermaid-footer">
        <span class="doc-mermaid-zoom-text" data-mermaid-zoom-indicator>100%</span>
      </div>
    </figure>`;
  });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
