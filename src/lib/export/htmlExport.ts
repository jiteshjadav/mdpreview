export interface ExportOptions {
  title?: string;
  theme?: 'split-book' | 'dashboard-deck' | 'stepped-progress' | 'dark-spec' | 'warm-editorial' | 'sapphire-spec' | 'enterprise-blue' | 'clean-html';
  includeToc?: boolean;
  files?: { id: string; name: string }[];
  activeFileName?: string;
}

// Grid-capable themes have a two-column doc-wrapper with a collapsible TOC sidebar.
// All other themes use a single-column layout (no sidebar).
// When adding a new grid-capable theme, add its ID here AND to GRID_THEMES in doc-interaction.js.
const GRID_THEMES = new Set(['split-book', 'dashboard-deck', 'stepped-progress', 'dark-spec', 'warm-editorial', 'sapphire-spec', 'enterprise-blue']);

export function generateStandaloneHtml(htmlContent: string, options: ExportOptions = {}): string {
  const title = options.title || 'Exported Documentation';
  const theme = options.theme || 'sapphire-spec';
  const files = options.files || [];
  const activeFileName = options.activeFileName || '';
  const layout = GRID_THEMES.has(theme) ? 'grid' : 'column';

  let baseUrl = 'https://mdpreview.io'; // default production domain fallback
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file://')) {
    baseUrl = window.location.origin;
  }

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}" data-layout="${layout}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="MD/MDX Instant Converter">
  <title>${escapeXml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- doc-framework.css: shared layout tokens, header, sidebar, TOC, buttons — same across all themes -->
  <link rel="stylesheet" href="${baseUrl}/themes/pages/shared/doc-framework.css">
  <!-- theme CSS: content typography, body bg, doc-wrapper layout only -->
  <link rel="stylesheet" href="${baseUrl}/themes/pages/${theme}.css" data-role="theme-css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tokyo-night-dark.min.css">
</head>
<body class="theme-body">
  <header class="doc-header">
    <div class="header-container">
      <div class="brand">
        <button id="tocToggleBtn" class="btn-toc-toggle" title="Toggle Table of Contents">
          <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          Menu
        </button>

        ${files.length > 1 ? `
        <!-- Clickable filename chip — opens workspace files dropdown -->
        <div class="files-dropdown-container" style="position: relative;">
          <button id="titleFilesBtn" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 8px; border-radius: 20px; border: 1px solid #e2e8f0; background: transparent; cursor: pointer; font-family: Inter, system-ui, sans-serif; transition: background 0.15s, border-color 0.15s; max-width: 420px;" title="Switch document">
            <svg style="width: 13px; height: 13px; flex-shrink: 0; color: #94a3b8;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; flex-shrink: 0;">Viewing (${files.length})</span>
            <span id="titleText" style="font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px;">${escapeXml(title)}</span>
            <span style="font-size: 10px; color: #94a3b8; flex-shrink: 0; font-weight: 700;">▾</span>
          </button>
          <div id="filesDropdownMenu" class="dropdown-menu" style="display: none; position: absolute; left: 0; top: 100%; margin-top: 8px; width: 280px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 24px -4px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.06); padding: 6px; z-index: 1000;">
            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 6px 10px; border-bottom: 1px solid #f1f5f9; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 4px; font-family: Inter, system-ui, sans-serif;">
              Workspace Files
            </div>
            <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 1px;">
              ${files.map(f => {
                const isCurrent = f.name === activeFileName;
                const fileHtmlName = f.name.replace(/\.(mdx|md|txt)$/i, '') + '.html';
                return `<a href="${isCurrent ? '#' : fileHtmlName}" class="file-link-item" style="text-decoration: none; padding: 8px 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 1px; background: ${isCurrent ? '#eff6ff' : 'transparent'}; pointer-events: ${isCurrent ? 'none' : 'auto'};">
                  <span style="font-size: 12px; font-weight: 600; color: ${isCurrent ? '#1d4ed8' : '#0f172a'}; font-family: Inter, system-ui, sans-serif;">${escapeXml(f.name.replace(/\.(mdx|md|txt)$/i, ''))}</span>
                  <span style="font-size: 10px; color: #94a3b8; font-family: Inter, system-ui, sans-serif; font-weight: 400;">${escapeXml(f.name)}</span>
                </a>`;
              }).join('')}
            </div>
          </div>
        </div>
        ` : ``}
      </div>
      <div class="header-actions">
        <div class="dropdown-layout-container" style="position: relative; display: inline-block;">
          <button id="layoutToggleBtn" class="btn-action" title="Change Presentation Style" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg style="width: 14px; height: 14px; flex-shrink: 0; color: #475569;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span>Style</span>
          </button>
          <div id="layoutDropdownMenu" class="dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; width: 220px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 24px -4px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.06); padding: 6px; z-index: 1000;">
            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 6px 10px; border-bottom: 1px solid #f1f5f9; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 4px; font-family: Inter, system-ui, sans-serif;">
              Presentation Style
            </div>
            <div style="display: flex; flex-direction: column; gap: 1px;">
              <button class="layout-option-btn" data-theme-val="sapphire-spec" style="border: none; background: none; padding: 8px 10px; border-radius: 8px; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; width: 100%; cursor: pointer; font-family: Inter, system-ui, sans-serif; text-align: left;">
                <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Sapphire Spec</span>
                <span style="font-size: 10px; color: #94a3b8; font-weight: 400;">Executive corporate sapphire layout</span>
              </button>
              <button class="layout-option-btn" data-theme-val="split-book" style="border: none; background: none; padding: 8px 10px; border-radius: 8px; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; width: 100%; cursor: pointer; font-family: Inter, system-ui, sans-serif; text-align: left;">
                <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Split Book</span>
                <span style="font-size: 10px; color: #94a3b8; font-weight: 400;">Minimal two-column layout</span>
              </button>
              <button class="layout-option-btn" data-theme-val="dashboard-deck" style="border: none; background: none; padding: 8px 10px; border-radius: 8px; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; width: 100%; cursor: pointer; font-family: Inter, system-ui, sans-serif; text-align: left;">
                <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Dashboard Deck</span>
                <span style="font-size: 10px; color: #94a3b8; font-weight: 400;">Modular floating cards</span>
              </button>
              <button class="layout-option-btn" data-theme-val="stepped-progress" style="border: none; background: none; padding: 8px 10px; border-radius: 8px; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; width: 100%; cursor: pointer; font-family: Inter, system-ui, sans-serif; text-align: left;">
                <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Stepped Guide</span>
                <span style="font-size: 10px; color: #94a3b8; font-weight: 400;">Timeline axis with numbered steps</span>
              </button>
              <button class="layout-option-btn" data-theme-val="dark-spec" style="border: none; background: none; padding: 8px 10px; border-radius: 8px; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; width: 100%; cursor: pointer; font-family: Inter, system-ui, sans-serif; text-align: left;">
                <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Dark Spec</span>
                <span style="font-size: 10px; color: #94a3b8; font-weight: 400;">Sleek dark mode layout</span>
              </button>
              <button class="layout-option-btn" data-theme-val="clean-html" style="border: none; background: none; padding: 8px 10px; border-radius: 8px; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; width: 100%; cursor: pointer; font-family: Inter, system-ui, sans-serif; text-align: left;">
                <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Clean HTML</span>
                <span style="font-size: 10px; color: #94a3b8; font-weight: 400;">Simple web document style</span>
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
      <article class="markdown-body leading-relaxed space-y-4" id="renderedDoc">
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
