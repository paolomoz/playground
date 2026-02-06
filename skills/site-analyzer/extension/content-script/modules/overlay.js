/**
 * Overlay module: draws/removes highlight rectangles on hovered/selected elements.
 */
const SaOverlay = (() => {
  let hoverOverlay = null;
  let selectedOverlays = [];
  let tooltip = null;

  function createOverlayElement(className) {
    const el = document.createElement('div');
    el.className = className;
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    return el;
  }

  function positionOverlay(overlay, rect) {
    overlay.style.position = 'fixed';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.style.zIndex = '2147483646';
  }

  function showHoverHighlight(element) {
    if (!hoverOverlay) {
      hoverOverlay = createOverlayElement('sa-hover-overlay');
    }
    const rect = element.getBoundingClientRect();
    positionOverlay(hoverOverlay, rect);
    hoverOverlay.style.display = 'block';

    // Show tooltip with tag + dimensions
    showTooltip(element, rect);
  }

  function hideHoverHighlight() {
    if (hoverOverlay) {
      hoverOverlay.style.display = 'none';
    }
    hideTooltip();
  }

  function showSelectHighlight(element) {
    const overlay = createOverlayElement('sa-select-overlay');
    const rect = element.getBoundingClientRect();
    positionOverlay(overlay, rect);
    selectedOverlays.push(overlay);

    // Auto-remove after animation
    setTimeout(() => {
      overlay.classList.add('sa-select-overlay--fade');
      setTimeout(() => overlay.remove(), 500);
      selectedOverlays = selectedOverlays.filter(o => o !== overlay);
    }, 1500);
  }

  function showTooltip(element, rect) {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'sa-inspector-tooltip';
      tooltip.style.pointerEvents = 'none';
      document.body.appendChild(tooltip);
    }

    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const cls = element.className && typeof element.className === 'string'
      ? '.' + element.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    const dims = `${Math.round(rect.width)} x ${Math.round(rect.height)}`;

    tooltip.textContent = `${tag}${id}${cls}  ${dims}`;
    tooltip.style.position = 'fixed';
    tooltip.style.zIndex = '2147483647';
    tooltip.style.display = 'block';

    // Position above element, or below if no room
    const tooltipHeight = 24;
    if (rect.top > tooltipHeight + 4) {
      tooltip.style.top = (rect.top - tooltipHeight - 4) + 'px';
    } else {
      tooltip.style.top = (rect.bottom + 4) + 'px';
    }
    tooltip.style.left = Math.max(4, rect.left) + 'px';
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  function removeAll() {
    if (hoverOverlay) { hoverOverlay.remove(); hoverOverlay = null; }
    if (tooltip) { tooltip.remove(); tooltip = null; }
    selectedOverlays.forEach(o => o.remove());
    selectedOverlays = [];
  }

  return { showHoverHighlight, hideHoverHighlight, showSelectHighlight, removeAll };
})();
