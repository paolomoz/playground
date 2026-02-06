/* global MSG, formatTimestamp, truncate */

class ElementList {
  constructor(root, controller) {
    this.root = root;
    this.controller = controller;
    this.elements = [];
    this.screenshots = [];
  }

  render(elements, screenshots) {
    this.elements = elements || [];
    this.screenshots = screenshots || [];
    this.root.innerHTML = '';

    if (this.elements.length === 0) {
      this.root.innerHTML = `
        <div class="sa-empty">
          <div class="sa-empty__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="6" y="8" width="28" height="24" rx="3" stroke="#B1B1B1" stroke-width="1.5" stroke-dasharray="4 3"/>
              <circle cx="20" cy="20" r="6" stroke="#B1B1B1" stroke-width="1.5"/>
              <path d="M24.5 24.5L28 28" stroke="#B1B1B1" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="sa-empty__text">No elements captured</div>
          <div class="sa-empty__hint">Use the Inspector to select elements on the page</div>
        </div>
      `;
      return;
    }

    const header = document.createElement('div');
    header.className = 'sa-flex-between sa-mb-8';
    header.innerHTML = `
      <span class="sa-text-sm sa-text-muted">${this.elements.length} element${this.elements.length !== 1 ? 's' : ''}</span>
    `;
    this.root.appendChild(header);

    this.elements.forEach(el => {
      const screenshot = this.screenshots.find(s => s.id === el.screenshotId);
      const card = document.createElement('div');
      card.className = 'sa-card';

      card.innerHTML = `
        <div class="sa-card__header">
          <div class="sa-flex sa-gap-8" style="align-items: center">
            ${screenshot ? `<img class="sa-thumbnail--sm" src="${screenshot.dataUrl}" alt="Element screenshot">` : ''}
            <div>
              <div class="sa-card__title">${this.escapeHtml(el.userLabel || el.tagName)}</div>
              <code class="sa-selector">${this.escapeHtml(truncate(el.selector, 60))}</code>
            </div>
          </div>
          <button class="sa-btn sa-btn--ghost sa-btn--icon sa-delete-btn" data-element-id="${el.id}" title="Remove">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="sa-form-group">
          <label>Label</label>
          <input type="text" class="sa-label-input" data-element-id="${el.id}" value="${this.escapeHtml(el.userLabel)}" placeholder="e.g., Hero Banner, Product Card">
        </div>
        <div class="sa-form-group">
          <label>Notes</label>
          <textarea class="sa-notes-input" data-element-id="${el.id}" placeholder="Describe this element's purpose...">${this.escapeHtml(el.userNotes)}</textarea>
        </div>
        <div class="sa-text-sm sa-text-muted">
          Captured ${formatTimestamp(el.capturedAt)}
        </div>
      `;

      // Bind events
      const labelInput = card.querySelector('.sa-label-input');
      let labelTimer;
      labelInput.addEventListener('input', (e) => {
        clearTimeout(labelTimer);
        labelTimer = setTimeout(() => {
          this.controller.send({
            type: MSG.ELEMENT_LABEL_UPDATE,
            elementId: el.id,
            label: e.target.value,
          });
        }, 400);
      });

      const notesInput = card.querySelector('.sa-notes-input');
      let notesTimer;
      notesInput.addEventListener('input', (e) => {
        clearTimeout(notesTimer);
        notesTimer = setTimeout(() => {
          this.controller.send({
            type: MSG.ELEMENT_NOTES_UPDATE,
            elementId: el.id,
            notes: e.target.value,
          });
        }, 400);
      });

      const deleteBtn = card.querySelector('.sa-delete-btn');
      deleteBtn.addEventListener('click', async () => {
        await this.controller.send({
          type: MSG.ELEMENT_DELETE,
          elementId: el.id,
        });
        this.refresh();
      });

      this.root.appendChild(card);
    });
  }

  async refresh() {
    const data = await this.controller.send({ type: MSG.DATA_GET_ALL });
    this.render(data.elements, data.screenshots);
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
