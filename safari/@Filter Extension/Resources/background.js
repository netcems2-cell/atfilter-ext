// @Filter Signal Engine — Background Script (Safari)
'use strict';

const FLUSH_INTERVAL_MINUTES = 5;
const MAX_QUEUE_SIZE = 500;
const INGEST_URL = 'https://atfilter.com/api/ingest/events';

// --- Event queues ---
let keywordEvents = [];
let suppressionEvents = [];

// --- On install: generate anonymous user ID + open onboarding ---
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.storage.local.set({
      anon_user_id: crypto.randomUUID(),
      install_ts: new Date().toISOString(),
      telemetry_enabled: false,
      session_id: crypto.randomUUID(),
    });
    // Open onboarding on first install
    browser.storage.local.get(['onboarding_complete']).then((result) => {
      if (!result.onboarding_complete) {
        browser.tabs.create({ url: browser.runtime.getURL('onboarding.html') });
      }
    });
    updateIconState();
  }
  // Start periodic flush via setTimeout (Safari does not reliably support alarms on iOS)
  scheduleFlush();
});

// Set icon state on startup (background script restart)
updateIconState();

// Start periodic flush on startup
scheduleFlush();

// --- Self-rescheduling setTimeout flush (replaces chrome.alarms) ---
let flushTimerId = null;

function scheduleFlush() {
  if (flushTimerId) clearTimeout(flushTimerId);
  flushTimerId = setTimeout(async () => {
    await flushEvents();
    scheduleFlush(); // re-schedule for next interval
  }, FLUSH_INTERVAL_MINUTES * 60 * 1000);
}

// --- Consent helper ---
async function checkConsent() {
  const result = await browser.storage.local.get(['consent_given', 'data_collection_active']);
  return result.consent_given === true && result.data_collection_active !== false;
}

// --- Icon state: grey out when inactive, full colour when active ---
const ICONS_ACTIVE = { 16: 'images/icon-16.png', 48: 'images/icon-48.png', 128: 'images/icon-128.png' };
const ICONS_INACTIVE = { 16: 'images/icon-16-inactive.png', 48: 'images/icon-48-inactive.png', 128: 'images/icon-128-inactive.png' };

async function updateIconState() {
  const active = await checkConsent();
  browser.action.setIcon({ path: active ? ICONS_ACTIVE : ICONS_INACTIVE });
  browser.action.setTitle({ title: active ? '@Filter\u2122' : '@Filter\u2122 \u2014 disconnected (enable community participation to reconnect)' });
}

// --- Message listener: accept events from content.js / popup.js / onboarding / settings ---
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
  } else if (msg.type === 'startDataCollection') {
    browser.storage.local.set({ data_collection_active: true, telemetry_enabled: true }).then(updateIconState);
    sendResponse({ ok: true });
  } else if (msg.type === 'stopDataCollection') {
    browser.storage.local.set({ data_collection_active: false, telemetry_enabled: false }).then(updateIconState);
    sendResponse({ ok: true });
  }
  return true;
});

async function flushEvents() {
  // Check if telemetry is enabled and consent is active
  const storage = await browser.storage.local.get([
    'telemetry_enabled',
    'anon_user_id',
    'session_id',
    'consent_given',
    'data_collection_active',
  ]);

  if (!storage.telemetry_enabled) return;
  // Guard: require active consent before sending telemetry
  if (storage.consent_given !== true || storage.data_collection_active === false) return;
  if (!storage.anon_user_id) return;
  if (keywordEvents.length === 0 && suppressionEvents.length === 0) return;

  // Snapshot and clear queues
  const kwBatch = keywordEvents.splice(0, keywordEvents.length);
  const supBatch = suppressionEvents.splice(0, suppressionEvents.length);

  const manifest = browser.runtime.getManifest();

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
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'safari';
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Firefox/')) return 'firefox';
  if (ua.includes('Chrome/')) return 'chrome';
  return 'other';
}
