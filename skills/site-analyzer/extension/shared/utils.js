/**
 * Generate a short unique ID.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Normalize a URL for deduplication: strip hash, trailing slash, sort params.
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    // Sort search params for consistency
    const params = new URLSearchParams(u.search);
    const sorted = new URLSearchParams([...params.entries()].sort());
    u.search = sorted.toString();
    // Remove trailing slash except for root
    let result = u.toString();
    if (result.endsWith('/') && u.pathname !== '/') {
      result = result.slice(0, -1);
    }
    return result;
  } catch {
    return url;
  }
}

/**
 * Extract path from a URL.
 * @param {string} url
 * @returns {string}
 */
function getUrlPath(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/**
 * Format a timestamp as readable date string.
 * @param {number} ts
 * @returns {string}
 */
function formatTimestamp(ts) {
  return new Date(ts).toLocaleString();
}

/**
 * Truncate a string to maxLen, adding ellipsis.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
function truncate(str, maxLen = 100) {
  if (!str || str.length <= maxLen) return str || '';
  return str.slice(0, maxLen - 1) + '\u2026';
}

/**
 * Truncate HTML to a reasonable snippet size.
 * @param {string} html
 * @param {number} maxLen
 * @returns {string}
 */
function truncateHTML(html, maxLen = 500) {
  if (!html || html.length <= maxLen) return html || '';
  return html.slice(0, maxLen) + '...';
}

/**
 * Get the origin/domain from a URL.
 * @param {string} url
 * @returns {string}
 */
function getDomain(url) {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

/**
 * Escape markdown special chars in a string.
 * @param {string} str
 * @returns {string}
 */
function escapeMarkdown(str) {
  if (!str) return '';
  return str.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1');
}
