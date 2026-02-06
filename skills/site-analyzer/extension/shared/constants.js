/**
 * Message types for communication between extension contexts.
 */
const MSG = {
  // Inspector
  INSPECTOR_TOGGLE: 'inspector:toggle',
  INSPECTOR_STATE: 'inspector:state',
  ELEMENT_HOVERED: 'element:hovered',
  ELEMENT_SELECTED: 'element:selected',
  ELEMENT_CAPTURED: 'element:captured',
  ELEMENT_LABEL_UPDATE: 'element:label-update',
  ELEMENT_NOTES_UPDATE: 'element:notes-update',
  ELEMENT_DELETE: 'element:delete',

  // Page tracking
  PAGE_DETECTED: 'page:detected',
  PAGE_STORED: 'page:stored',
  PAGE_TEMPLATE_UPDATE: 'page:template-update',

  // Screenshots
  SCREENSHOT_CAPTURE: 'screenshot:capture',
  SCREENSHOT_CROP: 'screenshot:crop',
  SCREENSHOT_CROPPED: 'screenshot:cropped',
  SCREENSHOT_STORED: 'screenshot:stored',

  // DOM landmarks
  LANDMARKS_DETECTED: 'landmarks:detected',
  LANDMARK_CONFIRM: 'landmark:confirm',
  LANDMARK_DISMISS: 'landmark:dismiss',

  // Voice
  VOICE_START: 'voice:start',
  VOICE_STOP: 'voice:stop',
  VOICE_INTERIM: 'voice:interim',
  VOICE_FINAL: 'voice:final',
  VOICE_STATE: 'voice:state',
  VOICE_ERROR: 'voice:error',

  // Export
  EXPORT_REQUEST: 'export:request',
  EXPORT_READY: 'export:ready',

  // Project
  PROJECT_CREATE: 'project:create',
  PROJECT_RESET: 'project:reset',
  PROJECT_GET: 'project:get',

  // Data queries
  DATA_GET_ALL: 'data:get-all',
  DATA_RESPONSE: 'data:response',

  // State
  STATE_GET: 'state:get',
  STATE_UPDATE: 'state:update',
};

/**
 * Storage keys for chrome.storage.local.
 */
const STORAGE_KEYS = {
  PROJECT: 'sa_project',
  PAGES: 'sa_pages',
  ELEMENTS: 'sa_elements',
  LANDMARKS: 'sa_landmarks',
  SCREENSHOTS: 'sa_screenshots',
  TRANSCRIPTS: 'sa_transcripts',
  STATE: 'sa_state',
};

/**
 * Default runtime state.
 */
const DEFAULT_STATE = {
  inspectorActive: false,
  recordingActive: false,
  currentPageId: null,
  templateLabels: ['Homepage', 'Article', 'Product', 'Landing Page', 'Category', 'Contact', 'Other'],
};

/**
 * Landmark types with display labels.
 */
const LANDMARK_TYPES = {
  HEADER: { type: 'header', label: 'Header' },
  FOOTER: { type: 'footer', label: 'Footer' },
  NAV: { type: 'nav', label: 'Navigation' },
  MAIN: { type: 'main', label: 'Main Content' },
  HERO: { type: 'hero', label: 'Hero Section' },
  SIDEBAR: { type: 'sidebar', label: 'Sidebar' },
  SECTION: { type: 'section', label: 'Content Section' },
};

const EXTENSION_VERSION = '1.0.0';
