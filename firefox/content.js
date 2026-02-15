(function() {
  'use strict';


  let filterKeywords = [];
  let processedElements = new WeakSet();

  // --- Diagnostic logging ---
  // Stores structured entries so the popup can retrieve them for debugging.
  const diagLog = [];
  const MAX_LOG = 500;

  function diag(type, data) {
    if (diagLog.length >= MAX_LOG) diagLog.shift();
    diagLog.push({ type, time: Date.now(), ...data });
  }

  // Build a short description of an element for the log
  function describeEl(el) {
    if (!el) return '(null)';
    const tag = el.tagName ? el.tagName.toLowerCase() : '?';
    const id = el.id ? '#' + el.id : '';
    const cls = (el.className || '').toString().trim();
    const clsShort = cls ? '.' + cls.split(/\s+/).slice(0, 2).join('.') : '';
    const text = (el.textContent || '').trim().substring(0, 80);
    return `<${tag}${id}${clsShort}> "${text}"`;
  }

  // Run a full diagnostic scan (called via message from popup)
  function runDiagnostic() {
    const report = [];
    report.push('=== ATfilter — Diagnostic Report ===');
    report.push(`URL: ${window.location.href}`);
    report.push(`Time: ${new Date().toISOString()}`);
    report.push(`Keywords: ${JSON.stringify(filterKeywords)}`);
    report.push('');

    // 1. Show every headline element found
    const allHeadlines = document.querySelectorAll(HEADLINE_SELECTORS.join(', '));
    report.push(`--- HEADLINES FOUND: ${allHeadlines.length} ---`);

    let matchCount = 0;
    allHeadlines.forEach((el, i) => {
      const text = getElementText(el);
      const matched = filterKeywords.some(kw => {
        const pat = new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'i');
        return pat.test(text);
      });
      if (matched) {
        matchCount++;
        const tag = el.tagName ? el.tagName.toLowerCase() : '?';
        const cls = (el.className || '').toString().trim();
        report.push(`  [MATCH #${matchCount}] <${tag} class="${cls}"> text="${text.substring(0, 100)}"`);

        // Show container detection path
        const tier1 = el.closest(TIER1_SELECTOR);
        const tier2 = el.closest(TIER2_SELECTOR);
        report.push(`    Tier1 closest: ${tier1 ? describeEl(tier1) : '(none)'} protected=${tier1 ? isProtected(tier1) : 'n/a'}`);
        report.push(`    Tier2 closest: ${tier2 ? describeEl(tier2) : '(none)'} protected=${tier2 ? isProtected(tier2) : 'n/a'}`);

        // Show what findContentUnit would pick
        const unit = findContentUnit(el);
        report.push(`    Chosen unit: ${describeEl(unit)} protected=${isProtected(unit)}`);
        report.push(`    Unit has media: ${unit ? !!unit.querySelector('img, video, picture') : false}`);
        report.push('');
      }
    });

    report.push(`--- SUMMARY: ${allHeadlines.length} headlines scanned, ${matchCount} keyword matches ---`);
    report.push('');

    // 2. Sample of unmatched headlines that contain common news patterns
    // (helps spot selector gaps)
    report.push('--- SAMPLE UNMATCHED HEADLINES (first 30) ---');
    let sampleCount = 0;
    allHeadlines.forEach(el => {
      if (sampleCount >= 30) return;
      const text = getElementText(el);
      const matched = filterKeywords.some(kw => new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'i').test(text));
      if (!matched && text.length > 10) {
        const tag = el.tagName ? el.tagName.toLowerCase() : '?';
        const cls = (el.className || '').toString().trim().substring(0, 60);
        report.push(`  <${tag} class="${cls}"> "${text.substring(0, 80)}"`);
        sampleCount++;
      }
    });
    report.push('');

    // 3. Scan ALL visible text for keyword occurrences that we MISSED
    // (headlines containing keyword that aren't in our selector results)
    report.push('--- MISSED KEYWORDS (visible text with keyword NOT in our headline set) ---');
    const allElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, a, span, p, div, figcaption, [role="heading"]');
    const headlineSet = new Set(allHeadlines);
    let missedCount = 0;
    allElements.forEach(el => {
      if (missedCount >= 20) return;
      if (headlineSet.has(el)) return;
      // Only check direct text, not children's text
      const directText = Array.from(el.childNodes)
        .filter(n => n.nodeType === 3)
        .map(n => n.textContent)
        .join(' ').trim().toLowerCase();
      const fullText = getElementText(el);

      if (directText.length > 5 || fullText.length > 5) {
        const textToCheck = fullText;
        const hasKw = filterKeywords.some(kw => new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'i').test(textToCheck));
        if (hasKw) {
          const tag = el.tagName ? el.tagName.toLowerCase() : '?';
          const cls = (el.className || '').toString().trim().substring(0, 60);
          const parent = el.parentElement;
          const parentDesc = parent ? `<${parent.tagName.toLowerCase()} class="${(parent.className||'').toString().trim().substring(0,40)}">` : '';
          report.push(`  <${tag} class="${cls}"> in ${parentDesc}`);
          report.push(`    text="${textToCheck.substring(0, 100)}"`);
          report.push(`    visible=${el.offsetParent !== null || el.style.display !== 'none'}`);
          missedCount++;
        }
      }
    });
    if (missedCount === 0) report.push('  (none found)');
    report.push('');

    // 4. Show recent filter activity log
    report.push(`--- ACTIVITY LOG (last ${Math.min(diagLog.length, 50)} entries) ---`);
    diagLog.slice(-50).forEach(entry => {
      report.push(`  [${entry.type}] ${JSON.stringify(entry)}`);
    });

    return report.join('\n');
  }

  // --- Headline selectors ---
  const HEADLINE_SELECTORS = [
    // Standard heading elements
    'h2', 'h3', 'h4', 'h5',
    'h2 a', 'h3 a', 'h4 a',

    // Class-based headlines
    '[class*="headline"]',
    '[class*="Headline"]',
    '[class*="title"]:not([class*="site-title"]):not([class*="page-title"]):not([class*="nav-title"])',
    '[class*="Title"]:not([class*="SiteTitle"]):not([class*="PageTitle"])',

    // ARIA / role-based
    '[role="heading"]',

    // Links acting as headlines
    'a[class*="headline"]',
    'a[class*="Headline"]',
    'a[class*="story"]',
    'a[class*="Story"]',
    'a[class*="title"]',
    'a[class*="Title"]',

    // React / testing-library / data-attribute patterns
    '[data-testid*="title"]',
    '[data-testid*="headline"]',
    '[data-editable="headlineText"]',

    // YouTube (universal)
    '#video-title',
    'yt-formatted-string#video-title',

    // Video-specific headline patterns (CNN video cards, etc.)
    '[class*="video"] [class*="title"]',
    '[class*="video"] [class*="headline"]',
    '[class*="Video"] [class*="Title"]',
    '[class*="media"] [class*="title"]',
    '[class*="media"] [class*="headline"]',

    // Span-based titles (some sites use <span class="title__text">)
    'span[class*="headline"]',
    'span[class*="Headline"]',
    'span[class*="title-text"]',
    'span[class*="titleText"]',

    // Figcaptions
    'figcaption'
  ];

  // --- Utility functions ---

  function getElementText(element) {
    if (!element) return '';
    let text = element.textContent || '';
    text += ' ' + (element.getAttribute('aria-label') || '');
    text += ' ' + (element.getAttribute('title') || '');
    return text.trim().toLowerCase();
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function containsKeyword(element) {
    if (!element || processedElements.has(element)) return false;
    const text = getElementText(element);
    if (!text || text.length < 3) return false;
    // Real headlines are short. Long text means this is a container, not a headline.
    // (CNN's section wrappers have "headline" in class names and thousands of chars of child text)
    if (text.length > 300) return false;
    return filterKeywords.some(keyword => {
      const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i');
      return pattern.test(text);
    });
  }

  // --- Three-tier container detection ---

  const TIER1_SELECTOR = [
    'article',
    'li',
    'tr',
    'ytd-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-rich-item-renderer',
    'ytd-reel-item-renderer',
    'ytd-playlist-panel-video-renderer',
    '[role="article"]',
    '[role="listitem"]'
  ].join(', ');

  const TIER2_SELECTOR = [
    '[class*="card"]',
    '[class*="Card"]',
    '[class*="item"]',
    '[class*="Item"]',
    '[class*="post"]',
    '[class*="Post"]',
    '[class*="story"]',
    '[class*="Story"]',
    '[class*="tile"]',
    '[class*="Tile"]',
    '[class*="teaser"]',
    '[class*="Teaser"]',
    '[class*="entry"]',
    '[class*="Entry"]',
    '[class*="feed-"]',
    '[class*="stream-"]',
    '[class*="river-"]',
    '[class*="article"]',
    '[class*="Article"]',
    '[class*="video"]',
    '[class*="Video"]',
    '[class*="collection-"]',
    '[class*="promo"]',
    '[class*="Promo"]',
    '[class*="snippet"]',
    '[class*="Snippet"]',
    '[class*="block-"]',
    '[data-component="article"]',
    '[data-component="card"]',
    '[data-testid*="card"]',
    '[data-testid*="article"]',
    '[data-testid*="post"]'
  ].join(', ');

  const PROTECTED_SELECTOR = 'body, main, header, footer, nav, aside, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]';

  const SECTION_PREFIXES = ['section', 'layout', 'wrapper', 'container', 'grid', 'row', 'column', 'col', 'page', 'site', 'nav', 'header', 'footer', 'sidebar', 'menu', 'feed', 'stream', 'river', 'list', 'results'];

  // Check if a single class token looks like a section-level name.
  // "header" or "grid-main" → true (starts with a section keyword)
  // "info-header" or "article-list" → false (section keyword is a suffix, not prefix)
  function isSectionToken(token) {
    const lower = token.toLowerCase();
    return SECTION_PREFIXES.some(prefix =>
      lower === prefix || lower.startsWith(prefix + '-') || lower.startsWith(prefix + '_')
    );
  }

  function isProtected(element) {
    if (!element) return true;
    if (element.matches(PROTECTED_SELECTOR)) return true;
    const classes = (element.className || '').toString().split(/\s+/);
    const id = (element.id || '');
    const hasSection = classes.some(c => isSectionToken(c)) || isSectionToken(id);
    if (hasSection) {
      const contentChildren = element.querySelectorAll(':scope > article, :scope > li, :scope > [class*="card"], :scope > [class*="item"], :scope > [class*="post"], :scope > [class*="story"]');
      if (contentChildren.length >= 2) return true;
    }
    return false;
  }

  function ensureCompleteUnit(candidate) {
    if (candidate.querySelector('img, video, picture, svg[class], [class*="thumbnail"], [class*="image"], [class*="photo"]')) {
      return candidate;
    }
    let current = candidate.parentElement;
    for (let i = 0; i < 5; i++) {
      if (!current || current === document.body || isProtected(current)) break;
      if (current.querySelector('img, video, picture, svg[class]')) {
        // Don't jump up to a multi-article section.
        // Count DIRECT children that each contain their own headline — that means
        // this container holds multiple independent articles, not one card with sub-parts.
        const directKids = Array.from(current.children);
        const kidsWithHeadlines = directKids.filter(kid =>
          kid.querySelector('h2, h3, h4, [role="heading"]')
        );
        if (kidsWithHeadlines.length >= 3) {
          diag('ensureCompleteStop', { el: describeEl(current), headlineKids: kidsWithHeadlines.length });
          return candidate;
        }
        diag('ensureComplete', { from: describeEl(candidate), to: describeEl(current) });
        return current;
      }
      current = current.parentElement;
    }
    return candidate;
  }

  function findContentUnit(headlineElement) {
    const tier1 = headlineElement.closest(TIER1_SELECTOR);
    if (tier1 && !isProtected(tier1)) {
      diag('containerFound', { tier: 1, el: describeEl(tier1) });
      return ensureCompleteUnit(tier1);
    }

    const tier2 = headlineElement.closest(TIER2_SELECTOR);
    if (tier2 && !isProtected(tier2)) {
      diag('containerFound', { tier: 2, el: describeEl(tier2) });
      return ensureCompleteUnit(tier2);
    }

    // Tier 3: structural fallback
    let current = headlineElement.parentElement;
    let depth = 0;
    while (current && current !== document.body && depth < 12) {
      if (isProtected(current)) break;
      const parent = current.parentElement;
      if (parent && parent.children.length >= 2) {
        const siblings = Array.from(parent.children);
        const tag = current.tagName;
        const sameTag = siblings.filter(s => s.tagName === tag);
        if (sameTag.length >= Math.max(2, siblings.length * 0.4)) {
          diag('containerFound', { tier: 3, el: describeEl(current) });
          return ensureCompleteUnit(current);
        }
      }
      current = parent;
      depth++;
    }

    const fallback = headlineElement.closest('div, section, li') || headlineElement.parentElement;
    diag('containerFound', { tier: 'fallback', el: describeEl(fallback) });
    return ensureCompleteUnit(fallback);
  }

  // --- Hiding ---

  function collapseEmptyAncestors(element) {
    let current = element.parentElement;
    let depth = 0;
    while (current && current !== document.body && depth < 6) {
      if (isProtected(current)) break;
      const hasVisibleChild = Array.from(current.children).some(child => {
        if (processedElements.has(child)) return false;
        const display = child.style.getPropertyValue('display');
        if (display === 'none') return false;
        // Also skip zero-size children (hidden by CSS or truly empty)
        if (child.offsetHeight === 0 && child.offsetWidth === 0) return false;
        const text = (child.textContent || '').trim();
        return text.length > 0 || child.querySelector('img, video, picture');
      });
      if (!hasVisibleChild) {
        current.style.setProperty('display', 'none', 'important');
        processedElements.add(current);
        diag('collapsed', { el: describeEl(current) });
        current = current.parentElement;
        depth++;
      } else {
        break;
      }
    }
  }

  function hideContentUnit(element) {
    if (!element || processedElements.has(element)) return false;
    if (isProtected(element)) {
      diag('protectedSkip', { el: describeEl(element) });
      return false;
    }
    // Last-resort safeguard: don't hide containers with multiple direct <article> children
    const directArticles = element.querySelectorAll(':scope > article, :scope > [role="article"]');
    if (directArticles.length >= 3) {
      diag('sectionSkip', { el: describeEl(element), articles: directArticles.length });
      return false;
    }
    processedElements.add(element);
    element.style.setProperty('display', 'none', 'important');
    diag('hidden', { el: describeEl(element) });
    collapseEmptyAncestors(element);
    return true;
  }

  // After hiding a content unit, find orphaned links/images pointing to the same article URL
  function hideRelatedLinks(headlineElement, contentUnit) {
    const link = headlineElement.closest('a') || headlineElement.querySelector('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#' || href === '/' || href.length < 5) return;

    try {
      const escapedHref = href.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const allLinks = document.querySelectorAll('a[href="' + escapedHref + '"]');
      allLinks.forEach(a => {
        if (contentUnit && contentUnit.contains(a)) return;
        if (processedElements.has(a)) return;
        // Walk up to the visual wrapper (image container, figure, etc.)
        const mediaContainer = a.closest('figure, [class*="image"], [class*="Image"], [class*="photo"], [class*="Photo"], [class*="thumbnail"], [class*="Thumbnail"], [class*="media"], [class*="Media"], [class*="picture"], [class*="Picture"]');
        const target = mediaContainer || a;
        if (!isProtected(target) && !processedElements.has(target)) {
          target.style.setProperty('display', 'none', 'important');
          processedElements.add(target);
          diag('relatedHidden', { href: href.substring(0, 60), el: describeEl(target) });
          collapseEmptyAncestors(target);
        }
      });
    } catch(e) {
      diag('relatedLinkError', { msg: e.message });
    }
  }

  // --- Main filter ---

  function filterContent() {
    if (filterKeywords.length === 0) return;
    let filteredCount = 0;
    const allHeadlines = document.querySelectorAll(HEADLINE_SELECTORS.join(', '));

    allHeadlines.forEach(headline => {
      try {
        if (containsKeyword(headline)) {
          diag('keywordHit', { el: describeEl(headline) });
          const contentUnit = findContentUnit(headline);
          if (contentUnit && hideContentUnit(contentUnit)) {
            filteredCount++;
            hideRelatedLinks(headline, contentUnit);
          }
        }
      } catch (e) {
        diag('error', { msg: e.message });
      }
    });

    if (filteredCount > 0) {
      diag('filterRun', { hidden: filteredCount, host: window.location.hostname });
      console.log(`[ATfilter] Hidden ${filteredCount} item(s) on ${window.location.hostname}`);
    }
  }

  // --- Observer ---

  function setupObserver() {
    const observer = new MutationObserver(() => {
      clearTimeout(window.filterTimeout);
      window.filterTimeout = setTimeout(filterContent, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- Init ---

  function init() {
    console.log('[ATfilter] v1.0 initializing...');
    chrome.storage.local.get(['filterKeywords'], (result) => {
      if (result.filterKeywords && result.filterKeywords.length > 0) {
        filterKeywords = result.filterKeywords.map(k => k.toLowerCase().trim());
        console.log('[ATfilter] Active with keywords:', filterKeywords);
        filterContent();
        setupObserver();
        showFilterBadge('ATfilter v1.0 ✓ ' + filterKeywords.length + ' keywords', 2500);
      } else {
        console.log('[ATfilter] No keywords configured');
        showFilterBadge('ATfilter v1.0 — no keywords set', 2500);
      }
    });
  }

  function unhideAll() {
    document.querySelectorAll('[style*="display: none"]').forEach(el => {
      if (processedElements.has(el)) {
        el.style.removeProperty('display');
      }
    });
    processedElements = new WeakSet();
  }

  // --- Message handler (popup requests diagnostic report) ---
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'getDiagnostic') {
      sendResponse({ report: runDiagnostic() });
    }
    return true; // keep channel open for async
  });

  // Expose diagnostic to F12 console (type: runHeadlineFilterDiag() )
  window.runHeadlineFilterDiag = function() {
    const report = runDiagnostic();
    console.log(report);
    return 'Report printed above. Select all console text and copy.';
  };

  // Ctrl+Shift+D → download diagnostic as a text file
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      const report = runDiagnostic();
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'atfilter-diag-' + window.location.hostname + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFilterBadge('Diagnostic saved!', 3000);
    }
  });

  // Brief on-page badge to confirm the script is alive
  function showFilterBadge(text, duration) {
    let badge = document.getElementById('__hf_badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = '__hf_badge';
      badge.style.cssText = 'position:fixed;top:8px;right:8px;z-index:2147483647;background:#4CAF50;color:#fff;padding:6px 14px;border-radius:4px;font:bold 13px sans-serif;pointer-events:none;opacity:0.92;transition:opacity 0.5s;';
      document.body.appendChild(badge);
    }
    badge.textContent = text;
    badge.style.display = 'block';
    badge.style.opacity = '0.92';
    clearTimeout(badge._timer);
    badge._timer = setTimeout(() => { badge.style.opacity = '0'; setTimeout(() => { badge.style.display = 'none'; }, 600); }, duration || 2000);
  }

  // --- Storage listener ---
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.filterKeywords) {
      filterKeywords = (changes.filterKeywords.newValue || []).map(k => k.toLowerCase().trim());
      unhideAll();
      console.log('[ATfilter] Keywords updated:', filterKeywords);
      filterContent();
    }
  });

  // --- Start ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
