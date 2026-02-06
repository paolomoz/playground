/**
 * Extract page metadata: title, meta tags, OG data, canonical URL.
 * @returns {Object}
 */
function extractPageMetadata() {
  const getMeta = (name) => {
    const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return el ? el.getAttribute('content') : null;
  };

  const canonical = document.querySelector('link[rel="canonical"]');

  return {
    title: document.title,
    description: getMeta('description'),
    canonical: canonical ? canonical.href : null,
    og: {
      title: getMeta('og:title'),
      description: getMeta('og:description'),
      image: getMeta('og:image'),
      type: getMeta('og:type'),
      url: getMeta('og:url'),
    },
    twitter: {
      card: getMeta('twitter:card'),
      title: getMeta('twitter:title'),
      description: getMeta('twitter:description'),
    },
    charset: document.characterSet,
    language: document.documentElement.lang || null,
    viewport: getMeta('viewport'),
  };
}
