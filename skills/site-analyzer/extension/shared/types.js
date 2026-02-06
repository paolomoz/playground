/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} sourceUrl
 * @property {number} createdAt
 */

/**
 * @typedef {Object} Page
 * @property {string} id
 * @property {string} url
 * @property {string} path
 * @property {string} title
 * @property {string|null} templateLabel
 * @property {string|null} screenshotId
 * @property {string[]} landmarkIds
 * @property {string[]} elementIds
 * @property {Object} meta - OG tags, description, canonical, etc.
 * @property {number} visitedAt
 */

/**
 * @typedef {Object} CapturedElement
 * @property {string} id
 * @property {string} pageId
 * @property {string} selector
 * @property {string} tagName
 * @property {string} outerHTMLSnippet
 * @property {Object} boundingRect - {x, y, width, height}
 * @property {string|null} screenshotId
 * @property {string} userLabel
 * @property {string} userNotes
 * @property {number} capturedAt
 */

/**
 * @typedef {Object} Landmark
 * @property {string} id
 * @property {string} pageId
 * @property {string} type - header, footer, nav, main, hero, sidebar, section
 * @property {string} selector
 * @property {number} confidence - 0 to 1
 * @property {boolean} confirmed
 * @property {boolean} dismissed
 * @property {number} detectedAt
 */

/**
 * @typedef {Object} Screenshot
 * @property {string} id
 * @property {string} type - 'full-page' | 'element'
 * @property {string} dataUrl
 * @property {Object} dimensions - {width, height}
 * @property {string|null} pageId
 * @property {string|null} elementId
 * @property {number} capturedAt
 */

/**
 * @typedef {Object} Transcript
 * @property {string} id
 * @property {string} text
 * @property {Array<{text: string, timestamp: number}>} rawSegments
 * @property {string|null} pageId
 * @property {string|null} elementId
 * @property {number} startedAt
 * @property {number} endedAt
 */

/**
 * @typedef {Object} RuntimeState
 * @property {boolean} inspectorActive
 * @property {boolean} recordingActive
 * @property {string|null} currentPageId
 * @property {string[]} templateLabels
 */
