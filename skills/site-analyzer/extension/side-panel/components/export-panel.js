/* global MSG, EXTENSION_VERSION, formatTimestamp, escapeMarkdown, getDomain */

class ExportPanel {
  constructor(root, controller) {
    this.root = root;
    this.controller = controller;
  }

  async refresh() {
    const response = await this.controller.send({ type: MSG.EXPORT_REQUEST });
    this.render(response.data);
  }

  render(data) {
    this.root.innerHTML = '';

    if (!data) {
      this.root.innerHTML = '<div class="sa-empty"><div class="sa-empty__text">Loading...</div></div>';
      return;
    }

    const { project, pages, elements, landmarks, transcripts } = data;
    const confirmedLandmarks = landmarks.filter(l => l.confirmed);

    // Stats
    const stats = document.createElement('div');
    stats.className = 'sa-export-stats';
    stats.innerHTML = `
      <div class="sa-stat">
        <div class="sa-stat__value">${pages.length}</div>
        <div class="sa-stat__label">Pages</div>
      </div>
      <div class="sa-stat">
        <div class="sa-stat__value">${elements.length}</div>
        <div class="sa-stat__label">Elements</div>
      </div>
      <div class="sa-stat">
        <div class="sa-stat__value">${confirmedLandmarks.length}</div>
        <div class="sa-stat__label">Landmarks</div>
      </div>
      <div class="sa-stat">
        <div class="sa-stat__value">${transcripts.length}</div>
        <div class="sa-stat__label">Voice Notes</div>
      </div>
    `;
    this.root.appendChild(stats);

    // Build markdown
    const markdown = this.buildMarkdown(data);

    // Preview
    const previewLabel = document.createElement('div');
    previewLabel.className = 'sa-flex-between sa-mb-8';
    previewLabel.innerHTML = `
      <span class="sa-text-sm sa-text-muted">Preview</span>
      <span class="sa-text-sm sa-text-muted">${markdown.length.toLocaleString()} chars</span>
    `;
    this.root.appendChild(previewLabel);

    const preview = document.createElement('pre');
    preview.className = 'sa-export-preview';
    preview.textContent = markdown;
    this.root.appendChild(preview);

    // Download button
    const actions = document.createElement('div');
    actions.className = 'sa-mt-12';
    actions.innerHTML = `
      <button class="sa-btn sa-btn--primary" style="width:100%" id="btn-download-brief">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 10V13H13V10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 2V10M5 7L8 10L11 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Download Analysis Brief
      </button>
    `;
    this.root.appendChild(actions);

    actions.querySelector('#btn-download-brief').addEventListener('click', () => {
      this.downloadMarkdown(markdown, project?.name || 'site-analysis');
    });
  }

  buildMarkdown(data) {
    const { project, pages, elements, landmarks, screenshots, transcripts } = data;
    const confirmedLandmarks = landmarks.filter(l => l.confirmed);
    const now = new Date().toISOString().split('T')[0];
    const lines = [];

    // ── Title & overview ──
    lines.push(`# Site Analysis Brief: ${project?.name || 'Untitled'}`);
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| Source URL | ${project?.sourceUrl || 'N/A'} |`);
    lines.push(`| Date | ${now} |`);
    lines.push(`| Pages analyzed | ${pages.length} |`);
    lines.push(`| Elements captured | ${elements.length} |`);
    lines.push(`| Voice notes | ${transcripts.length} |`);
    lines.push('');

    // ── Global voice notes ──
    const globalTranscripts = transcripts.filter(t => !t.elementId);
    if (globalTranscripts.length > 0) {
      lines.push('## Site Overview');
      lines.push('');
      lines.push('### Voice Notes');
      globalTranscripts.forEach(t => {
        lines.push(`- ${t.text}`);
      });
      lines.push('');
    }

    // ── Global structure (confirmed landmarks) ──
    if (confirmedLandmarks.length > 0) {
      lines.push('### Global Structure');
      lines.push('');
      lines.push('| Landmark | Type | Selector |');
      lines.push('|----------|------|----------|');
      confirmedLandmarks.forEach(lm => {
        lines.push(`| ${lm.type} | \`${lm.selector}\` | ${Math.round(lm.confidence * 100)}% confidence |`);
      });
      lines.push('');
    }

    // ── Sitemap & Templates ──
    lines.push('## Sitemap & Templates');
    lines.push('');

    // Group pages by template
    const templateGroups = {};
    pages.forEach(p => {
      const label = p.templateLabel || 'Unlabeled';
      if (!templateGroups[label]) templateGroups[label] = [];
      templateGroups[label].push(p);
    });

    for (const [template, templatePages] of Object.entries(templateGroups)) {
      lines.push(`### ${template}`);
      lines.push('');
      lines.push('| Page | Path | Elements | Landmarks |');
      lines.push('|------|------|----------|-----------|');
      templatePages.forEach(p => {
        const pageLandmarks = landmarks.filter(l => l.pageId === p.id && l.confirmed);
        lines.push(`| ${p.title || 'Untitled'} | ${p.path} | ${p.elementIds?.length || 0} | ${pageLandmarks.length} |`);
      });
      lines.push('');

      // Page-specific landmarks
      templatePages.forEach(p => {
        const pageLandmarks = landmarks.filter(l => l.pageId === p.id && l.confirmed);
        if (pageLandmarks.length > 0) {
          lines.push(`**${p.title || p.path} — Landmarks:**`);
          pageLandmarks.forEach(lm => {
            lines.push(`- ${lm.type}: \`${lm.selector}\``);
          });
          lines.push('');
        }
      });
    }

    // ── Captured Elements ──
    if (elements.length > 0) {
      lines.push('## Captured Elements');
      lines.push('');

      elements.forEach((el, i) => {
        const page = pages.find(p => p.id === el.pageId);
        lines.push(`### ${i + 1}. ${el.userLabel || el.tagName}`);
        lines.push('');
        lines.push(`- **Selector:** \`${el.selector}\``);
        lines.push(`- **Tag:** \`<${el.tagName}>\``);
        lines.push(`- **Page:** ${page?.title || page?.path || 'Unknown'}`);
        if (el.screenshotId) {
          lines.push(`- **Screenshot:** [captured]`);
        }
        if (el.userNotes) {
          lines.push(`- **Notes:** ${el.userNotes}`);
        }
        lines.push('');
        if (el.outerHTMLSnippet) {
          lines.push('```html');
          lines.push(el.outerHTMLSnippet);
          lines.push('```');
          lines.push('');
        }

        // Element-specific transcripts
        const elTranscripts = transcripts.filter(t => t.elementId === el.id);
        if (elTranscripts.length > 0) {
          lines.push('**Voice notes:**');
          elTranscripts.forEach(t => {
            lines.push(`> ${t.text}`);
          });
          lines.push('');
        }
      });
    }

    // ── Block Mapping Suggestions ──
    if (elements.length > 0) {
      lines.push('## Block Mapping Suggestions');
      lines.push('');
      lines.push('| Source Element | Selector | Suggested EDS Block |');
      lines.push('|--------------|----------|-------------------|');
      elements.forEach(el => {
        const suggestion = this.suggestBlock(el);
        lines.push(`| ${el.userLabel || el.tagName} | \`${el.selector}\` | ${suggestion} |`);
      });
      lines.push('');
    }

    // ── Voice Transcript Log ──
    if (transcripts.length > 0) {
      lines.push('## Voice Transcript Log');
      lines.push('');
      lines.push('| # | Timestamp | Page | Text |');
      lines.push('|---|-----------|------|------|');
      transcripts.forEach((t, i) => {
        const page = pages.find(p => p.id === t.pageId);
        lines.push(`| ${i + 1} | ${formatTimestamp(t.startedAt)} | ${page?.title || 'Global'} | ${t.text} |`);
      });
      lines.push('');
    }

    // ── Metadata ──
    lines.push('## Analysis Metadata');
    lines.push('');
    lines.push(`- **Tool:** Site Analyzer v${EXTENSION_VERSION}`);
    lines.push(`- **Generated:** ${new Date().toISOString()}`);
    lines.push(`- **Project created:** ${project ? formatTimestamp(project.createdAt) : 'N/A'}`);
    lines.push(`- **Pages analyzed:** ${pages.length}`);
    lines.push(`- **Elements captured:** ${elements.length}`);
    lines.push(`- **Voice transcripts:** ${transcripts.length}`);
    lines.push(`- **Confirmed landmarks:** ${confirmedLandmarks.length}`);

    return lines.join('\n');
  }

  suggestBlock(element) {
    const tag = element.tagName?.toLowerCase() || '';
    const label = (element.userLabel || '').toLowerCase();
    const selector = (element.selector || '').toLowerCase();
    const combined = `${tag} ${label} ${selector}`;

    if (combined.match(/hero|banner|jumbotron/)) return 'Hero';
    if (combined.match(/nav|menu|navigation/)) return 'Navigation / Header';
    if (combined.match(/footer/)) return 'Footer';
    if (combined.match(/card|tile|teaser/)) return 'Cards';
    if (combined.match(/carousel|slider|slideshow/)) return 'Carousel';
    if (combined.match(/accordion|faq|collapse/)) return 'Accordion';
    if (combined.match(/tab|tabbed/)) return 'Tabs';
    if (combined.match(/form|input|submit/)) return 'Form';
    if (combined.match(/table/)) return 'Table';
    if (combined.match(/video|player/)) return 'Video / Embed';
    if (combined.match(/image|img|gallery|photo/)) return 'Image / Gallery';
    if (combined.match(/cta|button|action/)) return 'Call-to-Action';
    if (combined.match(/sidebar|aside/)) return 'Sidebar';
    if (combined.match(/list|ul|ol/)) return 'List';
    if (combined.match(/heading|title|h1|h2|h3/)) return 'Section Heading';
    if (combined.match(/text|paragraph|article|content/)) return 'Text / Columns';
    return 'Custom Block (TBD)';
  }

  downloadMarkdown(markdown, projectName) {
    const filename = `${projectName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-analysis.md`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url,
      filename,
      saveAs: true,
    });
  }
}
