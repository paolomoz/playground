/* global MSG, LANDMARK_TYPES */

class LandmarkSuggestions {
  constructor(root, controller) {
    this.root = root;
    this.controller = controller;
    this.landmarks = [];
  }

  render(landmarks) {
    this.landmarks = (landmarks || []).filter(l => !l.confirmed && !l.dismissed);
    this.root.innerHTML = '';

    if (this.landmarks.length === 0) {
      this.root.hidden = true;
      return;
    }

    this.root.hidden = false;
    this.root.style.padding = '8px 12px';

    const header = document.createElement('div');
    header.className = 'sa-flex-between sa-mb-8';
    header.innerHTML = `
      <span class="sa-card__title">Detected Landmarks</span>
      <span class="sa-badge sa-badge--green">${this.landmarks.length} found</span>
    `;
    this.root.appendChild(header);

    this.landmarks.forEach(lm => {
      const typeInfo = Object.values(LANDMARK_TYPES).find(t => t.type === lm.type) || { label: lm.type };
      const confidence = Math.round(lm.confidence * 100);

      const card = document.createElement('div');
      card.className = 'sa-landmark';

      card.innerHTML = `
        <div class="sa-landmark__info">
          <div class="sa-landmark__type">${this.escapeHtml(typeInfo.label)}</div>
          <div class="sa-landmark__selector">${this.escapeHtml(lm.selector)}</div>
          <div class="sa-landmark__confidence">${confidence}% confidence</div>
        </div>
        <div class="sa-landmark__actions">
          <button class="sa-btn sa-btn--sm sa-confirm-btn" data-landmark-id="${lm.id}" title="Confirm">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="#2D9D78" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="sa-btn sa-btn--sm sa-dismiss-btn" data-landmark-id="${lm.id}" title="Dismiss">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3L9 9M9 3L3 9" stroke="#E34850" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      `;

      card.querySelector('.sa-confirm-btn').addEventListener('click', async () => {
        await this.controller.send({
          type: MSG.LANDMARK_CONFIRM,
          landmarkId: lm.id,
        });
        this.refresh();
      });

      card.querySelector('.sa-dismiss-btn').addEventListener('click', async () => {
        await this.controller.send({
          type: MSG.LANDMARK_DISMISS,
          landmarkId: lm.id,
        });
        this.refresh();
      });

      this.root.appendChild(card);
    });
  }

  async refresh() {
    const data = await this.controller.send({ type: MSG.DATA_GET_ALL });
    this.render(data.landmarks);
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
