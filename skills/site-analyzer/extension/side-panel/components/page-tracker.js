/* global MSG, DEFAULT_STATE, formatTimestamp, getUrlPath */

class PageTracker {
  constructor(root, controller) {
    this.root = root;
    this.controller = controller;
    this.pages = [];
  }

  render(pages) {
    this.pages = pages || [];
    this.root.innerHTML = '';

    if (this.pages.length === 0) {
      this.root.innerHTML = `
        <div class="sa-empty">
          <div class="sa-empty__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="6" width="32" height="28" rx="3" stroke="#B1B1B1" stroke-width="1.5"/>
              <path d="M4 14H36" stroke="#B1B1B1" stroke-width="1.5"/>
              <circle cx="9" cy="10" r="1.5" fill="#B1B1B1"/>
              <circle cx="14" cy="10" r="1.5" fill="#B1B1B1"/>
              <circle cx="19" cy="10" r="1.5" fill="#B1B1B1"/>
            </svg>
          </div>
          <div class="sa-empty__text">No pages captured yet</div>
          <div class="sa-empty__hint">Browse the site to auto-track pages</div>
        </div>
      `;
      return;
    }

    // Group by template
    const templateLabels = this.controller.state?.templateLabels || DEFAULT_STATE.templateLabels;
    const header = document.createElement('div');
    header.className = 'sa-flex-between sa-mb-8';
    header.innerHTML = `
      <span class="sa-text-sm sa-text-muted">${this.pages.length} page${this.pages.length !== 1 ? 's' : ''} tracked</span>
    `;
    this.root.appendChild(header);

    this.pages.forEach(page => {
      const card = document.createElement('div');
      card.className = 'sa-card';

      const currentPageId = this.controller.state?.currentPageId;
      if (page.id === currentPageId) {
        card.style.borderColor = '#2680EB';
        card.style.borderWidth = '2px';
      }

      card.innerHTML = `
        <div class="sa-card__header">
          <div>
            <div class="sa-card__title">${this.escapeHtml(page.title || 'Untitled')}</div>
            <div class="sa-card__subtitle">${this.escapeHtml(page.path)}</div>
          </div>
          ${page.templateLabel ? `<span class="sa-badge sa-badge--blue">${this.escapeHtml(page.templateLabel)}</span>` : ''}
        </div>
        <div class="sa-form-group">
          <label>Template Type</label>
          <select data-page-id="${page.id}" class="sa-template-select">
            <option value="">— Select template —</option>
            ${templateLabels.map(t =>
              `<option value="${this.escapeHtml(t)}" ${page.templateLabel === t ? 'selected' : ''}>${this.escapeHtml(t)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="sa-flex sa-gap-4 sa-text-sm sa-text-muted">
          <span>${page.elementIds?.length || 0} elements</span>
          <span>&middot;</span>
          <span>${page.landmarkIds?.length || 0} landmarks</span>
          <span>&middot;</span>
          <span>${formatTimestamp(page.visitedAt)}</span>
        </div>
      `;

      const select = card.querySelector('.sa-template-select');
      select.addEventListener('change', (e) => {
        this.controller.send({
          type: MSG.PAGE_TEMPLATE_UPDATE,
          pageId: page.id,
          templateLabel: e.target.value || null,
        });
      });

      this.root.appendChild(card);
    });
  }

  async refresh() {
    const data = await this.controller.send({ type: MSG.DATA_GET_ALL });
    this.render(data.pages);
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
