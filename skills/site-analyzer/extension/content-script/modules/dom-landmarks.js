/**
 * Auto-detect semantic landmarks: header, footer, nav, main, hero, sidebar, sections.
 * Returns an array of {type, selector, confidence}.
 */
function detectLandmarks() {
  const landmarks = [];

  const addIfFound = (type, element, confidence) => {
    if (element && !landmarks.some(l => l.selector === generateSelector(element) && l.type === type)) {
      landmarks.push({
        type,
        selector: generateSelector(element),
        confidence,
      });
    }
  };

  // ── Header ──
  const header = document.querySelector('header')
    || document.querySelector('[role="banner"]')
    || document.querySelector('.header, .site-header, #header');
  if (header) addIfFound('header', header, header.tagName === 'HEADER' ? 0.95 : 0.75);

  // ── Footer ──
  const footer = document.querySelector('footer')
    || document.querySelector('[role="contentinfo"]')
    || document.querySelector('.footer, .site-footer, #footer');
  if (footer) addIfFound('footer', footer, footer.tagName === 'FOOTER' ? 0.95 : 0.75);

  // ── Navigation ──
  const navs = document.querySelectorAll('nav, [role="navigation"]');
  navs.forEach((nav, i) => {
    if (i < 3) addIfFound('nav', nav, 0.9); // limit to first 3
  });
  if (navs.length === 0) {
    const navByClass = document.querySelector('.nav, .navigation, .navbar, #nav');
    if (navByClass) addIfFound('nav', navByClass, 0.6);
  }

  // ── Main content ──
  const main = document.querySelector('main')
    || document.querySelector('[role="main"]')
    || document.querySelector('.main-content, #main, #content, .content');
  if (main) addIfFound('main', main, main.tagName === 'MAIN' ? 0.95 : 0.7);

  // ── Hero section ──
  const hero = document.querySelector('.hero, .hero-banner, .jumbotron, [class*="hero"]');
  if (hero) addIfFound('hero', hero, 0.8);
  if (!hero) {
    // Heuristic: first large section/div after header with bg image or large text
    const firstSection = document.querySelector('header ~ section, header ~ .section');
    if (firstSection) {
      const rect = firstSection.getBoundingClientRect();
      if (rect.height > 300) addIfFound('hero', firstSection, 0.5);
    }
  }

  // ── Sidebar ──
  const sidebar = document.querySelector('aside, [role="complementary"]')
    || document.querySelector('.sidebar, #sidebar, .aside');
  if (sidebar) addIfFound('sidebar', sidebar, sidebar.tagName === 'ASIDE' ? 0.9 : 0.7);

  // ── Content sections ──
  const sections = document.querySelectorAll('main section, [role="main"] section, .main-content section');
  sections.forEach((section, i) => {
    if (i < 5) addIfFound('section', section, 0.6); // limit to first 5
  });

  return landmarks;
}
