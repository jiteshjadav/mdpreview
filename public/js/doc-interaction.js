// Client-side interactions inside exported HTML
(function() {
  // Setup Code Block Copy Buttons
  document.querySelectorAll('pre').forEach(function(pre) {
    if (pre.querySelector('.copy-btn')) return;
    if (pre.classList.contains('mermaid')) return; // skip mermaid code source block
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerText = 'Copy';
    btn.onclick = function() {
      var code = pre.querySelector('code');
      if (code) {
        navigator.clipboard.writeText(code.innerText).then(function() {
          btn.innerText = 'Copied!';
          setTimeout(function() { btn.innerText = 'Copy'; }, 2000);
        });
      }
    };
    pre.appendChild(btn);
  });

  // Auto-generate Table of Contents & Setup Collapse Toggle
  var headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3');
  var tocNav = document.getElementById('tocNav');
  var tocSidebar = document.getElementById('tocSidebar');
  var tocToggleBtn = document.getElementById('tocToggleBtn');
  var docWrapper = document.querySelector('.doc-wrapper');

  if (tocToggleBtn && docWrapper) {
    tocToggleBtn.onclick = function() {
      docWrapper.classList.toggle('toc-open');
    };
  }

  if (headings.length > 0 && tocNav) {
    var ul = document.createElement('ul');
    headings.forEach(function(h, idx) {
      if (!h.id) {
        h.id = 'heading-' + idx;
      }
      var li = document.createElement('li');
      li.className = 'toc-item level-' + h.tagName.toLowerCase();
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.innerText = h.innerText;
      li.appendChild(a);
      ul.appendChild(li);
    });
    tocNav.appendChild(ul);
  } else {
    if (tocSidebar) tocSidebar.style.display = 'none';
    if (tocToggleBtn) tocToggleBtn.style.display = 'none';
  }

  // Print Button
  var printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.onclick = function() { window.print(); };
  }

  // Layout toggle dropdown
  var layoutToggleBtn = document.getElementById('layoutToggleBtn');
  var layoutDropdownMenu = document.getElementById('layoutDropdownMenu');
  var htmlEl = document.documentElement;

  // Grid-capable themes: these use a 2-column doc-wrapper with a collapsible TOC sidebar.
  // All other themes get data-layout="column" (no sidebar).
  // To register a new grid-capable theme, add its ID here.
  var GRID_THEMES = ['split-book', 'dashboard-deck', 'stepped-progress', 'dark-spec', 'warm-editorial', 'sapphire-spec', 'enterprise-blue', 'api-docs'];

  function getLayout(themeId) {
    return GRID_THEMES.indexOf(themeId) !== -1 ? 'grid' : 'column';
  }

  if (layoutToggleBtn && layoutDropdownMenu) {
    layoutToggleBtn.onclick = function(e) {
      e.stopPropagation();
      var open = layoutDropdownMenu.style.display === 'block';
      layoutDropdownMenu.style.display = open ? 'none' : 'block';
    };

    window.addEventListener('click', function() {
      layoutDropdownMenu.style.display = 'none';
    });

    layoutDropdownMenu.onclick = function(e) {
      e.stopPropagation();
    };
  }

  function switchLayout(nextTheme) {
    htmlEl.setAttribute('data-theme', nextTheme);

    // Update data-layout so chrome.css grid/column rules apply correctly
    var nextLayout = getLayout(nextTheme);
    htmlEl.setAttribute('data-layout', nextLayout);

    // If switching to a column theme, collapse the sidebar
    if (nextLayout === 'column') {
      var docWrapper = document.querySelector('.doc-wrapper');
      if (docWrapper) docWrapper.classList.remove('toc-open');
    }

    // Update active state in dropdown options
    document.querySelectorAll('.layout-option-btn').forEach(function(btn) {
      if (btn.getAttribute('data-theme-val') === nextTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Swap only the theme-specific CSS link (not doc-framework.css)
    var themeLink = document.querySelector('link[data-role="theme-css"]');
    if (themeLink) {
      var href = themeLink.getAttribute('href');
      var basePart = href.split('/themes/pages/')[0];
      themeLink.setAttribute('href', basePart + '/themes/pages/' + nextTheme + '.css');
    }
  }

  // Set initial active state based on current data-theme on <html>
  var initialTheme = htmlEl.getAttribute('data-theme') || 'split-book';
  switchLayout(initialTheme);

  document.querySelectorAll('.layout-option-btn').forEach(function(btn) {
    btn.onclick = function() {
      var val = btn.getAttribute('data-theme-val');
      switchLayout(val);
      if (layoutDropdownMenu) {
        layoutDropdownMenu.style.display = 'none';
      }
    };
  });

  // Title chip → workspace files dropdown
  var titleFilesBtn = document.getElementById('titleFilesBtn');
  var filesDropdownMenu = document.getElementById('filesDropdownMenu');

  if (titleFilesBtn && filesDropdownMenu) {
    titleFilesBtn.onclick = function(e) {
      e.stopPropagation();
      var open = filesDropdownMenu.style.display === 'block';
      // Close layout dropdown if open
      if (layoutDropdownMenu) layoutDropdownMenu.style.display = 'none';
      filesDropdownMenu.style.display = open ? 'none' : 'block';
    };

    // Hover effect on title chip
    titleFilesBtn.addEventListener('mouseover', function() {
      titleFilesBtn.style.background = '#f8fafc';
      titleFilesBtn.style.borderColor = '#94a3b8';
    });
    titleFilesBtn.addEventListener('mouseout', function() {
      titleFilesBtn.style.background = 'transparent';
      titleFilesBtn.style.borderColor = '#e2e8f0';
    });

    window.addEventListener('click', function() {
      filesDropdownMenu.style.display = 'none';
    });

    filesDropdownMenu.onclick = function(e) {
      e.stopPropagation();
    };
  }

  // Setup Zoom & Pan for Mermaid Diagrams
  function setupMermaidViewers() {
    var clamp = function(val, min, max) { return Math.min(Math.max(val, min), max); };

    document.querySelectorAll('[data-doc-mermaid-viewer]').forEach(function(viewer) {
      if (viewer.dataset.mermaidViewerReady === 'true') return;

      var canvas = viewer.querySelector('.doc-mermaid-canvas');
      var diagram = viewer.querySelector('.doc-mermaid');

      if (!canvas || !diagram || !diagram.querySelector('svg')) return;

      viewer.dataset.mermaidViewerReady = 'true';

      var scale = 1;
      var x = 0;
      var y = 0;
      var isDragging = false;
      var lastX = 0;
      var lastY = 0;

      var zoomTextEl = viewer.querySelector('[data-mermaid-zoom-indicator]');

      function applyTransform() {
        diagram.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
        var zoomPct = Math.round(scale * 100) + '%';
        viewer.dataset.zoom = zoomPct;
        if (zoomTextEl) zoomTextEl.textContent = zoomPct;
      }

      function reset() {
        scale = 1;
        x = 0;
        y = 0;
        applyTransform();
      }

      function zoom(delta, originX, originY) {
        if (originX === undefined) originX = canvas.clientWidth / 2;
        if (originY === undefined) originY = canvas.clientHeight / 2;
        var prevScale = scale;
        scale = clamp(scale + delta, 0.4, 4);
        var ratio = scale / prevScale;
        x = originX - (originX - x) * ratio;
        y = originY - (originY - y) * ratio;
        applyTransform();
      }

      viewer.addEventListener('click', function(event) {
        var target = event.target;
        var button = target ? target.closest('[data-mermaid-action]') : null;
        if (!button) return;

        var action = button.dataset.mermaidAction;
        if (action === 'zoom-in') zoom(0.15);
        if (action === 'zoom-out') zoom(-0.15);
        if (action === 'reset') reset();
        if (action === 'fullscreen') {
          if (document.fullscreenElement === viewer) {
            if (document.exitFullscreen) document.exitFullscreen();
          } else {
            if (viewer.requestFullscreen) viewer.requestFullscreen();
          }
        }
      });

      canvas.addEventListener('wheel', function(event) {
        event.preventDefault();
        var rect = canvas.getBoundingClientRect();
        zoom(event.deltaY < 0 ? 0.12 : -0.12, event.clientX - rect.left, event.clientY - rect.top);
      }, { passive: false });

      canvas.addEventListener('pointerdown', function(event) {
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
      });

      canvas.addEventListener('pointermove', function(event) {
        if (!isDragging) return;
        x += event.clientX - lastX;
        y += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        applyTransform();
      });

      function stopDragging(event) {
        if (isDragging) {
          isDragging = false;
          if (canvas.releasePointerCapture) {
            try { canvas.releasePointerCapture(event.pointerId); } catch (_) {}
          }
        }
      }

      canvas.addEventListener('pointerup', stopDragging);
      canvas.addEventListener('pointercancel', stopDragging);

      applyTransform();
    });
  }

  // Load and Run Mermaid dynamically from CDN inside exported HTML file
  if (document.querySelector('.doc-mermaid.mermaid')) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
    script.onload = function() {
      window.mermaid.initialize({ startOnLoad: false, theme: 'default' });
      window.mermaid.run({ querySelector: '.doc-mermaid.mermaid' }).then(function() {
        setupMermaidViewers();
      });
    };
    document.head.appendChild(script);
  }
 
  // Setup Files switcher toggle
  var filesToggleBtn = document.getElementById('filesToggleBtn');
  var filesDropdownMenu = document.getElementById('filesDropdownMenu');
  if (filesToggleBtn && filesDropdownMenu) {
    filesToggleBtn.onclick = function(e) {
      e.stopPropagation();
      var open = filesDropdownMenu.style.display === 'block';
      filesDropdownMenu.style.display = open ? 'none' : 'block';
    };
    
    // Click outside to close
    window.addEventListener('click', function() {
      filesDropdownMenu.style.display = 'none';
    });
    
    filesDropdownMenu.onclick = function(e) {
      e.stopPropagation();
    };
  }
})();
