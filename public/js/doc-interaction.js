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
 
    // Update active state in dropdown options
    document.querySelectorAll('.layout-option-btn').forEach(function(btn) {
      if (btn.getAttribute('data-theme-val') === nextTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
 
    // Update linked CSS path
    var link = document.querySelector('link[href*="/themes/pages/"]');
    if (link) {
      var href = link.getAttribute('href');
      var basePart = href.split('/themes/pages/')[0];
      link.setAttribute('href', basePart + '/themes/pages/' + nextTheme + '.css');
    }
  }
 
  // Set initial active state based on current theme value
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

  // Setup Zoom & Pan for Mermaid Diagrams
  function setupMermaidZoomPan() {
    document.querySelectorAll('.mermaid-pan-zoom-container').forEach(function(container) {
      var wrapper = container.querySelector('.mermaid-zoom-wrapper');
      if (!wrapper) return;

      var scale = 1;
      var translateX = 0;
      var translateY = 0;
      var isDragging = false;
      var startX = 0;
      var startY = 0;

      function updateTransform() {
        wrapper.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ')';
      }

      var zoomInBtn = container.querySelector('.zoom-in-btn');
      var zoomOutBtn = container.querySelector('.zoom-out-btn');
      var resetBtn = container.querySelector('.zoom-reset-btn');

      if (zoomInBtn) {
        zoomInBtn.onclick = function(e) {
          e.stopPropagation();
          scale = Math.min(scale + 0.15, 3);
          updateTransform();
        };
      }

      if (zoomOutBtn) {
        zoomOutBtn.onclick = function(e) {
          e.stopPropagation();
          scale = Math.max(scale - 0.15, 0.4);
          updateTransform();
        };
      }

      if (resetBtn) {
        resetBtn.onclick = function(e) {
          e.stopPropagation();
          scale = 1;
          translateX = 0;
          translateY = 0;
          updateTransform();
        };
      }

      var fullscreenBtn = container.querySelector('.zoom-fullscreen-btn');
      if (fullscreenBtn) {
        fullscreenBtn.onclick = function(e) {
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

      container.addEventListener('wheel', function(e) {
        e.preventDefault();
        var zoomFactor = 0.08;
        if (e.deltaY < 0) {
          scale = Math.min(scale + zoomFactor, 3);
        } else {
          scale = Math.max(scale - zoomFactor, 0.4);
        }
        updateTransform();
      }, { passive: false });

      container.addEventListener('mousedown', function(e) {
        if (e.target.closest('.absolute')) return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        container.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
      });

      window.addEventListener('mouseup', function() {
        if (isDragging) {
          isDragging = false;
          container.style.cursor = 'grab';
        }
      });
    });
  }

  // Load and Run Mermaid dynamically from CDN inside exported HTML file
  if (document.querySelector('.mermaid')) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
    script.onload = function() {
      window.mermaid.initialize({ startOnLoad: false, theme: 'default' });
      window.mermaid.run({ querySelector: '.mermaid' }).then(function() {
        setupMermaidZoomPan();
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
