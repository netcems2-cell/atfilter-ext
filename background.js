// @Filter Signal Engine — Background Service Worker
'use strict';

const FLUSH_INTERVAL_MINUTES = 5;
const LICENSE_CHECK_MINUTES = 1440; // 24 hours
const MAX_QUEUE_SIZE = 500;
const FREE_KEYWORD_LIMIT = 5;
const INGEST_URL = 'https://atfilter.com/api/ingest/events';
const VALIDATE_URL = 'https://atfilter.com/api/license/validate';

// --- Event queues ---
let keywordEvents = [];
let suppressionEvents = [];

// --- On install: generate anonymous user ID ---
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      anon_user_id: crypto.randomUUID(),
      install_ts: new Date().toISOString(),
      telemetry_enabled: false,
      session_id: crypto.randomUUID(),
    });
  }
  // Set up periodic flush alarm
  chrome.alarms.create('flushEvents', { periodInMinutes: FLUSH_INTERVAL_MINUTES });
  chrome.alarms.create('validateLicense', { periodInMinutes: LICENSE_CHECK_MINUTES });
});

// Ensure alarms exist on startup
chrome.alarms.get('flushEvents', (alarm) => {
  if (!alarm) {
    chrome.alarms.create('flushEvents', { periodInMinutes: FLUSH_INTERVAL_MINUTES });
  }
});
chrome.alarms.get('validateLicense', (alarm) => {
  if (!alarm) {
    chrome.alarms.create('validateLicense', { periodInMinutes: LICENSE_CHECK_MINUTES });
  }
});

// --- Message listener: accept events from content.js / popup.js ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'keyword_event' && msg.data) {
    if (keywordEvents.length < MAX_QUEUE_SIZE) {
      keywordEvents.push(msg.data);
    }
    sendResponse({ queued: true });
  } else if (msg.type === 'suppression_event' && msg.data) {
    if (suppressionEvents.length < MAX_QUEUE_SIZE) {
      suppressionEvents.push(msg.data);
    }
    sendResponse({ queued: true });
  }
  return true;
});

// --- Alarm handler: flush queued events + license check ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'flushEvents') {
    flushEvents();
  } else if (alarm.name === 'validateLicense') {
    revalidateLicense();
  }
});

async function flushEvents() {
  // Check if telemetry is enabled
  const storage = await chrome.storage.local.get([
    'telemetry_enabled',
    'anon_user_id',
    'session_id',
  ]);

  if (!storage.telemetry_enabled) return;
  if (!storage.anon_user_id) return;
  if (keywordEvents.length === 0 && suppressionEvents.length === 0) return;

  // Snapshot and clear queues
  const kwBatch = keywordEvents.splice(0, keywordEvents.length);
  const supBatch = suppressionEvents.splice(0, suppressionEvents.length);

  const manifest = chrome.runtime.getManifest();

  const payload = {
    anon_user_id: storage.anon_user_id,
    client_version: manifest.version,
    browser_family: detectBrowser(),
    session_id: storage.session_id || undefined,
    keyword_events: kwBatch,
    suppression_events: supBatch,
  };

  // Fire-and-forget POST
  try {
    await fetch(INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Network error — re-queue events for next flush
    keywordEvents.unshift(...kwBatch);
    suppressionEvents.unshift(...supBatch);
    // Trim to max queue size
    if (keywordEvents.length > MAX_QUEUE_SIZE) keywordEvents.length = MAX_QUEUE_SIZE;
    if (suppressionEvents.length > MAX_QUEUE_SIZE) suppressionEvents.length = MAX_QUEUE_SIZE;
  }
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Firefox/')) return 'firefox';
  if (ua.includes('Chrome/')) return 'chrome';
  return 'other';
}

// --- License revalidation ---
async function revalidateLicense() {
  const storage = await chrome.storage.local.get(['licenseKey', 'isPro']);
  if (!storage.isPro || !storage.licenseKey) return;

  try {
    const res = await fetch(VALIDATE_URL + '?key=' + encodeURIComponent(storage.licenseKey));
    const result = await res.json();

    if (result.valid) {
      await chrome.storage.local.set({ licenseValidatedAt: Date.now() });
    } else {
      // License no longer valid — downgrade to Free
      await chrome.storage.local.set({
        isPro: false,
        licenseTier: null,
        licenseValidatedAt: null,
      });
      // Trim keywords to Free limit
      const kwStorage = await chrome.storage.local.get(['filterKeywords']);
      const keywords = kwStorage.filterKeywords || [];
      if (keywords.length > FREE_KEYWORD_LIMIT) {
        await chrome.storage.local.set({
          filterKeywords: keywords.slice(0, FREE_KEYWORD_LIMIT),
        });
      }
    }
  } catch {
    // Network error — keep current state, try again next cycle
  }
}
