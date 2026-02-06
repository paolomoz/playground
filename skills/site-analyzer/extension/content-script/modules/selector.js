/**
 * Generate a robust CSS selector for an element.
 * Priority: id > data-attr > tag.class > nth-child path
 * @param {Element} el
 * @returns {string}
 */
function generateSelector(el) {
  if (!el || el === document.body || el === document.documentElement) {
    return el?.tagName?.toLowerCase() || 'html';
  }

  // 1. ID (if unique)
  if (el.id) {
    const idSel = `#${CSS.escape(el.id)}`;
    if (document.querySelectorAll(idSel).length === 1) return idSel;
  }

  // 2. Data attributes (common in CMS/frameworks)
  for (const attr of el.attributes) {
    if (attr.name.startsWith('data-') && attr.value) {
      const dataSel = `[${attr.name}="${CSS.escape(attr.value)}"]`;
      if (document.querySelectorAll(dataSel).length === 1) return dataSel;
    }
  }

  // 3. Tag + classes (if unique)
  const tag = el.tagName.toLowerCase();
  if (el.className && typeof el.className === 'string') {
    const classes = el.className.trim().split(/\s+/).filter(c => c.length > 0);
    if (classes.length > 0) {
      const classSel = tag + '.' + classes.map(c => CSS.escape(c)).join('.');
      if (document.querySelectorAll(classSel).length === 1) return classSel;
    }
  }

  // 4. Build path with nth-child
  const path = [];
  let current = el;

  while (current && current !== document.body && current !== document.documentElement) {
    let segment = current.tagName.toLowerCase();

    if (current.id) {
      segment = `#${CSS.escape(current.id)}`;
      path.unshift(segment);
      break;
    }

    // Add nth-child for disambiguation
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        s => s.tagName === current.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        segment += `:nth-of-type(${index})`;
      }
    }

    // Add first class for readability
    if (current.className && typeof current.className === 'string') {
      const firstClass = current.className.trim().split(/\s+/)[0];
      if (firstClass) {
        segment += '.' + CSS.escape(firstClass);
      }
    }

    path.unshift(segment);
    current = current.parentElement;

    // Keep paths reasonable length
    if (path.length >= 5) break;
  }

  return path.join(' > ');
}
