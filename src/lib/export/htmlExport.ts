export interface ExportOptions {
  title?: string;
  theme?: 'split-book' | 'dashboard-deck' | 'stepped-progress';
  includeToc?: boolean;
  files?: { id: string; name: string }[];
  activeFileName?: string;
}

export function generateStandaloneHtml(htmlContent: string, options: ExportOptions = {}): string {
  const title = options.title || 'Exported Documentation';
  const theme = options.theme || 'split-book';
  const files = options.files || [];
  const activeFileName = options.activeFileName || '';

  let baseUrl = 'https://mdpreview.io'; // default production domain fallback
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file://')) {
    baseUrl = window.location.origin;
  }

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="MD/MDX Instant Converter">
  <title>${escapeXml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${baseUrl}/themes/pages/${theme}.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tokyo-night-dark.min.css">
  <style>
    /* Standalone Custom Callout & Badge Styles */
    .callout-component {
      margin: 1.5rem 0;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background-color: rgba(0, 0, 0, 0.02);
      display: flex;
      gap: 0.75rem;
      align-items: start;
    }
    .callout-component.callout-info {
      border-color: rgba(37, 99, 235, 0.25);
      background-color: rgba(37, 99, 235, 0.04);
      color: #1e40af;
    }
    [data-theme="dark"] .callout-component.callout-info,
    [data-theme="dashboard-deck"] .callout-component.callout-info,
    [data-theme="stepped-progress"] .callout-component.callout-info {
      border-color: rgba(96, 165, 250, 0.3);
      background-color: rgba(96, 165, 250, 0.1);
      color: #93c5fd;
    }
    
    .callout-component.callout-warning {
      border-color: rgba(217, 119, 6, 0.25);
      background-color: rgba(217, 119, 6, 0.04);
      color: #854d0e;
    }
    [data-theme="dark"] .callout-component.callout-warning,
    [data-theme="dashboard-deck"] .callout-component.callout-warning,
    [data-theme="stepped-progress"] .callout-component.callout-warning {
      border-color: rgba(251, 191, 36, 0.3);
      background-color: rgba(251, 191, 36, 0.1);
      color: #fde047;
    }

    .callout-component.callout-success {
      border-color: rgba(22, 163, 74, 0.25);
      background-color: rgba(22, 163, 74, 0.04);
      color: #166534;
    }
    [data-theme="dark"] .callout-component.callout-success,
    [data-theme="dashboard-deck"] .callout-component.callout-success,
    [data-theme="stepped-progress"] .callout-component.callout-success {
      border-color: rgba(52, 211, 153, 0.3);
      background-color: rgba(52, 211, 153, 0.1);
      color: #a7f3d0;
    }

    .callout-component.callout-danger {
      border-color: rgba(220, 38, 38, 0.25);
      background-color: rgba(220, 38, 38, 0.04);
      color: #991b1b;
    }
    [data-theme="dark"] .callout-component.callout-danger,
    [data-theme="dashboard-deck"] .callout-component.callout-danger,
    [data-theme="stepped-progress"] .callout-component.callout-danger {
      border-color: rgba(248, 113, 113, 0.3);
      background-color: rgba(248, 113, 113, 0.1);
      color: #fca5a5;
    }
    
    .callout-component h5 {
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: inherit;
    }
    
    .badge-component {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid var(--border-color);
      background-color: rgba(0, 0, 0, 0.04);
      margin: 0 0.125rem;
      vertical-align: middle;
    }
    .badge-component.badge-primary {
      background-color: rgba(79, 70, 229, 0.08);
      color: #4f46e5;
      border-color: rgba(79, 70, 229, 0.2);
    }
    [data-theme="dark"] .badge-component.badge-primary,
    [data-theme="dashboard-deck"] .badge-component.badge-primary,
    [data-theme="stepped-progress"] .badge-component.badge-primary {
      background-color: rgba(129, 140, 248, 0.15);
      color: #c7d2fe;
      border-color: rgba(129, 140, 248, 0.3);
    }

    .badge-component.badge-success {
      background-color: rgba(22, 163, 74, 0.08);
      color: #16a34a;
      border-color: rgba(22, 163, 74, 0.2);
    }
    [data-theme="dark"] .badge-component.badge-success,
    [data-theme="dashboard-deck"] .badge-component.badge-success,
    [data-theme="stepped-progress"] .badge-component.badge-success {
      background-color: rgba(52, 211, 153, 0.15);
      color: #a7f3d0;
      border-color: rgba(52, 211, 153, 0.3);
    }

    .badge-component.badge-warning {
      background-color: rgba(217, 119, 6, 0.08);
      color: #d97706;
      border-color: rgba(217, 119, 6, 0.2);
    }
    [data-theme="dark"] .badge-component.badge-warning,
    [data-theme="dashboard-deck"] .badge-component.badge-warning,
    [data-theme="stepped-progress"] .badge-component.badge-warning {
      background-color: rgba(251, 191, 36, 0.15);
      color: #fde047;
      border-color: rgba(251, 191, 36, 0.3);
    }

    .badge-component.badge-danger {
      background-color: rgba(220, 38, 38, 0.08);
      color: #dc2626;
      border-color: rgba(220, 38, 38, 0.2);
    }
    [data-theme="dark"] .badge-component.badge-danger,
    [data-theme="dashboard-deck"] .badge-component.badge-danger,
    [data-theme="stepped-progress"] .badge-component.badge-danger {
      background-color: rgba(248, 113, 113, 0.15);
      color: #fca5a5;
      border-color: rgba(248, 113, 113, 0.3);
    }
 
    /* Collapsible Table of Contents Sidebar Override (Collapsed by default) */
    .doc-wrapper {
      grid-template-columns: 0px 1fr !important;
      transition: grid-template-columns 0.25s ease-in-out !important;
    }
    .doc-wrapper.toc-open {
      grid-template-columns: 280px 1fr !important;
    }
    .toc-sidebar {
      width: 0 !important;
      padding: 0 !important;
      border-right: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      overflow: hidden !important;
      transition: all 0.25s ease-in-out !important;
    }
    .doc-wrapper.toc-open .toc-sidebar {
      width: 280px !important;
      padding: 2.5rem 1.5rem !important;
      border-right: 1px solid var(--border-color) !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    /* Menu Toggle Button Styling */
    .btn-toc-toggle {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-color);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.5rem;
      transition: all 0.15s;
      gap: 0.4rem;
    }
    .btn-toc-toggle:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    [data-theme="dark"] .btn-toc-toggle:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-icon {
      width: 14px;
      height: 14px;
      stroke-width: 2.2;
      flex-shrink: 0;
    }
    .file-link-item {
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .file-link-item:hover {
      background-color: rgba(0, 0, 0, 0.04) !important;
      color: var(--primary) !important;
    }
    [data-theme="dark"] .file-link-item:hover,
    [data-theme="dashboard-deck"] .file-link-item:hover,
    [data-theme="stepped-progress"] .file-link-item:hover {
      background-color: rgba(255, 255, 255, 0.04) !important;
      color: var(--primary) !important;
    }
    .layout-option-btn {
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .layout-option-btn:hover {
      background-color: rgba(0, 0, 0, 0.04) !important;
      color: var(--primary) !important;
    }
    [data-theme="dark"] .layout-option-btn:hover,
    [data-theme="dashboard-deck"] .layout-option-btn:hover,
    [data-theme="stepped-progress"] .layout-option-btn:hover {
      background-color: rgba(255, 255, 255, 0.04) !important;
      color: var(--primary) !important;
    }
    .layout-option-btn.active {
      background-color: rgba(79, 70, 229, 0.08) !important;
      color: var(--primary) !important;
      font-weight: 600 !important;
    }
  </style>
</head>
<body class="theme-body">
  <header class="doc-header">
    <div class="header-container">
      <div class="brand">
        <button id="tocToggleBtn" class="btn-toc-toggle" title="Toggle Table of Contents">
          <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          Menu
        </button>
        <span class="logo-icon" style="display: inline-flex; align-items: center;">
          <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; margin-top: 2px;"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
        </span>
        <h1 class="doc-title">${escapeXml(title)}</h1>
      </div>
      <div class="header-actions">
        ${files.length > 1 ? `
        <div class="dropdown-files-container" style="position: relative; display: inline-block;">
          <button id="filesToggleBtn" class="btn-action" title="Toggle Workspace Files">
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            <span>Files (${files.length})</span>
          </button>
          <div id="filesDropdownMenu" class="dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; width: 240px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); padding: 6px; z-index: 1000;">
            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 6px 10px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 4px;">
              Workspace Documents
            </div>
            <div style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px;">
              ${files.map(f => {
                const isCurrent = f.name === activeFileName;
                const fileHtmlName = f.name.replace(/\.(mdx|md|txt)$/i, '') + '.html';
                return `<a href="${isCurrent ? '#' : fileHtmlName}" class="file-link-item ${isCurrent ? 'active' : ''}" style="text-decoration: none; font-size: 11px; padding: 7px 9px; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: ${isCurrent ? 'var(--primary)' : 'var(--text-color)'}; font-weight: ${isCurrent ? '600' : '500'}; background-color: ${isCurrent ? 'rgba(79, 70, 229, 0.05)' : 'transparent'};">
                  📄 ${escapeXml(f.name)}
                </a>`;
              }).join('')}
            </div>
          </div>
        </div>
        ` : ''}
        <div class="dropdown-layout-container" style="position: relative; display: inline-block;">
          <button id="layoutToggleBtn" class="btn-action" title="Toggle Presentation Style">
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span>Layout</span>
          </button>
          <div id="layoutDropdownMenu" class="dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; width: 180px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); padding: 6px; z-index: 1000;">
            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 6px 10px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 4px;">
              Document Layout
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <button class="layout-option-btn" data-theme-val="split-book" style="border: none; background: none; font-size: 11px; padding: 7px 9px; border-radius: 6px; display: flex; align-items: center; gap: 8px; color: var(--text-color); font-weight: 500; text-align: left; width: 100%; cursor: pointer;">
                📖 Split Book
              </button>
              <button class="layout-option-btn" data-theme-val="dashboard-deck" style="border: none; background: none; font-size: 11px; padding: 7px 9px; border-radius: 6px; display: flex; align-items: center; gap: 8px; color: var(--text-color); font-weight: 500; text-align: left; width: 100%; cursor: pointer;">
                📋 Dashboard Deck
              </button>
              <button class="layout-option-btn" data-theme-val="stepped-progress" style="border: none; background: none; font-size: 11px; padding: 7px 9px; border-radius: 6px; display: flex; align-items: center; gap: 8px; color: var(--text-color); font-weight: 500; text-align: left; width: 100%; cursor: pointer;">
                🚶 Stepped Guide
              </button>
            </div>
          </div>
        </div>
        <button id="printBtn" class="btn-action" title="Print / Save PDF">
          <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
          Print / PDF
        </button>
      </div>
    </div>
  </header>

  <div class="doc-wrapper">
    <aside id="tocSidebar" class="toc-sidebar">
      <div class="toc-header">Table of Contents</div>
      <nav id="tocNav" class="toc-nav"></nav>
    </aside>

    <main class="main-content">
      <article class="markdown-body" id="renderedDoc">
        ${htmlContent}
      </article>
      <footer class="doc-footer">
        Generated with <a href="https://github.com/northbithq/mdpreview" target="_blank" rel="noopener">MD Preview</a> • Developed by <a href="https://northbit.ca/" target="_blank" rel="noopener">Northbit</a>
      </footer>
    </main>
  </div>

  <script src="${baseUrl}/js/doc-interaction.js"></script>
</body>
</html>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
