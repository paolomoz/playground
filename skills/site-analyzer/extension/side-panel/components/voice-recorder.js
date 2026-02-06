/* global MSG, formatTimestamp */

class VoiceRecorder {
  constructor(root, controller) {
    this.root = root;
    this.controller = controller;
    this.transcripts = [];
    this.isRecording = false;
    this.render([]);
  }

  render(transcripts) {
    this.transcripts = transcripts || [];
    this.root.innerHTML = '';

    // Recording status area
    const statusArea = document.createElement('div');
    statusArea.id = 'voice-status';
    statusArea.className = 'sa-mb-8';
    this.root.appendChild(statusArea);
    this.updateRecordingState(this.isRecording);

    // Interim text display
    const interim = document.createElement('div');
    interim.id = 'voice-interim';
    interim.className = 'sa-interim-text';
    interim.hidden = true;
    this.root.appendChild(interim);

    // Transcript list
    if (this.transcripts.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'sa-empty';
      empty.innerHTML = `
        <div class="sa-empty__icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="14" y="4" width="12" height="20" rx="6" stroke="#B1B1B1" stroke-width="1.5"/>
            <path d="M8 18C8 25 13.4 30 20 30C26.6 30 32 25 32 18" stroke="#B1B1B1" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M20 30V36" stroke="#B1B1B1" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="sa-empty__text">No voice notes yet</div>
        <div class="sa-empty__hint">Click Record in the toolbar to start narrating</div>
      `;
      this.root.appendChild(empty);
      return;
    }

    const header = document.createElement('div');
    header.className = 'sa-flex-between sa-mb-8';
    header.innerHTML = `
      <span class="sa-text-sm sa-text-muted">${this.transcripts.length} transcript${this.transcripts.length !== 1 ? 's' : ''}</span>
    `;
    this.root.appendChild(header);

    this.transcripts.forEach(t => {
      const item = document.createElement('div');
      item.className = 'sa-transcript-item';
      item.innerHTML = `
        <div>${this.escapeHtml(t.text)}</div>
        <div class="sa-transcript-item__meta">
          ${formatTimestamp(t.startedAt)} &middot; ${t.pageId ? 'Page context' : 'Global'}
        </div>
      `;
      this.root.appendChild(item);
    });
  }

  updateRecordingState(isRecording) {
    this.isRecording = isRecording;
    const statusArea = this.root.querySelector('#voice-status');
    if (!statusArea) return;

    if (isRecording) {
      statusArea.innerHTML = `
        <div class="sa-recording-indicator">
          <span class="sa-recording-dot"></span>
          Recording...
        </div>
      `;
      statusArea.hidden = false;
    } else {
      statusArea.hidden = true;
      statusArea.innerHTML = '';
    }
  }

  showInterim(text) {
    const interim = this.root.querySelector('#voice-interim');
    if (interim) {
      interim.textContent = text;
      interim.hidden = !text;
    }
  }

  addTranscript(transcript) {
    // Clear interim
    this.showInterim('');
    this.refresh();
  }

  showError(error) {
    const statusArea = this.root.querySelector('#voice-status');
    if (statusArea) {
      statusArea.innerHTML = `
        <div class="sa-badge sa-badge--red">${this.escapeHtml(error)}</div>
      `;
      statusArea.hidden = false;
    }
  }

  async refresh() {
    const data = await this.controller.send({ type: MSG.DATA_GET_ALL });
    this.render(data.transcripts);
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
