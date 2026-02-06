/* global MSG */

// ─── Canvas cropping ────────────────────────────────────────────────

function cropImage(dataUrl, rect) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('crop-canvas');
      const ctx = canvas.getContext('2d');

      // Use viewport-relative coordinates
      const x = rect.viewportX ?? rect.x;
      const y = rect.viewportY ?? rect.y;
      const width = rect.width;
      const height = rect.height;

      // captureVisibleTab captures at device pixel ratio; use the image's
      // natural size vs the viewport dimensions passed in the rect to derive scale
      const viewportWidth = rect.viewportWidth || img.naturalWidth;
      const viewportHeight = rect.viewportHeight || img.naturalHeight;
      const scaleX = img.naturalWidth / viewportWidth;
      const scaleY = img.naturalHeight / viewportHeight;

      canvas.width = width * scaleX;
      canvas.height = height * scaleY;

      ctx.drawImage(
        img,
        x * scaleX, y * scaleY,
        width * scaleX, height * scaleY,
        0, 0,
        canvas.width, canvas.height
      );

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image for cropping'));
    img.src = dataUrl;
  });
}

// ─── SpeechRecognition ──────────────────────────────────────────────

let recognition = null;
let recordingStartedAt = null;
let segments = [];

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    chrome.runtime.sendMessage({
      type: MSG.VOICE_ERROR,
      error: 'SpeechRecognition not available',
    });
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recordingStartedAt = Date.now();
  segments = [];

  recognition.onresult = (event) => {
    let interim = '';
    let finalText = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript;
        segments.push({ text: transcript, timestamp: Date.now() });
      } else {
        interim += transcript;
      }
    }

    if (interim) {
      chrome.runtime.sendMessage({ type: MSG.VOICE_INTERIM, text: interim });
    }

    if (finalText) {
      chrome.runtime.sendMessage({
        type: MSG.VOICE_FINAL,
        text: finalText,
        segments,
        startedAt: recordingStartedAt,
      });
      segments = [];
      recordingStartedAt = Date.now();
    }
  };

  recognition.onerror = (event) => {
    if (event.error !== 'aborted') {
      chrome.runtime.sendMessage({
        type: MSG.VOICE_ERROR,
        error: `Speech error: ${event.error}`,
      });
    }
  };

  recognition.onend = () => {
    // Auto-restart if still supposed to be recording
    chrome.runtime.sendMessage({ type: MSG.VOICE_STATE, active: false });
  };

  recognition.start();
  chrome.runtime.sendMessage({ type: MSG.VOICE_STATE, active: true });
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

// ─── Message listener ───────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MSG.SCREENSHOT_CROP:
      cropImage(message.dataUrl, message.rect)
        .then(croppedDataUrl => {
          chrome.runtime.sendMessage({
            type: MSG.SCREENSHOT_CROPPED,
            requestId: message.requestId,
            croppedDataUrl,
          });
        })
        .catch(err => {
          console.error('Crop error:', err);
        });
      break;

    case MSG.VOICE_START:
      if (message.forward) startRecognition();
      break;

    case MSG.VOICE_STOP:
      if (message.forward) stopRecognition();
      break;
  }
});
