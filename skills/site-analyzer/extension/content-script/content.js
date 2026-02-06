/* global MSG, SaOverlay, generateSelector, detectLandmarks, extractPageMetadata, truncateHTML */

(() => {
  let inspectorActive = false;
  let currentHoveredElement = null;

  // ── Page lifecycle: report page info on load ──

  function reportPage() {
    const meta = extractPageMetadata();
    chrome.runtime.sendMessage({
      type: MSG.PAGE_DETECTED,
      url: location.href,
      title: document.title,
      meta,
    });

    // Auto-detect landmarks after a short delay for rendering
    setTimeout(() => {
      const landmarks = detectLandmarks();
      if (landmarks.length > 0) {
        chrome.runtime.sendMessage({
          type: MSG.LANDMARKS_DETECTED,
          landmarks,
        });
      }
    }, 1000);
  }

  // Report on initial load
  reportPage();

  // Report on SPA-style navigation (pushState/replaceState)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(reportPage, 500);
    }
  });
  urlObserver.observe(document.body, { childList: true, subtree: true });

  // ── Inspector mode ──

  function onMouseMove(e) {
    if (!inspectorActive) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === currentHoveredElement) return;
    if (el.closest('.sa-hover-overlay, .sa-select-overlay, .sa-inspector-tooltip')) return;

    currentHoveredElement = el;
    SaOverlay.showHoverHighlight(el);
  }

  function onMouseDown(e) {
    if (!inspectorActive) return;

    e.preventDefault();
    e.stopPropagation();

    const el = currentHoveredElement;
    if (!el) return;

    SaOverlay.hideHoverHighlight();
    SaOverlay.showSelectHighlight(el);

    const rect = el.getBoundingClientRect();
    const selector = generateSelector(el);
    const outerHTML = el.outerHTML;

    chrome.runtime.sendMessage({
      type: MSG.ELEMENT_SELECTED,
      selector,
      tagName: el.tagName.toLowerCase(),
      outerHTMLSnippet: truncateHTML(outerHTML, 500),
      boundingRect: {
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY,
        width: rect.width,
        height: rect.height,
        // Viewport-relative for cropping
        viewportX: rect.x,
        viewportY: rect.y,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      },
    });
  }

  function onClick(e) {
    if (!inspectorActive) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function activateInspector() {
    inspectorActive = true;
    document.body.classList.add('sa-inspector-active');
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('click', onClick, true);
  }

  function deactivateInspector() {
    inspectorActive = false;
    document.body.classList.remove('sa-inspector-active');
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mousedown', onMouseDown, true);
    document.removeEventListener('click', onClick, true);
    SaOverlay.hideHoverHighlight();
    currentHoveredElement = null;
  }

  // ── Message listener ──

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case MSG.INSPECTOR_STATE:
        if (message.active) {
          activateInspector();
        } else {
          deactivateInspector();
        }
        sendResponse({ ok: true });
        break;
    }
  });

  // ── Cleanup on unload ──
  window.addEventListener('beforeunload', () => {
    SaOverlay.removeAll();
    deactivateInspector();
  });
})();
