/* eslint-env serviceworker */
importScripts('../shared/constants.js', '../shared/utils.js');

// ─── Side Panel setup ───────────────────────────────────────────────
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// ─── Storage helpers ────────────────────────────────────────────────

async function storageGet(key) {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? null;
}

async function storageSet(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

async function getState() {
  return (await storageGet(STORAGE_KEYS.STATE)) || { ...DEFAULT_STATE };
}

async function updateState(patch) {
  const state = await getState();
  const next = { ...state, ...patch };
  await storageSet(STORAGE_KEYS.STATE, next);
  return next;
}

async function getCollection(key) {
  return (await storageGet(key)) || [];
}

async function addToCollection(key, item) {
  const items = await getCollection(key);
  items.push(item);
  await storageSet(key, items);
  return item;
}

async function updateInCollection(key, id, patch) {
  const items = await getCollection(key);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  await storageSet(key, items);
  return items[idx];
}

async function removeFromCollection(key, id) {
  const items = await getCollection(key);
  const filtered = items.filter(i => i.id !== id);
  await storageSet(key, filtered);
}

// ─── Offscreen document management ─────────────────────────────────

let offscreenCreating = null;

async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });
  if (existingContexts.length > 0) return;

  if (offscreenCreating) {
    await offscreenCreating;
    return;
  }

  offscreenCreating = chrome.offscreen.createDocument({
    url: 'offscreen/offscreen.html',
    reasons: ['USER_MEDIA', 'DOM_PARSER'],
    justification: 'SpeechRecognition for voice transcription and canvas for image cropping',
  });
  await offscreenCreating;
  offscreenCreating = null;
}

// ─── Screenshot capture ─────────────────────────────────────────────

async function captureScreenshot(tabId, pageId) {
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });

  const screenshot = {
    id: generateId(),
    type: 'full-page',
    dataUrl,
    dimensions: null, // Will be set from offscreen if needed
    pageId,
    elementId: null,
    capturedAt: Date.now(),
  };

  await addToCollection(STORAGE_KEYS.SCREENSHOTS, screenshot);
  return screenshot;
}

async function cropElementScreenshot(fullDataUrl, rect, pageId, elementId) {
  await ensureOffscreenDocument();

  return new Promise((resolve) => {
    const requestId = generateId();

    const handler = (message) => {
      if (message.type === MSG.SCREENSHOT_CROPPED && message.requestId === requestId) {
        chrome.runtime.onMessage.removeListener(handler);

        const screenshot = {
          id: generateId(),
          type: 'element',
          dataUrl: message.croppedDataUrl,
          dimensions: { width: rect.width, height: rect.height },
          pageId,
          elementId,
          capturedAt: Date.now(),
        };

        addToCollection(STORAGE_KEYS.SCREENSHOTS, screenshot).then(() => resolve(screenshot));
      }
    };

    chrome.runtime.onMessage.addListener(handler);
    chrome.runtime.sendMessage({
      type: MSG.SCREENSHOT_CROP,
      requestId,
      dataUrl: fullDataUrl,
      rect,
    });
  });
}

// ─── Message router ─────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // keep channel open for async response
});

async function handleMessage(message, sender) {
  switch (message.type) {

    // ── Project ──
    case MSG.PROJECT_CREATE: {
      const project = {
        id: generateId(),
        name: message.name || 'Untitled Project',
        sourceUrl: message.sourceUrl || '',
        createdAt: Date.now(),
      };
      await storageSet(STORAGE_KEYS.PROJECT, project);
      // Reset collections
      await storageSet(STORAGE_KEYS.PAGES, []);
      await storageSet(STORAGE_KEYS.ELEMENTS, []);
      await storageSet(STORAGE_KEYS.LANDMARKS, []);
      await storageSet(STORAGE_KEYS.SCREENSHOTS, []);
      await storageSet(STORAGE_KEYS.TRANSCRIPTS, []);
      await storageSet(STORAGE_KEYS.STATE, { ...DEFAULT_STATE });
      return { success: true, project };
    }

    case MSG.PROJECT_GET: {
      const project = await storageGet(STORAGE_KEYS.PROJECT);
      return { project };
    }

    case MSG.PROJECT_RESET: {
      await chrome.storage.local.clear();
      return { success: true };
    }

    // ── State ──
    case MSG.STATE_GET:
      return { state: await getState() };

    case MSG.STATE_UPDATE:
      return { state: await updateState(message.patch) };

    // ── Inspector toggle ──
    case MSG.INSPECTOR_TOGGLE: {
      const state = await getState();
      const next = !state.inspectorActive;
      await updateState({ inspectorActive: next });
      // Forward to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: MSG.INSPECTOR_STATE, active: next });
      }
      return { active: next };
    }

    // ── Page detection ──
    case MSG.PAGE_DETECTED: {
      const pages = await getCollection(STORAGE_KEYS.PAGES);
      const normalized = normalizeUrl(message.url);
      const existing = pages.find(p => normalizeUrl(p.url) === normalized);

      if (existing) {
        await updateState({ currentPageId: existing.id });
        return { page: existing, isNew: false };
      }

      const page = {
        id: generateId(),
        url: message.url,
        path: getUrlPath(message.url),
        title: message.title || '',
        templateLabel: null,
        screenshotId: null,
        landmarkIds: [],
        elementIds: [],
        meta: message.meta || {},
        visitedAt: Date.now(),
      };

      await addToCollection(STORAGE_KEYS.PAGES, page);
      await updateState({ currentPageId: page.id });

      // Auto-capture full-page screenshot
      try {
        const tabId = sender.tab?.id;
        if (tabId) {
          const screenshot = await captureScreenshot(tabId, page.id);
          await updateInCollection(STORAGE_KEYS.PAGES, page.id, { screenshotId: screenshot.id });
          page.screenshotId = screenshot.id;
        }
      } catch (err) {
        console.warn('Auto-screenshot failed:', err);
      }

      // Notify side panel of new page
      chrome.runtime.sendMessage({ type: MSG.PAGE_STORED, page }).catch(() => {});

      return { page, isNew: true };
    }

    // ── Page template update ──
    case MSG.PAGE_TEMPLATE_UPDATE: {
      const updated = await updateInCollection(STORAGE_KEYS.PAGES, message.pageId, {
        templateLabel: message.templateLabel,
      });
      return { page: updated };
    }

    // ── Element selection ──
    case MSG.ELEMENT_SELECTED: {
      const state = await getState();
      const pageId = state.currentPageId;
      if (!pageId) return { error: 'No current page' };

      const element = {
        id: generateId(),
        pageId,
        selector: message.selector,
        tagName: message.tagName,
        outerHTMLSnippet: message.outerHTMLSnippet,
        boundingRect: message.boundingRect,
        screenshotId: null,
        userLabel: '',
        userNotes: '',
        capturedAt: Date.now(),
      };

      await addToCollection(STORAGE_KEYS.ELEMENTS, element);

      // Link element to its page
      const pages = await getCollection(STORAGE_KEYS.PAGES);
      const pg = pages.find(p => p.id === pageId);
      if (pg) {
        await updateInCollection(STORAGE_KEYS.PAGES, pageId, {
          elementIds: [...pg.elementIds, element.id],
        });
      }

      // Capture element screenshot
      try {
        const tabId = sender.tab?.id;
        if (tabId) {
          const fullScreenshot = await captureScreenshot(tabId, pageId);
          const cropped = await cropElementScreenshot(
            fullScreenshot.dataUrl,
            message.boundingRect,
            pageId,
            element.id
          );
          await updateInCollection(STORAGE_KEYS.ELEMENTS, element.id, {
            screenshotId: cropped.id,
          });
          element.screenshotId = cropped.id;
        }
      } catch (err) {
        console.warn('Element screenshot failed:', err);
      }

      // Notify side panel of new element
      chrome.runtime.sendMessage({ type: MSG.ELEMENT_CAPTURED, element }).catch(() => {});

      return { element };
    }

    case MSG.ELEMENT_LABEL_UPDATE: {
      const updated = await updateInCollection(STORAGE_KEYS.ELEMENTS, message.elementId, {
        userLabel: message.label,
      });
      return { element: updated };
    }

    case MSG.ELEMENT_NOTES_UPDATE: {
      const updated = await updateInCollection(STORAGE_KEYS.ELEMENTS, message.elementId, {
        userNotes: message.notes,
      });
      return { element: updated };
    }

    case MSG.ELEMENT_DELETE: {
      await removeFromCollection(STORAGE_KEYS.ELEMENTS, message.elementId);
      return { success: true };
    }

    // ── Landmarks ──
    case MSG.LANDMARKS_DETECTED: {
      const state = await getState();
      const pageId = state.currentPageId;
      if (!pageId) return { error: 'No current page' };

      const landmarks = message.landmarks.map(lm => ({
        id: generateId(),
        pageId,
        type: lm.type,
        selector: lm.selector,
        confidence: lm.confidence,
        confirmed: false,
        dismissed: false,
        detectedAt: Date.now(),
      }));

      const existing = await getCollection(STORAGE_KEYS.LANDMARKS);
      const pageExisting = existing.filter(l => l.pageId === pageId);
      // Only add if we haven't already detected landmarks for this page
      if (pageExisting.length === 0) {
        const all = [...existing, ...landmarks];
        await storageSet(STORAGE_KEYS.LANDMARKS, all);
        const landmarkIds = landmarks.map(l => l.id);
        await updateInCollection(STORAGE_KEYS.PAGES, pageId, { landmarkIds });
      }
      return { success: true, count: landmarks.length };
    }

    case MSG.LANDMARK_CONFIRM: {
      const updated = await updateInCollection(STORAGE_KEYS.LANDMARKS, message.landmarkId, {
        confirmed: true,
        dismissed: false,
      });
      return { landmark: updated };
    }

    case MSG.LANDMARK_DISMISS: {
      const updated = await updateInCollection(STORAGE_KEYS.LANDMARKS, message.landmarkId, {
        dismissed: true,
        confirmed: false,
      });
      return { landmark: updated };
    }

    // ── Voice ──
    case MSG.VOICE_START: {
      await ensureOffscreenDocument();
      chrome.runtime.sendMessage({ type: MSG.VOICE_START, forward: true });
      await updateState({ recordingActive: true });
      return { success: true };
    }

    case MSG.VOICE_STOP: {
      chrome.runtime.sendMessage({ type: MSG.VOICE_STOP, forward: true });
      await updateState({ recordingActive: false });
      return { success: true };
    }

    case MSG.VOICE_FINAL: {
      const state = await getState();
      const transcript = {
        id: generateId(),
        text: message.text,
        rawSegments: message.segments || [],
        pageId: state.currentPageId,
        elementId: message.elementId || null,
        startedAt: message.startedAt || Date.now(),
        endedAt: Date.now(),
      };
      await addToCollection(STORAGE_KEYS.TRANSCRIPTS, transcript);
      return { transcript };
    }

    // ── Data queries ──
    case MSG.DATA_GET_ALL: {
      const [project, pages, elements, landmarks, screenshots, transcripts, currentState] =
        await Promise.all([
          storageGet(STORAGE_KEYS.PROJECT),
          getCollection(STORAGE_KEYS.PAGES),
          getCollection(STORAGE_KEYS.ELEMENTS),
          getCollection(STORAGE_KEYS.LANDMARKS),
          getCollection(STORAGE_KEYS.SCREENSHOTS),
          getCollection(STORAGE_KEYS.TRANSCRIPTS),
          getState(),
        ]);
      return { project, pages, elements, landmarks, screenshots, transcripts, state: currentState };
    }

    // ── Export ──
    case MSG.EXPORT_REQUEST: {
      const data = await handleMessage({ type: MSG.DATA_GET_ALL });
      return { type: MSG.EXPORT_READY, data };
    }

    // ── Pass-through: messages handled by dedicated listeners or the panel directly ──
    case MSG.SCREENSHOT_CROPPED:
    case MSG.VOICE_INTERIM:
    case MSG.VOICE_STATE:
    case MSG.VOICE_ERROR:
    case MSG.ELEMENT_CAPTURED:
    case MSG.PAGE_STORED:
      return; // no response needed from the central router

    default:
      return; // silently ignore unknown types
  }
}

// ─── Web Navigation listener ────────────────────────────────────────

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only top frame

  const project = await storageGet(STORAGE_KEYS.PROJECT);
  if (!project) return; // No active project

  // Ignore chrome:// and extension pages
  if (details.url.startsWith('chrome') || details.url.startsWith('about:')) return;
});
