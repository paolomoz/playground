/* global MSG, STORAGE_KEYS, PageTracker, ElementList, VoiceRecorder, LandmarkSuggestions, ExportPanel */

class PanelController {
  constructor() {
    this.activeTab = 'pages';
    this.project = null;
    this.state = null;

    // Component instances
    this.pageTracker = null;
    this.elementList = null;
    this.voiceRecorder = null;
    this.landmarkSuggestions = null;
    this.exportPanel = null;

    this.init();
  }

  async init() {
    this.bindEvents();
    this.listenForMessages();

    const response = await this.send({ type: MSG.PROJECT_GET });
    this.project = response.project;

    if (this.project) {
      this.showMainContent();
      await this.loadData();
    } else {
      this.showProjectSetup();
    }
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.sa-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Project creation
    document.getElementById('btn-create-project').addEventListener('click', () => this.createProject());
    document.getElementById('btn-new-project').addEventListener('click', () => this.resetProject());

    // Toolbar buttons
    document.getElementById('btn-inspector').addEventListener('click', () => this.toggleInspector());
    document.getElementById('btn-mic').addEventListener('click', () => this.toggleVoice());
  }

  listenForMessages() {
    chrome.runtime.onMessage.addListener((message) => {
      switch (message.type) {
        case MSG.ELEMENT_CAPTURED:
          this.onElementCaptured(message.element);
          break;
        case MSG.PAGE_STORED:
          this.onPageStored(message.page);
          break;
        case MSG.LANDMARKS_DETECTED:
          this.onLandmarksDetected(message.landmarks);
          break;
        case MSG.VOICE_INTERIM:
          this.voiceRecorder?.showInterim(message.text);
          break;
        case MSG.VOICE_FINAL:
          this.voiceRecorder?.addTranscript(message);
          break;
        case MSG.VOICE_ERROR:
          this.voiceRecorder?.showError(message.error);
          break;
      }
    });
  }

  async send(message) {
    return chrome.runtime.sendMessage(message);
  }

  // ── Tab management ──

  switchTab(tabName) {
    this.activeTab = tabName;

    document.querySelectorAll('.sa-tab').forEach(t => t.classList.remove('sa-tab--active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('sa-tab--active');

    document.querySelectorAll('.sa-tab-panel').forEach(p => p.hidden = true);
    document.getElementById(`tab-${tabName}`).hidden = false;

    // Refresh data when switching tabs
    if (tabName === 'elements') this.elementList?.refresh();
    if (tabName === 'voice') this.voiceRecorder?.refresh();
    if (tabName === 'export') this.exportPanel?.refresh();
  }

  // ── Project management ──

  async createProject() {
    const name = document.getElementById('project-name').value.trim();
    const url = document.getElementById('project-url').value.trim();
    if (!name) return;

    const response = await this.send({
      type: MSG.PROJECT_CREATE,
      name,
      sourceUrl: url,
    });

    this.project = response.project;
    this.showMainContent();
    await this.loadData();
  }

  async resetProject() {
    if (!confirm('Start a new project? Current data will be cleared.')) return;
    await this.send({ type: MSG.PROJECT_RESET });
    this.project = null;
    this.showProjectSetup();
  }

  showProjectSetup() {
    document.getElementById('project-setup').hidden = false;
    document.getElementById('main-content').hidden = true;
  }

  showMainContent() {
    document.getElementById('project-setup').hidden = true;
    document.getElementById('main-content').hidden = false;
    this.initComponents();
  }

  // ── Component initialization ──

  initComponents() {
    this.pageTracker = new PageTracker(
      document.getElementById('page-tracker-root'),
      this
    );
    this.elementList = new ElementList(
      document.getElementById('element-list-root'),
      this
    );
    this.voiceRecorder = new VoiceRecorder(
      document.getElementById('voice-recorder-root'),
      this
    );
    this.landmarkSuggestions = new LandmarkSuggestions(
      document.getElementById('landmark-suggestions-root'),
      this
    );
    this.exportPanel = new ExportPanel(
      document.getElementById('export-panel-root'),
      this
    );
  }

  async loadData() {
    const data = await this.send({ type: MSG.DATA_GET_ALL });
    this.state = data.state;

    this.pageTracker?.render(data.pages);
    this.elementList?.render(data.elements, data.screenshots);
    this.voiceRecorder?.render(data.transcripts);
    this.landmarkSuggestions?.render(data.landmarks);

    // Update toolbar button states
    this.updateToolbarState();
  }

  updateToolbarState() {
    const inspectorBtn = document.getElementById('btn-inspector');
    const micBtn = document.getElementById('btn-mic');

    if (this.state?.inspectorActive) {
      inspectorBtn.classList.add('active');
    } else {
      inspectorBtn.classList.remove('active');
    }

    if (this.state?.recordingActive) {
      micBtn.classList.add('active');
    } else {
      micBtn.classList.remove('active');
    }
  }

  // ── Inspector ──

  async toggleInspector() {
    const response = await this.send({ type: MSG.INSPECTOR_TOGGLE });
    this.state = { ...this.state, inspectorActive: response.active };
    this.updateToolbarState();
  }

  // ── Voice ──

  async toggleVoice() {
    if (this.state?.recordingActive) {
      await this.send({ type: MSG.VOICE_STOP });
      this.state.recordingActive = false;
    } else {
      await this.send({ type: MSG.VOICE_START });
      this.state.recordingActive = true;
    }
    this.updateToolbarState();
    this.voiceRecorder?.updateRecordingState(this.state.recordingActive);
  }

  // ── Event handlers ──

  onElementCaptured(element) {
    if (this.activeTab === 'elements') {
      this.elementList?.refresh();
    }
  }

  onPageStored(page) {
    this.pageTracker?.refresh();
  }

  onLandmarksDetected(landmarks) {
    this.landmarkSuggestions?.refresh();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new PanelController();
});
